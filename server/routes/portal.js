import express from 'express';
import { store } from '../store.js';

const router = express.Router();

const sendError = (res, code, message) => res.status(code).json({ error: { message, status: code } });
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

router.post('/:id/pay', (req, res) => {
  const { paid_date } = req.body ?? {};
  if (paid_date != null && !DATE_PATTERN.test(paid_date)) {
    return sendError(res, 400, 'paid_date must be YYYY-MM-DD');
  }
  const invoice = store.getInvoiceById(req.params.id);
  if (!invoice) return sendError(res, 404, 'Invoice not found');
  if (invoice.status === 'paid') return sendError(res, 409, 'Invoice already paid');
  const result = store.markInvoicePaid(req.params.id, paid_date ?? null);
  if (!result) return sendError(res, 404, 'Invoice not found');
  res.json({ invoice: result.invoice, cash_balance: result.cash_balance });
});

export default router;
