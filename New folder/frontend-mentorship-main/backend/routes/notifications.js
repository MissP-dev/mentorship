import { Router } from 'express';
import { getDb, save } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const db = getDb();
  const list = db.notifications
    .filter((n) => n.userId === req.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(list);
});

router.get('/unread-count', (req, res) => {
  const count = getDb().notifications.filter((n) => n.userId === req.userId && !n.read).length;
  res.json({ count });
});

router.patch('/read-all', (req, res) => {
  const db = getDb();
  db.notifications.forEach((n) => {
    if (n.userId === req.userId) n.read = true;
  });
  save();
  res.json({ message: 'All notifications marked as read' });
});

router.patch('/:id/read', (req, res) => {
  const db = getDb();
  const notification = db.notifications.find((n) => n.id === Number(req.params.id));
  if (!notification) return res.status(404).json({ error: 'Notification not found' });
  notification.read = true;
  save();
  res.json(notification);
});

export default router;
