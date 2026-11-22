// Client-side mirror of server/engine/recoveryRisk.js: keep thresholds and weights in sync.
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

export function getDelinquencyRisk({ daysPastDue, avgDelayDays, overdueTotal }) {
  const daysPts = 40 * (Math.min(nonNegative(daysPastDue), MAX_DAYS_PAST_DUE) / MAX_DAYS_PAST_DUE);
  const lagPts = Math.min(nonNegative(avgDelayDays), MAX_AVG_DELAY_DAYS);
  const exposurePts =
    30 * Math.min(1, Math.log10(1 + nonNegative(overdueTotal)) / Math.log10(1 + MAX_EXPOSURE));

  const score = Math.round(Math.min(100, daysPts + lagPts + exposurePts));
  return { tier: tierFor(score), score };
}
