import assert from 'node:assert/strict';
import app from './index.js';

const server = app.listen(0);
await new Promise((resolve) => server.once('listening', resolve));
const port = server.address().port;
const base = `http://localhost:${port}/api`;

async function call(method, path, body) {
  const res = await fetch(base + path, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: res.status, body: json };
}

async function check(name, fn) {
  try {
    await fn();
  } catch (err) {
    console.log(`FAIL: ${name}: ${err.message}`);
    throw err;
  }
  console.log(`PASS: ${name}`);
}

let failed = false;
try {
  await check('health', async () => {
    const r = await call('GET', '/health');
    assert.equal(r.status, 200);
    assert.equal(r.body.status, 'ok');
  });

  await check('invoices list', async () => {
    const r = await call('GET', '/invoices');
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body.invoices));
  });

  await check('portal payment', async () => {
    const list = (await call('GET', '/invoices')).body.invoices;
    let invoice = list.find((i) => i.status !== 'paid');
    if (!invoice) {
      const created = await call('POST', '/invoices', { project_title: 'Test', amount: 100 });
      assert.equal(created.status, 201);
      invoice = created.body;
    }
    const profile = await call('GET', '/profile');
    const cashBefore = profile.body.starting_cash;

    const paid = await call('POST', `/portal/${invoice.id}/pay`);
    assert.equal(paid.status, 200);
    assert.equal(paid.body.invoice.status, 'paid');
    assert.equal(paid.body.cash_balance, cashBefore + invoice.amount);

    const again = await call('POST', `/portal/${invoice.id}/pay`);
    assert.equal(again.status, 409);
  });

  await check('forecast', async () => {
    const r = await call('GET', '/forecast');
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body.dailyPoints));
    assert.equal(r.body.horizonDays, 30);
  });

  await check('triage', async () => {
    const r = await call('GET', '/triage');
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body.actions));
  });

  await check('outflows', async () => {
    const r = await call('GET', '/outflows');
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body.bills));
  });

  await check('profile', async () => {
    const r = await call('GET', '/profile');
    assert.equal(r.status, 200);
    assert.equal(typeof r.body.starting_cash, 'number');
  });

  await check('NLP parse', async () => {
    const r = await call('POST', '/ai/parse', { prompt: 'Invoice Acme 1500 for logo design' });
    assert.equal(r.status, 200);
    assert.ok(r.body.parsed && typeof r.body.parsed === 'object');
    assert.equal(r.body.parsed.amount, 1500);
  });

  const TIERS = ['Low', 'Moderate', 'High', 'Critical'];
  const isoDaysFromNow = (days) => new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
  let invoiceSeq = 0;
  // Creates its own invoice so these checks don't depend on seed data.
  async function createInvoice(fields) {
    invoiceSeq += 1;
    const created = await call('POST', '/invoices', {
      client_id: 'client_acme',
      client_name: 'Acme Studios',
      client_phone: '+15552345678',
      project_title: 'Recovery copilot test',
      amount: 250,
      invoice_number: `TEST-RC-${Date.now()}-${invoiceSeq}`,
      issue_date: isoDaysFromNow(-30),
      due_date: isoDaysFromNow(-5),
      status: 'unpaid',
      ...fields,
    });
    assert.equal(created.status, 201);
    return created.body;
  }

  await check('recovery copilot: missing input', async () => {
    const r = await call('POST', '/ai/recovery-copilot', {});
    assert.equal(r.status, 400);
    assert.equal(r.body.error.message, 'invoiceId or invoiceNumber is required');
  });

  await check('recovery copilot: unknown invoice', async () => {
    const r = await call('POST', '/ai/recovery-copilot', { invoiceId: 'inv_does_not_exist' });
    assert.equal(r.status, 404);
    assert.equal(r.body.error.message, 'Invoice not found');
  });

  await check('recovery copilot: overdue invoice by id', async () => {
    const overdue = await createInvoice({});
    const r = await call('POST', '/ai/recovery-copilot', { invoiceId: overdue.id });
    assert.equal(r.status, 200);
    assert.ok(TIERS.includes(r.body.risk.tier));
    assert.equal(typeof r.body.risk.score, 'number');
    assert.equal(typeof r.body.risk.factors.daysPastDue, 'number');
    assert.equal(typeof r.body.strategy, 'string');
    assert.ok(r.body.draft.invoiceNumbers.includes(overdue.invoice_number));
    assert.equal(typeof r.body.draft.totalPrincipal, 'number');
    assert.ok(Array.isArray(r.body.draft.dueDates));
    assert.equal(typeof r.body.draft.portalLink, 'string');
    assert.ok(r.body.draft.text.includes(overdue.invoice_number));
    assert.ok(r.body.draft.text.includes(overdue.amount.toFixed(2)));
    assert.equal(typeof r.body.client.name, 'string');
  });

  await check('recovery copilot: overdue invoice by number', async () => {
    const overdue = await createInvoice({});
    const r = await call('POST', '/ai/recovery-copilot', { invoiceNumber: overdue.invoice_number });
    assert.equal(r.status, 200);
    assert.ok(r.body.draft.invoiceNumbers.includes(overdue.invoice_number));
  });

  await check('recovery copilot: paid invoice is 422', async () => {
    const paidInvoice = await createInvoice({ status: 'paid', paid_date: isoDaysFromNow(0) });
    const r = await call('POST', '/ai/recovery-copilot', { invoiceId: paidInvoice.id });
    assert.equal(r.status, 422);
  });

  await check('recovery copilot: not-overdue invoice is 422', async () => {
    const notOverdue = await createInvoice({ due_date: isoDaysFromNow(10) });
    const r = await call('POST', '/ai/recovery-copilot', { invoiceId: notOverdue.id });
    assert.equal(r.status, 422);
  });

  await check('recovery copilot: customNotes passed through to escalations', async () => {
    const overdue = await createInvoice({});
    const r = await call('POST', '/ai/recovery-copilot', {
      invoiceId: overdue.id,
      customNotes: 'Finance manager is away this week',
    });
    assert.equal(r.status, 200);
    assert.equal(r.body.escalations.length, 5);
    assert.equal(r.body.customNotes, 'Finance manager is away this week');
    assert.ok(r.body.risk);
    assert.equal(typeof r.body.strategy, 'string');
    assert.ok(r.body.draft);
  });

  await check('recovery copilot: non-string customNotes is 400', async () => {
    const overdue = await createInvoice({});
    const r = await call('POST', '/ai/recovery-copilot', { invoiceId: overdue.id, customNotes: 42 });
    assert.equal(r.status, 400);
  });

  await check('recovery copilot: customNotes over 500 chars is 400', async () => {
    const overdue = await createInvoice({});
    const r = await call('POST', '/ai/recovery-copilot', {
      invoiceId: overdue.id,
      customNotes: 'a'.repeat(501),
    });
    assert.equal(r.status, 400);
  });

  // escalation drafts seam: server/engine/escalation.js
  const loadEscalation = () => import('./engine/escalation.js');
  const escalationArgs = (overrides = {}) => ({
    invoices: [{ invoice_number: 'INV-1', amount: 100, due_date: '2024-01-01' }],
    totalPrincipal: 100,
    daysPastDue: 45,
    money: (n) => '$' + Number(n).toFixed(2),
    clientName: 'Acme',
    portalLink: '/portal/x',
    businessName: 'Studio',
    customNotes: '',
    ...overrides,
  });

  await check('escalation: ESCALATION_TIERS ids and labels in order', async () => {
    const { ESCALATION_TIERS } = await loadEscalation();
    assert.deepEqual(
      ESCALATION_TIERS.map((t) => t.id),
      ['friendly_check_in', 'direct_status_inquiry', 'operational_hold', 'settlement_proposal', 'statutory_notice'],
    );
    assert.deepEqual(
      ESCALATION_TIERS.map((t) => t.label),
      ['Friendly Check-in', 'Direct Status Inquiry', 'Studio Operational Hold', 'Settlement Proposal', 'Statutory Legal Notice'],
    );
  });

  await check('escalation: buildEscalationDrafts returns 5 populated drafts in tier order', async () => {
    const { buildEscalationDrafts } = await loadEscalation();
    const drafts = buildEscalationDrafts(escalationArgs());
    assert.equal(drafts.length, 5);
    assert.deepEqual(
      drafts.map((d) => d.id),
      ['friendly_check_in', 'direct_status_inquiry', 'operational_hold', 'settlement_proposal', 'statutory_notice'],
    );
    for (const d of drafts) {
      assert.equal(typeof d.whatsapp, 'string');
      assert.ok(d.whatsapp.length > 0);
      assert.equal(typeof d.email.subject, 'string');
      assert.ok(d.email.subject.length > 0);
      assert.equal(typeof d.email.body, 'string');
      assert.ok(d.email.body.length > 0);
    }
  });

  await check('escalation: statutory notice cites Freelance Isn\'t Free Act at 45 days past due', async () => {
    const { buildEscalationDrafts } = await loadEscalation();
    const statutory = buildEscalationDrafts(escalationArgs({ daysPastDue: 45 }))[4];
    assert.ok(statutory.whatsapp.includes('Freelance Isn\'t Free Act'));
    assert.ok(statutory.whatsapp.includes('statutory interest'));
    assert.ok(statutory.email.body.includes('Freelance Isn\'t Free Act'));
    assert.ok(statutory.email.body.includes('statutory interest'));
  });

  await check('escalation: statutory notice omits Freelance Isn\'t Free Act at 10 days past due', async () => {
    const { buildEscalationDrafts } = await loadEscalation();
    const statutory = buildEscalationDrafts(escalationArgs({ daysPastDue: 10 }))[4];
    assert.ok(!statutory.email.body.includes('Freelance Isn\'t Free Act'));
  });

  await check('escalation: statutory notice cites Freelance Isn\'t Free Act at exactly 30 days past due', async () => {
    const { buildEscalationDrafts } = await loadEscalation();
    const statutory = buildEscalationDrafts(escalationArgs({ daysPastDue: 30 }))[4];
    assert.ok(statutory.whatsapp.includes('Freelance Isn\'t Free Act'));
    assert.ok(statutory.email.body.includes('Freelance Isn\'t Free Act'));
  });

  await check('escalation: customNotes appended to every draft, and absent when empty', async () => {
    const { buildEscalationDrafts } = await loadEscalation();
    const note = 'Finance manager is away this week';
    const withNotes = buildEscalationDrafts(escalationArgs({ customNotes: note }));
    assert.equal(withNotes.length, 5);
    for (const d of withNotes) {
      assert.ok(d.whatsapp.includes(note));
      assert.ok(d.email.body.includes(note));
    }
    const withoutNotes = buildEscalationDrafts(escalationArgs({ customNotes: '' }));
    for (const d of withoutNotes) {
      assert.ok(!d.whatsapp.includes('Note:'));
      assert.ok(!d.email.body.includes('Note:'));
    }
  });


} catch {
  failed = true;
} finally {
  server.close();
}

if (failed) {
  process.exitCode = 1;
} else {
  process.exitCode = 0;
}
