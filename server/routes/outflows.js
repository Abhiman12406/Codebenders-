import express from 'express';
import { store } from '../store.js';

const router = express.Router();

const sendError = (res, code, message) => res.status(code).json({ error: { message, status: code } });
const isValidAmount = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0;

router.get('/', (req, res) => {
  res.json({ bills: store.getBills() });
});

router.post('/', (req, res) => {
  const { name, amount } = req.body ?? {};
  if (typeof name !== 'string' || !name.trim()) return sendError(res, 400, 'name is required');
  if (!isValidAmount(amount)) return sendError(res, 400, 'amount must be a finite number >= 0');
  const bill = store.saveBill(req.body);
  res.status(201).json(bill);
});

router.put('/:id', (req, res) => {
  const body = req.body;
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return sendError(res, 400, 'request body must be a JSON object');
  }
  const { name, amount } = body;
  if (typeof name !== 'string' || !name.trim()) return sendError(res, 400, 'name is required');
  if (!isValidAmount(amount)) return sendError(res, 400, 'amount must be a finite number >= 0');
  const existing = store.getBills().find((bill) => String(bill.id) === req.params.id);
  if (!existing) return sendError(res, 404, 'Bill not found');
  const bill = store.saveBill({ ...body, id: existing.id });
  res.json(bill);
});

router.delete('/:id', (req, res) => {
  if (!store.deleteBill(req.params.id)) return sendError(res, 404, 'Bill not found');
  res.status(204).end();
});

export default router;
