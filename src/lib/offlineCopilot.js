import { recoveryCopilot } from './api.js';
import { getInvoices, getClients, getProfile, isGuestProfile } from './dataService.js';
import { scoreDelinquencyRisk } from '../../server/engine/recoveryRisk.js';
import { buildEscalationDrafts } from '../../server/engine/escalation.js';

// Mirrors STRATEGIES in server/routes/ai.js (not exported there).
const STRATEGIES = {
  Critical: 'Escalate: send a final notice with a firm payment deadline and pause new work until settled.',
  High: 'Call the client directly, then follow up in writing with a firm payment date.',
  Moderate: 'Send a friendly payment reminder with the payment link.',
  Low: 'Send a courteous nudge; no escalation needed.',
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

// Mirrors the day-count helpers in server/routes/ai.js (UTC midnight "today").
const todayUtcMs = (today = new Date()) => Date.parse(`${today.toISOString().split('T')[0]}T00:00:00Z`);
const daysPastDueOf = (inv, today) =>
  DATE_PATTERN.test(inv.due_date ?? '')
    ? Math.round((todayUtcMs(today) - Date.parse(`${inv.due_date}T00:00:00Z`)) / DAY_MS)
    : NaN;
const isOverdueUnpaid = (inv, today) => inv.status !== 'paid' && daysPastDueOf(inv, today) > 0 && Number(inv.amount) > 0;

// Local equivalent of POST /api/ai/recovery-copilot. Returns the same response shape the modal reads.
export function computeOfflineCopilot({ invoice, invoices, clients, profile, customNotes = '', settlement = {}, today }) {
  if (invoice.status === 'paid') throw new Error('Invoice is already paid');
  if (!(Number(invoice.amount) > 0)) throw new Error('Invoice has no valid amount');
  const daysPastDue = daysPastDueOf(invoice, today);
  if (Number.isNaN(daysPastDue)) throw new Error('Invoice has no valid due_date');
  if (daysPastDue <= 0) throw new Error('Invoice is not overdue');

  const client = clients.find((c) => c.id === invoice.client_id);
  const avgDelayDays = client?.avg_delay_days || 0;
  const overdueInvoices = [invoice, ...invoices.filter((inv) => inv.id !== invoice.id)]
    .filter((inv) => inv.id === invoice.id || (invoice.client_id && inv.client_id === invoice.client_id && isOverdueUnpaid(inv, today)))
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  const overdueTotal = overdueInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const totalPrincipal = Math.round(overdueTotal * 100) / 100;
  const risk = scoreDelinquencyRisk({ daysPastDue, avgDelayDays, overdueTotal });

  const money = (n) => `${profile?.currency || ''}${Number(n).toFixed(2)}`;
  const clientName = client?.name || invoice.client_name || 'there';
  const portalLink = `/portal/${invoice.id}`;
  const trimmedNotes = customNotes.trim();
  const escalations = buildEscalationDrafts({
    invoices: overdueInvoices,
    totalPrincipal,
    daysPastDue: Math.max(...overdueInvoices.map((inv) => daysPastDueOf(inv, today))),
    money,
    clientName,
    portalLink,
    businessName: profile?.business_name || '',
    customNotes: trimmedNotes,
    settlement: { discount: settlement.discount === true, installments: settlement.installments === true },
    today,
  });

  return {
    risk,
    strategy: STRATEGIES[risk.tier],
    draft: { portalLink },
    escalations,
    customNotes: trimmedNotes,
    client: { name: clientName, phone: client?.phone || invoice.client_phone || '' },
  };
}

// Server first; computes locally in guest mode or when the server is unreachable (fetch TypeError).
// Resolves to { data, local } where local=true means the drafts were generated on the client.
export async function fetchRecoveryCopilot({ invoice, customNotes = '', settlement = {} }) {
  const flags = { discount: settlement.discount === true, installments: settlement.installments === true };
  if (!isGuestProfile()) {
    try {
      const data = await recoveryCopilot({ invoiceId: invoice.id, customNotes, ...flags });
      return { data, local: false };
    } catch (err) {
      if (!(err instanceof TypeError)) throw err;
    }
  }

  const [invoices, clients, profile] = await Promise.all([getInvoices(), getClients(), getProfile()]);
  const data = computeOfflineCopilot({ invoice, invoices, clients, profile, customNotes, settlement: flags });
  return { data, local: true };
}
