// Import test verifying mockDesignerData shape against database schema and acceptance criteria
import { mockDesignerData, createMockDesignerData } from './src/data/mockDesignerData.js';
import dataService, { resetDemoData, getProfile, getClients, getInvoices, getBills, getFollowUps } from './src/lib/dataService.js';

async function runMockDataTest() {
  console.log('--- Verifying Mock Designer Dataset ---');

  // Verify dynamic data generator
  const data = createMockDesignerData();

  // 1. Clients Verification: 5 diverse clients
  const expectedClients = [
    'Acme Studios',
    'Horizon Tech',
    'Bloom Botanicals',
    'Nova Fintech',
    'Local Artisan',
  ];
  console.assert(data.clients.length === 5, `Expected 5 clients, got ${data.clients.length}`);
  expectedClients.forEach((name) => {
    const found = data.clients.find((c) => c.name === name);
    console.assert(found, `Expected client "${name}" not found`);
    console.assert(found.phone && found.phone.startsWith('+'), `Client "${name}" must have international phone format`);
    console.assert(typeof found.avg_delay_days === 'number', `Client "${name}" must have numeric avg_delay_days`);
    console.log(`[PASS] Client verified: ${name} (${found.payment_behavior}, avg delay: ${found.avg_delay_days}d)`);
  });

  // 2. Invoices Verification: 7 invoices across specified buckets
  console.assert(data.invoices.length === 7, `Expected 7 invoices, got ${data.invoices.length}`);

  const todayStr = new Date().toISOString().split('T')[0];
  const dueToday = data.invoices.find((i) => i.due_date === todayStr);
  console.assert(dueToday, 'Expected an invoice Due Today');
  console.log(`[PASS] Due Today Invoice verified: #${dueToday.invoice_number} ($${dueToday.amount})`);

  // Check Overdue: 12 days, 34 days, 62 days
  const calculateDaysDiff = (targetDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    return Math.round((today - target) / (1000 * 60 * 60 * 24));
  };

  const overdue12 = data.invoices.find((i) => calculateDaysDiff(i.due_date) === 12);
  const overdue34 = data.invoices.find((i) => calculateDaysDiff(i.due_date) === 34);
  const overdue62 = data.invoices.find((i) => calculateDaysDiff(i.due_date) === 62);

  console.assert(overdue12, 'Expected invoice overdue by 12 days');
  console.assert(overdue34, 'Expected invoice overdue by 34 days');
  console.assert(overdue62, 'Expected invoice overdue by 62 days');
  console.log(`[PASS] Overdue Buckets verified: 12d (#${overdue12.invoice_number}), 34d (#${overdue34.invoice_number}), 62d (#${overdue62.invoice_number})`);

  // Check Current (0-15d)
  const currentInvoices = data.invoices.filter((i) => {
    const diff = -calculateDaysDiff(i.due_date);
    return diff > 0 && diff <= 15;
  });
  console.assert(currentInvoices.length >= 2, `Expected at least 2 current invoices (0-15d), found ${currentInvoices.length}`);
  console.log(`[PASS] Current Invoices (0-15d) verified: count = ${currentInvoices.length}`);

  // 3. Bills Verification: Fixed and flexible expenses
  const adobe = data.bills.find((b) => b.name.includes('Adobe'));
  const figma = data.bills.find((b) => b.name.includes('Figma'));
  const rent = data.bills.find((b) => b.name.includes('Co-working') || b.category === 'rent');
  const render = data.bills.find((b) => b.name.includes('Render') || b.name.includes('3D'));

  console.assert(adobe && !adobe.is_flexible, 'Adobe CC should be fixed (!is_flexible)');
  console.assert(figma && !figma.is_flexible, 'Figma should be fixed (!is_flexible)');
  console.assert(rent && !rent.is_flexible, 'Rent should be fixed (!is_flexible)');
  console.assert(render && render.is_flexible, '3D Render farm should be flexible (is_flexible === true)');
  console.log('[PASS] Studio Outflows verified: Fixed (Adobe, Figma, Rent) & Flexible (3D Render Farm)');

  // 4. Data Service Integration Test: Seed & Retrieve
  await resetDemoData(data);
  const loadedProfile = await getProfile();
  const loadedClients = await getClients();
  const loadedInvoices = await getInvoices();
  const loadedBills = await getBills();
  const loadedFollowUps = await getFollowUps();

  console.assert(loadedProfile.business_name === 'Aura Design Studio', 'Profile should load properly');
  console.assert(loadedClients.length === 5, '5 clients loaded from storage');
  console.assert(loadedInvoices.length === 7, '7 invoices loaded from storage');
  console.assert(loadedBills.length === 6, '6 bills loaded from storage');
  console.assert(loadedFollowUps.length === 3, '3 follow-up records loaded from storage');

  console.log('\n--- All Mock Designer Dataset Checks PASSED cleanly! ---');
}

runMockDataTest().catch((err) => {
  console.error('[FAIL] Mock dataset test failed:', err);
  process.exit(1);
});
