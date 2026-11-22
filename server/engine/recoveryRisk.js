// Delinquency risk scoring and recovery helpers for overdue invoices.
//
// score (0-100) = daysPastDue points + historical lag points + exposure points
//   - days past due: up to 40 pts, linear, capped at 90 days
//   - payment lag (client avg_delay_days): up to 30 pts, 1 pt per day, capped at 30 days
//   - exposure (overdueTotal): up to 30 pts, log10-scaled, saturating at 10,000
//
// tier: Low < 25 <= Moderate < 50 <= High < 75 <= Critical

const MAX_DAYS_PAST_DUE = 90;
const MAX_AVG_DELAY_DAYS = 30;
const MAX_EXPOSURE = 10000;

export const RISK_TIER_CLASSES = {
  Low: 'border-[#22c55e] text-[#22c55e]',
  Moderate: 'border-[#eab308] text-[#eab308]',
  High: 'border-[#f97316] text-[#f97316]',
  Critical: 'border-[#ef4444] text-[#ef4444]',
};

// Recommended recovery strategy descriptions mapped to risk tier
export const RECOVERY_STRATEGIES = {
  Critical: 'Escalate: send a final notice with a firm payment deadline and pause new work until settled.',
  High: 'Call the client directly, then follow up in writing with a firm payment date.',
  Moderate: 'Send a friendly payment reminder with the payment link.',
  Low: 'Send a courteous nudge; no escalation needed.',
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export const todayUtcMs = (today = new Date()) =>
  Date.parse(`${today.toISOString().split('T')[0]}T00:00:00Z`);

export const daysPastDueOf = (inv, today) =>
  DATE_PATTERN.test(inv?.due_date ?? '')
    ? Math.round((todayUtcMs(today) - Date.parse(`${inv.due_date}T00:00:00Z`)) / DAY_MS)
    : NaN;

export const isOverdueUnpaid = (inv, today) =>
  inv?.status !== 'paid' && daysPastDueOf(inv, today) > 0 && Number(inv?.amount) > 0;

const nonNegative = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const tierFor = (score) => {
  if (score >= 75) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 25) return 'Moderate';
  return 'Low';
};

export function scoreDelinquencyRisk({ daysPastDue, avgDelayDays, overdueTotal }) {
  const factors = {
    daysPastDue: nonNegative(daysPastDue),
    avgDelayDays: nonNegative(avgDelayDays),
    overdueTotal: nonNegative(overdueTotal),
  };

  const daysPts = 40 * (Math.min(factors.daysPastDue, MAX_DAYS_PAST_DUE) / MAX_DAYS_PAST_DUE);
  const lagPts = Math.min(factors.avgDelayDays, MAX_AVG_DELAY_DAYS);
  const exposurePts =
    30 * Math.min(1, Math.log10(1 + factors.overdueTotal) / Math.log10(1 + MAX_EXPOSURE));

  const score = Math.round(Math.min(100, daysPts + lagPts + exposurePts));
  return { tier: tierFor(score), score, factors };
}
