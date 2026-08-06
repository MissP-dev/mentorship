import { Router } from 'express';
import { getDb, save } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const db = getDb();
  let list = db.sessions.filter((s) => s.mentorId === req.userId || s.menteeId === req.userId);
  if (req.query.date) list = list.filter((s) => s.date === String(req.query.date));
  res.json(list);
});

router.get('/:id', (req, res) => {
  const session = getDb().sessions.find((s) => s.id === Number(req.params.id));
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

router.patch('/:id', (req, res) => {
  const session = getDb().sessions.find((s) => s.id === Number(req.params.id));
  if (!session) return res.status(404).json({ error: 'Session not found' });
  const { status } = req.body || {};
  if (['upcoming', 'completed', 'cancelled'].includes(status)) session.status = status;
  save();
  res.json(session);
});

export default router;
