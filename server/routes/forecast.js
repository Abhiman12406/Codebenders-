import express from 'express';
import { store } from '../store.js';
import { calculateCashForecast, DEFAULT_SCENARIOS } from '../engine/forecast.js';

const router = express.Router();

const sendError = (res, code, message) => res.status(code).json({ error: { message, status: code } });

router.get('/', (req, res) => {
  const raw = req.query.horizonDays;
  let horizonDays = 30;
  if (raw !== undefined) {
    if (!/^\d+$/.test(String(raw))) return sendError(res, 400, 'horizonDays must be an integer between 1 and 365');
    horizonDays = Number(raw);
    if (horizonDays < 1 || horizonDays > 365) {
      return sendError(res, 400, 'horizonDays must be an integer between 1 and 365');
    }
  }
  const profile = store.getProfile();
  const result = calculateCashForecast({
    cashBalance: profile.starting_cash,
    safetyBuffer: profile.safety_buffer,
    invoices: store.getInvoices(),
    bills: store.getBills(),
    clients: store.getClients(),
    horizonDays,
    scenarios: DEFAULT_SCENARIOS,
  });
  res.json(result);
});

export default router;
