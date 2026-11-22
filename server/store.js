import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Relative date helper
const getRelativeDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const getInitialSeed = () => ({
  profile: {
    id: 'studio_profile_01',
    business_name: 'Aura Design Studio',
    owner_name: 'Alex Morgan',
    currency: '$',
    starting_cash: 4850.00,
    safety_buffer: 1500.00,
    created_at: new Date().toISOString(),
  },
  clients: [
    {
      id: 'client_acme',
      name: 'Acme Studios',
      company: 'Acme Studios Global',
      email: 'billing@acmestudios.design',
      phone: '+15552345678',
      payment_behavior: 'habitual_late',
      avg_delay_days: 14,
      created_at: getRelativeDate(-120),
    },
    {
      id: 'client_horizon',
      name: 'Horizon Tech',
      company: 'Horizon Tech Systems',
      email: 'accounts@horizontech.io',
      phone: '+15553456789',
      payment_behavior: 'fast',
      avg_delay_days: 0,
      created_at: getRelativeDate(-90),
    },
    {
      id: 'client_bloom',
      name: 'Bloom Botanicals',
      company: 'Bloom Botanicals Organics',
      email: 'finance@bloombotanicals.co',
      phone: '+15554567890',
      payment_behavior: 'reliable',
      avg_delay_days: 4,
      created_at: getRelativeDate(-75),
    },
    {
      id: 'client_nova',
      name: 'Nova Fintech',
      company: 'Nova Financial Labs',
      email: 'invoices@novafintech.app',
      phone: '+15555678901',
      payment_behavior: 'reliable',
      avg_delay_days: 2,
      created_at: getRelativeDate(-45),
    },
    {
      id: 'client_artisan',
      name: 'Local Artisan',
      company: 'Local Artisan Coffee Roasters',
      email: 'owner@localartisancoffee.com',
      phone: '+15556789012',
      payment_behavior: 'chronic_risk',
      avg_delay_days: 28,
      created_at: getRelativeDate(-150),
    },
  ],
  invoices: [
    {
      id: 'inv_101',
      client_id: 'client_acme',
      client_name: 'Acme Studios',
      client_phone: '+15552345678',
      invoice_number: 'INV-2026-101',
      project_title: 'Brand Refresh & Visual Identity System',
      amount: 3500.00,
      issue_date: getRelativeDate(-42),
      due_date: getRelativeDate(-12), // 12 days overdue
      paid_date: null,
      status: 'overdue',
      items: [
        { desc: 'Comprehensive Logo & Identity System', qty: 1, rate: 2500.00 },
        { desc: 'Brand Guidelines Manual (60 pages)', qty: 1, rate: 1000.00 },
      ],
      notes: 'Net 30 terms. Followed up on day 7.',
      created_at: getRelativeDate(-42),
    },
    {
      id: 'inv_102',
      client_id: 'client_horizon',
      client_name: 'Horizon Tech',
      client_phone: '+15553456789',
      invoice_number: 'INV-2026-102',
      project_title: 'Design System & UI Component Library',
      amount: 2800.00,
      issue_date: getRelativeDate(-7),
      due_date: getRelativeDate(8),
      paid_date: null,
      status: 'sent',
      items: [
        { desc: 'Figma Token Library & Auto-Layout Specs', qty: 1, rate: 2000.00 },
        { desc: 'Developer Handoff Documentation', qty: 1, rate: 800.00 },
      ],
      notes: 'Horizon pays via Stripe/ACH within 15 days.',
      created_at: getRelativeDate(-7),
    },
    {
      id: 'inv_103',
      client_id: 'client_bloom',
      client_name: 'Bloom Botanicals',
      client_phone: '+15554567890',
      invoice_number: 'INV-2026-103',
      project_title: 'E-Commerce Packaging & Eco Box Design',
      amount: 1450.00,
      issue_date: getRelativeDate(-15),
      due_date: getRelativeDate(0), // Due Today
      paid_date: null,
      status: 'sent',
      items: [
        { desc: 'Dielines & Packaging Print Master Files', qty: 1, rate: 1450.00 },
      ],
      notes: 'Due today. Reminder queued.',
      created_at: getRelativeDate(-15),
    },
    {
      id: 'inv_104',
      client_id: 'client_nova',
      client_name: 'Nova Fintech',
      client_phone: '+15555678901',
      invoice_number: 'INV-2026-104',
      project_title: 'Mobile Banking App UI Sprint',
      amount: 4200.00,
      issue_date: getRelativeDate(-1),
      due_date: getRelativeDate(14),
      paid_date: null,
      status: 'sent',
      items: [
        { desc: 'User Onboarding & KYC Flow Redesign', qty: 1, rate: 2400.00 },
        { desc: 'Investment Portfolio Dashboard', qty: 1, rate: 1800.00 },
      ],
      notes: 'Net 15 terms.',
      created_at: getRelativeDate(-1),
    },
    {
      id: 'inv_105',
      client_id: 'client_artisan',
      client_name: 'Local Artisan',
      client_phone: '+15556789012',
      invoice_number: 'INV-2026-105',
      project_title: 'Cafe Brand Collateral & Custom Menus',
      amount: 850.00,
      issue_date: getRelativeDate(-64),
      due_date: getRelativeDate(-34), // 34 days overdue
      paid_date: null,
      status: 'overdue',
      items: [
        { desc: 'Coffee Bag Illustration & Menu Typography', qty: 1, rate: 850.00 },
      ],
      notes: 'Severe delay. Owner promised payment end of month.',
      created_at: getRelativeDate(-64),
    },
    {
      id: 'inv_106',
      client_id: 'client_acme',
      client_name: 'Acme Studios',
      client_phone: '+15552345678',
      invoice_number: 'INV-2026-106',
      project_title: '3D Motion Graphics & Launch Teaser',
      amount: 1900.00,
      issue_date: getRelativeDate(-92),
      due_date: getRelativeDate(-62), // 62 days overdue
      paid_date: null,
      status: 'overdue',
      items: [
        { desc: 'Cinema 4D Rendering & Octane Shaders', qty: 1, rate: 1900.00 },
      ],
      notes: 'Critical overdue. Project assets delivered in full.',
      created_at: getRelativeDate(-92),
    },
    {
      id: 'inv_107',
      client_id: 'client_bloom',
      client_name: 'Bloom Botanicals',
      client_phone: '+15554567890',
      invoice_number: 'INV-2026-107',
      project_title: 'Seasonal Social Media Asset Kit',
      amount: 750.00,
      issue_date: getRelativeDate(-35),
      due_date: getRelativeDate(-20),
      paid_date: getRelativeDate(-5),
      status: 'paid',
      items: [
        { desc: 'Instagram Story Templates & Ads Kit', qty: 1, rate: 750.00 },
      ],
      notes: 'Paid on time via direct deposit.',
      created_at: getRelativeDate(-35),
    },
  ],
  bills: [
    {
      id: 'bill_adobe',
      name: 'Adobe Creative Cloud All Apps',
      category: 'software',
      amount: 59.99,
      due_day: 5,
      frequency: 'monthly',
      is_flexible: false,
      created_at: getRelativeDate(-180),
    },
    {
      id: 'bill_figma',
      name: 'Figma Organization Seat',
      category: 'software',
      amount: 45.00,
      due_day: 12,
      frequency: 'monthly',
      is_flexible: false,
      created_at: getRelativeDate(-180),
    },
    {
      id: 'bill_rent',
      name: 'Co-working Studio Dedicated Desk & Storage',
      category: 'rent',
      amount: 650.00,
      due_day: 1,
      frequency: 'monthly',
      is_flexible: false,
      created_at: getRelativeDate(-180),
    },
    {
      id: 'bill_render',
      name: 'AWS / 3D Cloud GPU Render Farm',
      category: 'software',
      amount: 220.00,
      due_day: 18,
      frequency: 'monthly',
      is_flexible: true,
      created_at: getRelativeDate(-180),
    },
    {
      id: 'bill_fiber',
      name: 'Studio Gigabit Fiber Internet',
      category: 'utilities',
      amount: 85.00,
      due_day: 22,
      frequency: 'monthly',
      is_flexible: false,
      created_at: getRelativeDate(-180),
    },
    {
      id: 'bill_tax',
      name: 'Quarterly Freelance Tax Reserve Account',
      category: 'tax',
      amount: 1200.00,
      due_day: 28,
      frequency: 'quarterly',
      is_flexible: true,
      created_at: getRelativeDate(-180),
    },
  ],
  follow_ups: [
    {
      id: 'fu_01',
      invoice_id: 'inv_101',
      tone: 'friendly',
      channel: 'whatsapp',
      sent_at: getRelativeDate(-10),
    },
  ],
  transactions: [
    {
      id: 'tx_init',
      type: 'initial_deposit',
      amount: 4850.00,
      description: 'Initial Studio Operating Reserves',
      created_at: getRelativeDate(-1),
    },
  ],
});

