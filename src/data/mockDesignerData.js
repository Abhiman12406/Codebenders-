// Helper to generate dynamic ISO dates relative to today
const getRelativeDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const createMockDesignerData = () => {
  const profile = {
    id: 'guest_profile',
    business_name: 'Aura Design Studio',
    owner_name: 'Alex Morgan',
    currency: '$',
    starting_cash: 4850.00,
    safety_buffer: 1500.00,
    created_at: new Date().toISOString(),
  };

  const clients = [
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
  ];

  const invoices = [
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
      due_date: getRelativeDate(8), // Current (8 days remaining)
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
      due_date: getRelativeDate(14), // Current (14 days remaining)
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
      paid_date: getRelativeDate(-5), // Paid recently
      status: 'paid',
      items: [
        { desc: 'Instagram Story Templates & Ads Kit', qty: 1, rate: 750.00 },
      ],
      notes: 'Paid on time via direct deposit.',
      created_at: getRelativeDate(-35),
    },
  ];

  const bills = [
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
      is_flexible: true, // Flexible expense that can be deferred on a Bad Day
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
      is_flexible: true, // Flexible deferral buffer
      created_at: getRelativeDate(-180),
    },
  ];

  const followUps = [
    {
      id: 'fu_01',
      invoice_id: 'inv_101',
      tone: 'friendly',
      channel: 'whatsapp',
      sent_at: getRelativeDate(-10),
    },
    {
      id: 'fu_02',
      invoice_id: 'inv_105',
      tone: 'firm',
      channel: 'whatsapp',
      sent_at: getRelativeDate(-18),
    },
    {
      id: 'fu_03',
      invoice_id: 'inv_106',
      tone: 'urgent',
      channel: 'whatsapp',
      sent_at: getRelativeDate(-30),
    },
  ];

  return {
    profile,
    clients,
    invoices,
    bills,
    followUps,
  };
};

export const mockDesignerData = createMockDesignerData();
export default mockDesignerData;
