import assert from 'node:assert/strict';
import { scoreDelinquencyRisk } from './engine/recoveryRisk.js';

function check(name, fn) {
  fn();
  console.log(`PASS: ${name}`);
}

check('no risk factors is Low with score 0', () => {
  const r = scoreDelinquencyRisk({ daysPastDue: 0, avgDelayDays: 0, overdueTotal: 0 });
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'Low');
  assert.deepEqual(r.factors, { daysPastDue: 0, avgDelayDays: 0, overdueTotal: 0 });
});

check('maxed factors is Critical with score 100', () => {
  const r = scoreDelinquencyRisk({ daysPastDue: 90, avgDelayDays: 30, overdueTotal: 10000 });
  assert.equal(r.score, 100);
  assert.equal(r.tier, 'Critical');
});

check('days past due is capped at 90', () => {
  const capped = scoreDelinquencyRisk({ daysPastDue: 365, avgDelayDays: 0, overdueTotal: 0 });
  const atCap = scoreDelinquencyRisk({ daysPastDue: 90, avgDelayDays: 0, overdueTotal: 0 });
  assert.equal(capped.score, atCap.score);
  assert.equal(atCap.score, 40);
});

check('tier boundaries: score 24 Low, 25 Moderate, 50 High, 100 Critical', () => {
  // lag contributes 1 point per day up to a 30-point cap; no exposure, no days past due
  assert.equal(scoreDelinquencyRisk({ daysPastDue: 0, avgDelayDays: 24, overdueTotal: 0 }).tier, 'Low');
  assert.equal(scoreDelinquencyRisk({ daysPastDue: 0, avgDelayDays: 25, overdueTotal: 0 }).tier, 'Moderate');
  assert.equal(scoreDelinquencyRisk({ daysPastDue: 0, avgDelayDays: 30, overdueTotal: 0 }).tier, 'Moderate');
  // 45 days past due = 20 pts; + 30 lag pts = 50 (High)
  assert.equal(scoreDelinquencyRisk({ daysPastDue: 45, avgDelayDays: 30, overdueTotal: 0 }).tier, 'High');
  assert.equal(scoreDelinquencyRisk({ daysPastDue: 90, avgDelayDays: 30, overdueTotal: 0 }).tier, 'High');
  assert.equal(scoreDelinquencyRisk({ daysPastDue: 90, avgDelayDays: 30, overdueTotal: 10000 }).tier, 'Critical');
});

check('invalid numeric inputs are treated as 0', () => {
  const r = scoreDelinquencyRisk({ daysPastDue: NaN, avgDelayDays: undefined, overdueTotal: -50 });
  assert.equal(r.score, 0);
  assert.equal(r.tier, 'Low');
});
