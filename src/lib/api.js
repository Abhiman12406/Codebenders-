const BASE = '/api';

async function request(method, path, body) {
  const options = { method, headers: {} };
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE}${path}`, options);
  if (response.status === 204) return null;

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(json?.error?.message || response.statusText);
    error.status = response.status;
    throw error;
  }
  return json;
}

export const getHealth = () => request('GET', '/health');

export const getInvoices = async () => (await request('GET', '/invoices')).invoices;
export const getInvoice = (id) => request('GET', `/invoices/${encodeURIComponent(id)}`);
export const createInvoice = (data) => request('POST', '/invoices', data);
export const updateInvoice = (id, data) => request('PATCH', `/invoices/${encodeURIComponent(id)}`, data);
export const deleteInvoice = (id) => request('DELETE', `/invoices/${encodeURIComponent(id)}`);
export const payInvoice = (id, paid_date) =>
  request('POST', `/portal/${encodeURIComponent(id)}/pay`, paid_date ? { paid_date } : undefined);

export const getForecast = (horizonDays = 30) => request('GET', `/forecast?horizonDays=${horizonDays}`);
export const getTriage = () => request('GET', '/triage');

export const getBills = async () => (await request('GET', '/outflows')).bills;
export const createBill = (data) => request('POST', '/outflows', data);
export const updateBill = (id, data) => request('PUT', `/outflows/${encodeURIComponent(id)}`, data);
export const deleteBill = (id) => request('DELETE', `/outflows/${encodeURIComponent(id)}`);

export const getProfile = () => request('GET', '/profile');
export const updateProfile = (data) => request('PUT', '/profile', data);

export const parseNlp = async (prompt) => (await request('POST', '/ai/parse', { prompt })).parsed;
export const recoveryCopilot = (body) => request('POST', '/ai/recovery-copilot', body);
