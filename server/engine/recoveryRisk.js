// Delinquency risk scoring for overdue invoices.
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
