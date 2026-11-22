import assert from 'node:assert/strict';
import { computeOfflineCopilot } from '../src/lib/offlineCopilot.js';

let failed = false;

async function check(name, fn) {
  try {
    await fn();
    console.log(`PASS: ${name}`);
  } catch (err) {
    failed = true;
    console.log(`FAIL: ${name}: ${err.message}`);
  }
}

// Overdue by 9 days at 2024-03-10. Currency is empty so money() renders bare 2-decimal amounts.
const invoice = {
  id: 'inv_offline_test',
  invoice_number: 'INV-OFFLINE-1',
  client_id: 'client_acme',
  client_name: 'Acme Studios',
  amount: 250,
  due_date: '2024-03-01',
  status: 'unpaid',
};
const today = new Date('2024-03-10');
const profile = { id: 'profile_test', business_name: 'Studio', currency: '' };

function run(overrides = {}) {
  return computeOfflineCopilot({
    invoice,
    invoices: [invoice],
    clients: [],
    profile,
    today,
    ...overrides,
  });
}

// seam c: offline copilot escalation drafts and discount/installment math
await check('offline copilot: discount flag adds pay-in-full line with 2% savings', async () => {
  const r = run({ settlement: { discount: true } });
  assert.equal(r.escalations.length, 5);
  const line = 'Pay in full by 2024-03-17 and save 5.00: 245.00 total.';
  for (const d of r.escalations) {
    assert.ok(d.whatsapp.includes(line));
    assert.ok(d.email.body.includes(line));
  }
});

await check('offline copilot: returns risk and strategy without throwing', async () => {
  const r = run({ settlement: { discount: true } });
  assert.equal(typeof r.risk.tier, 'string');
  assert.equal(typeof r.risk.score, 'number');
  assert.equal(typeof r.strategy, 'string');
  assert.ok(r.strategy.length > 0);
});

await check('offline copilot: installments flag adds 125.00 deposit and 125.00 balance line', async () => {
  const r = run({ settlement: { installments: true } });
  assert.equal(r.escalations.length, 5);
  const line = 'Split option: 125.00 deposit now, 125.00 on milestone completion.';
  for (const d of r.escalations) {
    assert.ok(d.whatsapp.includes(line));
    assert.ok(d.email.body.includes(line));
  }
});

await check('offline copilot: guest profile returns non-empty escalations', async () => {
  const r = run({ profile: { id: 'guest_profile', currency: '' } });
  assert.ok(Array.isArray(r.escalations));
  assert.ok(r.escalations.length > 0);
});

process.exitCode = failed ? 1 : 0;
