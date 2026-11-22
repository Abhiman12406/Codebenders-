// Re-export single source of truth for risk scoring and tier styling from server/engine/recoveryRisk.js
export {
  scoreDelinquencyRisk,
  scoreDelinquencyRisk as getDelinquencyRisk,
  RISK_TIER_CLASSES,
  RECOVERY_STRATEGIES,
  daysPastDueOf,
  isOverdueUnpaid,
} from '../../server/engine/recoveryRisk.js';
