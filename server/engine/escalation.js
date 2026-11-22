// Escalation message drafts for the recovery copilot.
//
// One draft per tier, in ESCALATION_TIERS order. Each draft has a whatsapp text and an
// email { subject, body }. Tone escalates from a friendly reminder to a formal notice.

import { applyEarlyDiscount, splitInstallments } from './settlement.js';

export const ESCALATION_TIERS = [
  { id: 'friendly_check_in', label: 'Friendly Check-in' },
  { id: 'direct_status_inquiry', label: 'Direct Status Inquiry' },
  { id: 'operational_hold', label: 'Studio Operational Hold' },
  { id: 'settlement_proposal', label: 'Settlement Proposal' },
  { id: 'statutory_notice', label: 'Statutory Legal Notice' },
];

const STATUTE_DAYS = 30;
const STATUTE_LINE =
  'Late payments may accrue statutory interest, and contractor protections under the Freelance Isn\'t Free Act apply.';

const TIER_COPY = {
  friendly_check_in: {
    subject: (ref) => `Friendly reminder: ${ref}`,
    intro: 'Just a friendly reminder that the invoice(s) below are now past due. Let us know if anything is holding up payment.',
  },
  direct_status_inquiry: {
    subject: (ref) => `Payment status request: ${ref}`,
    intro: 'The invoice(s) below are past due. Please reply to confirm the status and give us a firm payment date.',
  },
  operational_hold: {
    subject: (ref) => `Work paused on your account: ${ref}`,
    intro: 'The invoice(s) below remain unpaid, so work on your account is paused until the balance is settled. We will resume as soon as payment is received.',
  },
  settlement_proposal: {
    subject: (ref) => `Settlement proposal: ${ref}`,
    intro: 'To resolve the outstanding balance, we are open to a payment plan. Please reply to confirm whether you would like to settle in instalments or in one payment.',
  },
  statutory_notice: {
    subject: (ref) => `Formal notice of overdue payment: ${ref}`,
    intro: 'This is a formal notice that the invoice(s) below remain unpaid. Please arrange payment promptly.',
  },
};

export function buildEscalationDrafts({
  invoices,
  totalPrincipal,
  daysPastDue,
  money,
  clientName,
  portalLink,
  businessName,
  customNotes,
  settlement = {},
  today,
}) {
  const ref = invoices[0]?.invoice_number || 'your invoice';
  const invoiceLines = invoices.map((inv) => `- ${inv.invoice_number}: ${money(inv.amount)} (due ${inv.due_date})`);
  const trimmedNotes = (customNotes ?? '').trim();
  const settlementLines = [];
  if (settlement.discount === true) {
    const { discountedTotal, savings, expiresOn } = applyEarlyDiscount(totalPrincipal, { today });
    settlementLines.push(`Pay in full by ${expiresOn} and save ${money(savings)}: ${money(discountedTotal)} total.`);
  }
  if (settlement.installments === true) {
    const { deposit, balance } = splitInstallments(totalPrincipal);
    settlementLines.push(`Split option: ${money(deposit)} deposit now, ${money(balance)} on milestone completion.`);
  }

  return ESCALATION_TIERS.map(({ id, label }) => {
    const copy = TIER_COPY[id];
    const includeStatute = id === 'statutory_notice' && daysPastDue >= STATUTE_DAYS;

    const lines = [
      `Hi ${clientName},`,
      '',
      copy.intro,
      ...invoiceLines,
      '',
      `Total outstanding: ${money(totalPrincipal)}`,
      ...settlementLines,
      `Pay securely here: ${portalLink}`,
      ...(includeStatute ? ['', STATUTE_LINE] : []),
      ...(trimmedNotes ? ['', `Note: ${trimmedNotes}`] : []),
      '',
      'Thank you,',
      businessName,
    ];
    const text = lines.join('\n');

    return {
      id,
      label,
      whatsapp: text,
      email: { subject: copy.subject(ref), body: text },
    };
  });
}
