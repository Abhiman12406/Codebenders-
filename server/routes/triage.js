import express from 'express';
import { store } from '../store.js';

const router = express.Router();

router.get('/', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const actions = store.getInvoices()
    .filter((inv) => inv.status === 'overdue' || (inv.status !== 'paid' && inv.due_date < today))
    .sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)))
    .map((inv) => ({
      type: 'chase_invoice',
      invoice_id: inv.id,
      invoice_number: inv.invoice_number,
      client_name: inv.client_name,
      amount: inv.amount,
      due_date: inv.due_date,
      action: 'Send payment reminder',
    }));
  res.json({ actions, count: actions.length });
});

export default router;
