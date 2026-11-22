import express from 'express';
import { store } from '../store.js';

const router = express.Router();

const sendError = (res, code, message) => res.status(code).json({ error: { message, status: code } });
const isValidAmount = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0;

router.get('/', (req, res) => {
  res.json({ invoices: store.getInvoices() });
});

router.get('/:id', (req, res) => {
  const invoice = store.getInvoiceById(req.params.id);
  if (!invoice) return sendError(res, 404, 'Invoice not found');
  res.json(invoice);
});

router.post('/', (req, res) => {
  const { project_title, amount } = req.body ?? {};
  if (typeof project_title !== 'string' || !project_title.trim()) {
    return sendError(res, 400, 'project_title is required');
  }
  if (!isValidAmount(amount)) return sendError(res, 400, 'amount must be a finite number >= 0');
  const invoice = store.createInvoice(req.body);
  res.status(201).json(invoice);
});

router.patch('/:id', (req, res) => {
  const updates = req.body ?? {};
  if (updates.amount !== undefined && !isValidAmount(updates.amount)) {
    return sendError(res, 400, 'amount must be a finite number >= 0');
  }
  const invoice = store.updateInvoice(req.params.id, updates);
  if (!invoice) return sendError(res, 404, 'Invoice not found');
  res.json(invoice);
});

router.delete('/:id', (req, res) => {
  if (!store.deleteInvoice(req.params.id)) return sendError(res, 404, 'Invoice not found');
  res.status(204).end();
});

export default router;
