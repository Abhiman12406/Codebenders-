import { supabase, isSupabaseConfigured } from './supabaseClient.js';

// Safe in-memory fallback for SSR/Node environments where localStorage is not present
const memoryStore = {};

const storage = {
  get(key, defaultValue = null) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      }
      return memoryStore[key] ? JSON.parse(memoryStore[key]) : defaultValue;
    } catch (e) {
      console.warn(`Error reading key "${key}" from storage:`, e);
      return defaultValue;
    }
  },
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, serialized);
      }
      memoryStore[key] = serialized;
    } catch (e) {
      console.warn(`Error writing key "${key}" to storage:`, e);
      memoryStore[key] = JSON.stringify(value);
    }
  },
  remove(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      delete memoryStore[key];
    } catch (e) {
      delete memoryStore[key];
    }
  }
};

const STORAGE_KEYS = {
  PROFILE: 'studioflow_profile',
  CLIENTS: 'studioflow_clients',
  INVOICES: 'studioflow_invoices',
  BILLS: 'studioflow_bills',
  FOLLOW_UPS: 'studioflow_follow_ups',
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now().toString(36);
};

export const DEFAULT_PROFILE = {
  id: 'guest_profile',
  business_name: 'Aura Design Studio',
  owner_name: 'Alex Morgan',
  currency: '$',
  starting_cash: 4850.00,
  safety_buffer: 1500.00,
  created_at: new Date().toISOString(),
};

/**
 * Checks if Supabase client is connected and has an active authenticated user.
 */
export async function getActiveUser() {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

// ==========================================
// 1. Profile CRUD
// ==========================================
export async function getProfile() {
  const user = await getActiveUser();
  if (user && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data) {
        storage.set(STORAGE_KEYS.PROFILE, data);
        return data;
      }
    } catch (err) {
      console.warn('Supabase profile fetch failed, using local fallback:', err);
    }
  }

  return storage.get(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
}

export async function updateProfile(updates) {
  const current = await getProfile();
  const updated = {
    ...current,
    ...updates,
    starting_cash: updates.starting_cash !== undefined ? Number(updates.starting_cash) : current.starting_cash,
    safety_buffer: updates.safety_buffer !== undefined ? Number(updates.safety_buffer) : current.safety_buffer,
  };

  storage.set(STORAGE_KEYS.PROFILE, updated);

  const user = await getActiveUser();
  if (user && supabase) {
    try {
      await supabase
        .from('profiles')
        .upsert({ ...updated, id: user.id });
    } catch (err) {
      console.warn('Failed to sync profile update to Supabase:', err);
    }
  }

  return updated;
}

// ==========================================
// 2. Clients CRUD
// ==========================================
export async function getClients() {
  const user = await getActiveUser();
  if (user && supabase) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        storage.set(STORAGE_KEYS.CLIENTS, data);
        return data;
      }
    } catch (err) {
      console.warn('Supabase clients fetch failed, using local cache:', err);
    }
  }

  return storage.get(STORAGE_KEYS.CLIENTS, []);
}

export async function saveClient(client) {
  const clients = await getClients();
  const clientData = {
    ...client,
    id: client.id || generateId(),
    created_at: client.created_at || new Date().toISOString(),
  };

  const existingIndex = clients.findIndex((c) => c.id === clientData.id);
  const updatedClients = existingIndex >= 0
    ? clients.map((c, i) => (i === existingIndex ? clientData : c))
    : [clientData, ...clients];

  storage.set(STORAGE_KEYS.CLIENTS, updatedClients);

  const user = await getActiveUser();
  if (user && supabase) {
    try {
      await supabase
        .from('clients')
        .upsert({ ...clientData, user_id: user.id });
    } catch (err) {
      console.warn('Failed to sync client to Supabase:', err);
    }
  }

  return clientData;
}

// ==========================================
// 3. Invoices CRUD
// ==========================================
export async function getInvoices() {
  const user = await getActiveUser();
  if (user && supabase) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('due_date', { ascending: true });

      if (!error && Array.isArray(data)) {
        storage.set(STORAGE_KEYS.INVOICES, data);
        return data;
      }
    } catch (err) {
      console.warn('Supabase invoices fetch failed, using local cache:', err);
    }
  }

  return storage.get(STORAGE_KEYS.INVOICES, []);
}

export async function createInvoice(invoice) {
  const invoices = await getInvoices();
  const newInvoice = {
    ...invoice,
    id: invoice.id || generateId(),
    amount: Number(invoice.amount) || 0,
    status: invoice.status || 'sent',
    issue_date: invoice.issue_date || new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    items: invoice.items || [],
  };

  const updatedInvoices = [newInvoice, ...invoices];
  storage.set(STORAGE_KEYS.INVOICES, updatedInvoices);

  const user = await getActiveUser();
  if (user && supabase) {
    try {
      await supabase
        .from('invoices')
        .insert({ ...newInvoice, user_id: user.id });
    } catch (err) {
      console.warn('Failed to sync new invoice to Supabase:', err);
    }
  }

  return newInvoice;
}

