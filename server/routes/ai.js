import express from 'express';
import { store } from '../store.js';
import { parseInvoicePrompt } from '../engine/nlp.js';
import { scoreDelinquencyRisk } from '../engine/recoveryRisk.js';
import { buildEscalationDrafts } from '../engine/escalation.js';

const router = express.Router();

const sendError = (res, code, message) => res.status(code).json({ error: { message, status: code } });

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

// Recovery strategy per risk tier.
const STRATEGIES = {
  Critical: 'Escalate: send a final notice with a firm payment deadline and pause new work until settled.',
  High: 'Call the client directly, then follow up in writing with a firm payment date.',
  Moderate: 'Send a friendly payment reminder with the payment link.',
  Low: 'Send a courteous nudge; no escalation needed.',
};

// Server "today" at UTC midnight, matching store.js (toISOString-based dates).
const todayUtcMs = () => Date.parse(`${new Date().toISOString().split('T')[0]}T00:00:00Z`);

// Whole UTC days past due; NaN when due_date is missing or malformed.
const daysPastDueOf = (inv) =>
  DATE_PATTERN.test(inv.due_date ?? '')
    ? Math.round((todayUtcMs() - Date.parse(`${inv.due_date}T00:00:00Z`)) / DAY_MS)
    : NaN;

const isOverdueUnpaid = (inv) => inv.status !== 'paid' && daysPastDueOf(inv) > 0 && Number(inv.amount) > 0;

router.post('/parse', (req, res) => {
  const { prompt } = req.body ?? {};
  if (typeof prompt !== 'string' || !prompt.trim()) return sendError(res, 400, 'prompt is required');
  const parsed = parseInvoicePrompt(prompt, store.getClients());
  if (!parsed) return sendError(res, 400, 'Could not parse prompt');
  res.json({ parsed });
});

// Body: { invoiceId } or { invoiceNumber } (invoiceId wins if both are given).
router.post('/recovery-copilot', (req, res) => {
  const { invoiceId, invoiceNumber, customNotes } = req.body ?? {};
  const idValue = typeof invoiceId === 'string' ? invoiceId.trim() : '';
  const numberValue = typeof invoiceNumber === 'string' ? invoiceNumber.trim() : '';
  if (!idValue && !numberValue) return sendError(res, 400, 'invoiceId or invoiceNumber is required');
  if (customNotes !== undefined && typeof customNotes !== 'string') {
    return sendError(res, 400, 'customNotes must be a string');
  }
  const trimmedNotes = typeof customNotes === 'string' ? customNotes.trim() : '';
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
  // Relative link: portal.js exposes only POST /api/portal/:id/pay and builds no URL,
  // so the portal link is the path /portal/{invoiceId}.
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
    daysPastDue,
    money,
    clientName,
    portalLink,
    businessName: profile.business_name || '',
    customNotes: trimmedNotes,
  });

  res.json({
    risk,
    strategy: STRATEGIES[risk.tier],
    draft: {
      text,
      invoiceNumbers: overdueInvoices.map((inv) => inv.invoice_number),
      totalPrincipal,
      dueDates: overdueInvoices.map((inv) => inv.due_date),
      portalLink,
    },
    escalations,
    customNotes: trimmedNotes,
    client: { name: clientName, phone: client?.phone || invoice.client_phone || '' },
  });
});

export default router;
