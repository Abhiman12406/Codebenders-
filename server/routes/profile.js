import express from 'express';
import { store } from '../store.js';

const router = express.Router();

const sendError = (res, code, message) => res.status(code).json({ error: { message, status: code } });

router.get('/', (req, res) => {
  res.json(store.getProfile());
});

router.put('/', (req, res) => {
  const updates = req.body ?? {};
  for (const key of ['starting_cash', 'safety_buffer']) {
    if (updates[key] !== undefined && !Number.isFinite(updates[key])) {
      return sendError(res, 400, `${key} must be a finite number`);
    }
  }
  res.json(store.updateProfile(updates));
});

export default router;