export async function updateInvoice(id, updates) {
  const invoices = await getInvoices();
  let updatedRecord = null;

  const updatedInvoices = invoices.map((inv) => {
    if (inv.id === id) {
      updatedRecord = {
        ...inv,
        ...updates,
        amount: updates.amount !== undefined ? Number(updates.amount) : inv.amount,
      };
      return updatedRecord;
    }
    return inv;
  });

  if (!updatedRecord) {
    throw new Error(`Invoice with ID "${id}" not found.`);
  }

  storage.set(STORAGE_KEYS.INVOICES, updatedInvoices);

  const user = await getActiveUser();
  if (user && supabase) {
    try {
      await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id);
    } catch (err) {
      console.warn('Failed to sync invoice update to Supabase:', err);
    }
  }

  return updatedRecord;
}

export async function deleteInvoice(id) {
  const invoices = await getInvoices();
  const filtered = invoices.filter((inv) => inv.id !== id);
  storage.set(STORAGE_KEYS.INVOICES, filtered);

  const user = await getActiveUser();
  if (user && supabase) {
    try {
      await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
    } catch (err) {
      console.warn('Failed to delete invoice from Supabase:', err);
    }
  }

  return true;
}

export async function markPaid(id, paidDate = new Date().toISOString().split('T')[0]) {
  return updateInvoice(id, {
    status: 'paid',
    paid_date: paidDate,
  });
}

// ==========================================
// 4. Bills / Outflows CRUD
// ==========================================
export async function getBills() {
  const user = await getActiveUser();
  if (user && supabase) {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('due_day', { ascending: true });

      if (!error && Array.isArray(data)) {
        storage.set(STORAGE_KEYS.BILLS, data);
        return data;
      }
    } catch (err) {
      console.warn('Supabase bills fetch failed, using local cache:', err);
    }
  }

  return storage.get(STORAGE_KEYS.BILLS, []);
}

export async function saveBill(bill) {
  const bills = await getBills();
  const billData = {
    ...bill,
    id: bill.id || generateId(),
    amount: Number(bill.amount) || 0,
    due_day: Number(bill.due_day) || 1,
    frequency: bill.frequency || 'monthly',
    is_flexible: Boolean(bill.is_flexible),
    created_at: bill.created_at || new Date().toISOString(),
  };

  const existingIndex = bills.findIndex((b) => b.id === billData.id);
  const updatedBills = existingIndex >= 0
    ? bills.map((b, i) => (i === existingIndex ? billData : b))
    : [...bills, billData];

  storage.set(STORAGE_KEYS.BILLS, updatedBills);

  const user = await getActiveUser();
  if (user && supabase) {
    try {
      await supabase
        .from('bills')
        .upsert({ ...billData, user_id: user.id });
    } catch (err) {
      console.warn('Failed to sync bill to Supabase:', err);
    }
  }

  return billData;
}

export async function deleteBill(id) {
  const bills = await getBills();
  const filtered = bills.filter((b) => b.id !== id);
  storage.set(STORAGE_KEYS.BILLS, filtered);

  const user = await getActiveUser();
  if (user && supabase) {
    try {
      await supabase
        .from('bills')
        .delete()
        .eq('id', id);
    } catch (err) {
      console.warn('Failed to delete bill from Supabase:', err);
    }
  }

  return true;
}

// ==========================================
// 5. Follow-ups Log CRUD
// ==========================================
export async function getFollowUps() {
  const user = await getActiveUser();
  if (user && supabase) {
    try {
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .order('sent_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        storage.set(STORAGE_KEYS.FOLLOW_UPS, data);
        return data;
      }
    } catch (err) {
      console.warn('Supabase follow_ups fetch failed, using local cache:', err);
    }
  }

  return storage.get(STORAGE_KEYS.FOLLOW_UPS, []);
}

export async function logFollowUp(followUp) {
  const followUps = await getFollowUps();
  const record = {
    ...followUp,
    id: followUp.id || generateId(),
    channel: followUp.channel || 'whatsapp',
    sent_at: followUp.sent_at || new Date().toISOString(),
  };

  const updatedFollowUps = [record, ...followUps];
  storage.set(STORAGE_KEYS.FOLLOW_UPS, updatedFollowUps);

  const user = await getActiveUser();
  if (user && supabase) {
    try {
      await supabase
        .from('follow_ups')
        .insert({ ...record, user_id: user.id });
    } catch (err) {
      console.warn('Failed to sync follow-up to Supabase:', err);
    }
  }

  return record;
}

// ==========================================
// 6. Dataset Seeding & Demo Reset
// ==========================================
export async function seedInitialData(seedData = {}, force = false) {
  const existingInvoices = storage.get(STORAGE_KEYS.INVOICES, null);

  if (force || !existingInvoices || existingInvoices.length === 0) {
    if (seedData.profile) storage.set(STORAGE_KEYS.PROFILE, seedData.profile);
    if (seedData.clients) storage.set(STORAGE_KEYS.CLIENTS, seedData.clients);
    if (seedData.invoices) storage.set(STORAGE_KEYS.INVOICES, seedData.invoices);
    if (seedData.bills) storage.set(STORAGE_KEYS.BILLS, seedData.bills);
    if (seedData.followUps) storage.set(STORAGE_KEYS.FOLLOW_UPS, seedData.followUps);
    return true;
  }
  return false;
}

export async function resetDemoData(seedData = {}) {
  return seedInitialData(seedData, true);
}

export const dataService = {
  isSupabaseConfigured,
  getActiveUser,
  getProfile,
  updateProfile,
  getClients,
  saveClient,
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  markPaid,
  getBills,
  saveBill,
  deleteBill,
  getFollowUps,
  logFollowUp,
  seedInitialData,
  resetDemoData,
};

export default dataService;