class Store {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.reset();
      }
    } catch (e) {
      console.warn('Failed to read db.json, re-initializing seed:', e);
      this.reset();
    }
  }

  save() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save to db.json:', e);
    }
  }

  reset() {
    this.data = getInitialSeed();
    this.save();
    return this.data;
  }

  // Profile
  getProfile() {
    return this.data.profile;
  }

  updateProfile(updates) {
    this.data.profile = { ...this.data.profile, ...updates };
    this.save();
    return this.data.profile;
  }

  // Clients
  getClients() {
    return this.data.clients;
  }

  getClientById(id) {
    return this.data.clients.find((c) => c.id === id);
  }

  createClient(clientData) {
    const newClient = {
      id: clientData.id || `client_${Date.now().toString(36)}`,
      name: clientData.name,
      company: clientData.company || clientData.name,
      email: clientData.email || '',
      phone: clientData.phone || '',
      payment_behavior: clientData.payment_behavior || 'reliable',
      avg_delay_days: Number(clientData.avg_delay_days) || 0,
      created_at: new Date().toISOString(),
    };
    this.data.clients.unshift(newClient);
    this.save();
    return newClient;
  }

  // Invoices
  getInvoices() {
    return this.data.invoices;
  }

  getInvoiceById(id) {
    return this.data.invoices.find((inv) => inv.id === id);
  }

  createInvoice(invData) {
    const today = new Date().toISOString().split('T')[0];
    const newInvoice = {
      id: invData.id || `inv_${Date.now()}`,
      client_id: invData.client_id || null,
      client_name: invData.client_name,
      client_phone: invData.client_phone || '',
      invoice_number: invData.invoice_number || `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      project_title: invData.project_title,
      amount: Number(invData.amount) || 0,
      issue_date: invData.issue_date || today,
      due_date: invData.due_date || today,
      paid_date: invData.paid_date || null,
      status: invData.status || 'sent',
      items: invData.items || [{ desc: invData.project_title, qty: 1, rate: Number(invData.amount) || 0 }],
      notes: invData.notes || '',
      created_at: new Date().toISOString(),
    };
    this.data.invoices.unshift(newInvoice);
    this.save();
    return newInvoice;
  }

  updateInvoice(id, updates) {
    const idx = this.data.invoices.findIndex((inv) => inv.id === id);
    if (idx === -1) return null;
    this.data.invoices[idx] = { ...this.data.invoices[idx], ...updates };
    this.save();
    return this.data.invoices[idx];
  }

  deleteInvoice(id) {
    const idx = this.data.invoices.findIndex((inv) => inv.id === id);
    if (idx === -1) return false;
    this.data.invoices.splice(idx, 1);
    this.save();
    return true;
  }

  markInvoicePaid(id, paidDate = null) {
    const inv = this.getInvoiceById(id);
    if (!inv) return null;

    const actualPaidDate = paidDate || new Date().toISOString().split('T')[0];
    inv.status = 'paid';
    inv.paid_date = actualPaidDate;

    // Credit starting cash / balance
    const amt = Number(inv.amount) || 0;
    this.data.profile.starting_cash = Number(this.data.profile.starting_cash || 0) + amt;

    // Log transaction
    this.data.transactions.unshift({
      id: `tx_${Date.now()}`,
      type: 'invoice_payment',
      invoice_id: id,
      invoice_number: inv.invoice_number,
      client_name: inv.client_name,
      amount: amt,
      paid_date: actualPaidDate,
      created_at: new Date().toISOString(),
    });

    this.save();
    return {
      invoice: inv,
      cash_balance: this.data.profile.starting_cash,
    };
  }

  // Bills
  getBills() {
    return this.data.bills;
  }

  saveBill(billData) {
    if (billData.id) {
      const idx = this.data.bills.findIndex((b) => b.id === billData.id);
      if (idx !== -1) {
        this.data.bills[idx] = { ...this.data.bills[idx], ...billData };
        this.save();
        return this.data.bills[idx];
      }
    }
    const newBill = {
      id: billData.id || `bill_${Date.now()}`,
      name: billData.name,
      category: billData.category || 'software',
      amount: Number(billData.amount) || 0,
      due_day: Number(billData.due_day) || 1,
      frequency: billData.frequency || 'monthly',
      is_flexible: Boolean(billData.is_flexible),
      created_at: new Date().toISOString(),
    };
    this.data.bills.push(newBill);
    this.save();
    return newBill;
  }

  deleteBill(id) {
    const idx = this.data.bills.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    this.data.bills.splice(idx, 1);
    this.save();
    return true;
  }

  // Follow Ups
  getFollowUps() {
    return this.data.follow_ups;
  }

  logFollowUp(fuData) {
    const record = {
      id: fuData.id || `fu_${Date.now()}`,
      invoice_id: fuData.invoice_id,
      tone: fuData.tone || 'friendly',
      channel: fuData.channel || 'whatsapp',
      notes: fuData.notes || '',
      sent_at: new Date().toISOString(),
    };
    this.data.follow_ups.unshift(record);
    this.save();
    return record;
  }

  getTransactions() {
    return this.data.transactions;
  }
}

export const store = new Store();
export default store;
