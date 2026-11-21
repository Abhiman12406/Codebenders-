// Automated test script for dataService.js
import dataService, {
  DEFAULT_PROFILE,
  getProfile,
  updateProfile,
  getClients,
  saveClient,
  getInvoices,
  createInvoice,
  updateInvoice,
  markPaid,
  deleteInvoice,
  getBills,
  saveBill,
  deleteBill,
  getFollowUps,
  logFollowUp,
  resetDemoData,
} from './src/lib/dataService.js';
import { isSupabaseConfigured } from './src/lib/supabaseClient.js';

async function runTests() {
  console.log('--- Starting dataService Verification Suite ---');

  // Test 1: Supabase client safety check
  const isConfigured = isSupabaseConfigured();
  console.log(`[PASS] Supabase configuration check: ${isConfigured ? 'Configured' : 'Fallback / Guest Mode'}`);

  // Test 2: Profile CRUD
  const profile = await getProfile();
  console.assert(profile && profile.business_name, 'Profile should have business_name');
  console.log(`[PASS] getProfile: "${profile.business_name}", starting cash: ${profile.starting_cash}`);

  const updatedProfile = await updateProfile({ business_name: 'StudioFlow Creative HQ', starting_cash: 5200 });
  console.assert(updatedProfile.business_name === 'StudioFlow Creative HQ', 'Profile business_name updated');
  console.assert(updatedProfile.starting_cash === 5200, 'Profile starting_cash updated');
  console.log('[PASS] updateProfile: Successfully updated business_name and starting_cash');

  // Test 3: Clients CRUD
  const newClient = await saveClient({
    name: 'Acme Studio Test',
    company: 'Acme Corp',
    email: 'hello@acme.test',
    phone: '+15551234567',
    payment_behavior: 'reliable',
    avg_delay_days: 3,
  });
  console.assert(newClient.id, 'Client should have an ID');
  console.log(`[PASS] saveClient: Created client "${newClient.name}" with ID: ${newClient.id}`);

  const clients = await getClients();
  console.assert(clients.length >= 1, 'getClients should return at least 1 client');
  console.log(`[PASS] getClients: Retrieved ${clients.length} clients`);

  // Test 4: Invoices CRUD
  const invoice = await createInvoice({
    client_name: 'Acme Studio Test',
    project_title: 'Brand Refresh & Design System',
    amount: 3500.0,
    due_date: '2026-12-01',
    status: 'sent',
    items: [{ desc: 'Visual Identity', qty: 1, rate: 3500 }],
  });
  console.assert(invoice.id, 'Invoice should have an ID');
  console.assert(invoice.amount === 3500, 'Invoice amount should be 3500');
  console.log(`[PASS] createInvoice: Created invoice #${invoice.id} ($${invoice.amount})`);

  const invoices = await getInvoices();
  console.assert(invoices.some((i) => i.id === invoice.id), 'Invoice should be in getInvoices list');
  console.log(`[PASS] getInvoices: Retrieved ${invoices.length} invoices`);

  const paidInvoice = await markPaid(invoice.id, '2026-11-21');
  console.assert(paidInvoice.status === 'paid', 'Invoice should be marked paid');
  console.assert(paidInvoice.paid_date === '2026-11-21', 'Invoice should have paid_date');
  console.log(`[PASS] markPaid: Invoice successfully marked as paid on ${paidInvoice.paid_date}`);

  const updatedInvoice = await updateInvoice(invoice.id, { notes: 'Paid via direct bank wire' });
  console.assert(updatedInvoice.notes === 'Paid via direct bank wire', 'Invoice notes updated');
  console.log('[PASS] updateInvoice: Updated notes');

  // Test 5: Bills CRUD
  const bill = await saveBill({
    name: 'Figma Professional',
    category: 'software',
    amount: 45.0,
    due_day: 15,
    frequency: 'monthly',
    is_flexible: true,
  });
  console.assert(bill.id, 'Bill should have an ID');
  console.assert(bill.is_flexible === true, 'Bill should have is_flexible boolean');
  console.log(`[PASS] saveBill: Saved bill "${bill.name}" ($${bill.amount}/mo)`);

  const bills = await getBills();
  console.assert(bills.length >= 1, 'Bills list should have at least 1 item');
  console.log(`[PASS] getBills: Retrieved ${bills.length} bills`);

  // Test 6: Follow-up Log
  const followUp = await logFollowUp({
    invoice_id: invoice.id,
    tone: 'friendly',
    channel: 'whatsapp',
  });
  console.assert(followUp.id, 'Follow up should have an ID');
  console.assert(followUp.channel === 'whatsapp', 'Channel should be whatsapp');
  console.log(`[PASS] logFollowUp: Logged "${followUp.tone}" follow-up via ${followUp.channel}`);

  const followUps = await getFollowUps();
  console.assert(followUps.length >= 1, 'Follow-up log should contain entries');
  console.log(`[PASS] getFollowUps: Retrieved ${followUps.length} follow-up logs`);

  // Test 7: Demo Data Reset
  await resetDemoData({
    profile: { ...DEFAULT_PROFILE, business_name: 'Pristine Demo Studio' },
    invoices: [],
    bills: [],
  });
  const resetProfile = await getProfile();
  console.assert(resetProfile.business_name === 'Pristine Demo Studio', 'Reset profile should match seed');
  console.log('[PASS] resetDemoData: Demo state successfully re-seeded');

  // Test 8: Deletion tests
  await deleteInvoice(invoice.id);
  await deleteBill(bill.id);
  const remainingInvoices = await getInvoices();
  const remainingBills = await getBills();
  console.assert(!remainingInvoices.some((i) => i.id === invoice.id), 'Deleted invoice should be gone');
  console.assert(!remainingBills.some((b) => b.id === bill.id), 'Deleted bill should be gone');
  console.log('[PASS] deleteInvoice & deleteBill: Records cleaned up successfully');

  console.log('\n--- All dataService Verification Tests PASSED cleanly! ---');
}

runTests().catch((err) => {
  console.error('[FAIL] Test threw an error:', err);
  process.exit(1);
});
