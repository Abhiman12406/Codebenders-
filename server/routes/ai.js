import express from 'express';
import { store } from '../store.js';
import { parseInvoicePrompt } from '../engine/nlp.js';
import {
  scoreDelinquencyRisk,
  RECOVERY_STRATEGIES,
  daysPastDueOf,
  isOverdueUnpaid,
} from '../engine/recoveryRisk.js';
import { buildEscalationDrafts } from '../engine/escalation.js';

const router = express.Router();

const sendError = (res, code, message) => res.status(code).json({ error: { message, status: code } });

router.post('/parse', (req, res) => {
  const { prompt } = req.body ?? {};
  if (typeof prompt !== 'string' || !prompt.trim()) return sendError(res, 400, 'prompt is required');
  const parsed = parseInvoicePrompt(prompt, store.getClients());
  if (!parsed) return sendError(res, 400, 'Could not parse prompt');
  res.json({ parsed });
});

// Body: { invoiceId } (or spec { invoice_id }) or { invoiceNumber }.
router.post('/recovery-copilot', (req, res) => {
  const { invoiceId, invoice_id, invoiceNumber, customNotes, custom_instructions, discount, discount_percent, installments } = req.body ?? {};
  const discountFlag = discount === true || Number(discount_percent) === 2;
  const settlement = { discount: discountFlag, installments: installments === true };

  const rawId = invoiceId ?? invoice_id;
  const idValue = typeof rawId === 'string' ? rawId.trim() : '';
  const numberValue = typeof invoiceNumber === 'string' ? invoiceNumber.trim() : '';
  if (!idValue && !numberValue) return sendError(res, 400, 'invoiceId or invoiceNumber is required');

  const rawNotes = customNotes ?? custom_instructions;
  if (rawNotes !== undefined && typeof rawNotes !== 'string') {
    return sendError(res, 400, 'customNotes must be a string');
  }
  const trimmedNotes = typeof rawNotes === 'string' ? rawNotes.trim() : '';
  if (trimmedNotes.length > 500) return sendError(res, 400, 'customNotes must be 500 characters or fewer');

  const invoice = idValue
    ? store.getInvoiceById(idValue)
    : store.getInvoices().find((inv) => inv.invoice_number === numberValue);
  if (!invoice) return sendError(res, 404, 'Invoice not found');
  if (invoice.status === 'paid') return sendError(res, 422, 'Invoice is already paid');
  if (!(Number(invoice.amount) > 0)) return sendError(res, 422, 'Invoice has no valid amount');
  const daysPastDue = daysPastDueOf(invoice);
  if (Number.isNaN(daysPastDue)) return sendError(res, 422, 'Invoice has no valid due_date');
  if (daysPastDue <= 0) return sendError(res, 422, 'Invoice is not overdue');

  const client = store.getClientById(invoice.client_id);
  const avgDelayDays = client?.avg_delay_days || 0;
  // All of this client's overdue unpaid invoices, oldest due first (includes the requested one).
  const overdueInvoices = store
    .getInvoices()
    .filter((inv) => inv.id === invoice.id || (invoice.client_id && inv.client_id === invoice.client_id && isOverdueUnpaid(inv)))
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  const overdueTotal = overdueInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const totalPrincipal = Math.round(overdueTotal * 100) / 100;
  const risk = scoreDelinquencyRisk({ daysPastDue, avgDelayDays, overdueTotal });

  const profile = store.getProfile();
  const money = (n) => `${profile.currency || ''}${Number(n).toFixed(2)}`;
  const clientName = client?.name || invoice.client_name || 'there';
  const portalLink = `/portal/${invoice.id}`;
  const text = [
    `Hi ${clientName},`,
    '',
    'This is a friendly reminder that the following invoice(s) are past due:',
    ...overdueInvoices.map((inv) => `- ${inv.invoice_number}: ${money(inv.amount)} (due ${inv.due_date})`),
    '',
    `Total outstanding: ${money(totalPrincipal)}`,
    '',
    `You can pay securely here: ${portalLink}`,
    '',
    'Thank you,',
    profile.business_name || '',
  ].join('\n');

  const escalations = buildEscalationDrafts({
    invoices: overdueInvoices,
    totalPrincipal,
    daysPastDue: Math.max(...overdueInvoices.map((inv) => daysPastDueOf(inv))),
    money,
    clientName,
    portalLink,
    businessName: profile.business_name || '',
    customNotes: trimmedNotes,
    settlement,
  });

  res.json({
    risk,
    strategy: RECOVERY_STRATEGIES[risk.tier],
    draft: {
      text,
      invoiceNumbers: overdueInvoices.map((inv) => inv.invoice_number),
      totalPrincipal,
      dueDates: overdueInvoices.map((inv) => inv.due_date),
      portalLink,
    },
    escalations,
    customNotes: trimmedNotes,
    settlement,
    client: { name: clientName, phone: client?.phone || invoice.client_phone || '' },
  });
});

// Body: { invoiceId, strategyId, channel } where channel is 'whatsapp', 'email', or 'copy'.
router.post('/outreach-log', (req, res) => {
  const { invoiceId, strategyId, channel } = req.body ?? {};
  if (typeof invoiceId !== 'string' || !invoiceId.trim()) return sendError(res, 400, 'invoiceId is required');
  if (typeof strategyId !== 'string' || !strategyId.trim()) return sendError(res, 400, 'strategyId is required');
  if (channel !== 'whatsapp' && channel !== 'email' && channel !== 'copy') {
    return sendError(res, 400, "channel must be 'whatsapp', 'email', or 'copy'");
  }
  const invoice = store.getInvoiceById(invoiceId.trim());
  if (!invoice) return sendError(res, 404, 'Invoice not found');
  if (!invoice.client_id) {
    return sendError(res, 400, 'Invoice has no client; outreach cannot be logged to a debtor trail');
  }

  const entry = {
    debtorId: invoice.client_id || null,
    invoiceId: invoice.id,
    strategyId: strategyId.trim(),
    channel,
    timestamp: new Date().toISOString(),
  };
  store.logOutreach(entry);
  res.status(201).json({ entry });
});

// Per-debtor outreach audit trail, newest first.
router.get('/outreach-log/:debtorId', (req, res) => {
  res.json({ entries: store.getOutreachLog(req.params.debtorId) });
});

export default router;
