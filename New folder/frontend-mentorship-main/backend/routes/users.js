import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb, save, findUser, publicUser } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  res.json(getDb().users.map(publicUser));
});

router.get('/mentors', (req, res) => {
  res.json(getDb().users.filter((u) => u.isMentorProfileComplete).map(publicUser));
});

router.get('/me', (req, res) => {
  const user = findUser(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(publicUser(user));
});

router.patch('/me', (req, res) => {
  const user = findUser(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { fullName, bio, expertiseTags, avatarUrl, isMentorProfileComplete } = req.body || {};
  if (fullName !== undefined) user.fullName = String(fullName);
  if (bio !== undefined) user.bio = String(bio);
  if (expertiseTags !== undefined) user.expertiseTags = Array.isArray(expertiseTags) ? expertiseTags.map(String) : user.expertiseTags;
  if (avatarUrl !== undefined) user.avatarUrl = String(avatarUrl);
  if (isMentorProfileComplete !== undefined) user.isMentorProfileComplete = Boolean(isMentorProfileComplete);
  save();
  res.json(publicUser(user));
});

router.patch('/me/password', async (req, res) => {
  const user = findUser(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { currentPassword, newPassword } = req.body || {};
  const ok = await bcrypt.compare(String(currentPassword || ''), user.passwordHash);
  if (!ok) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  if (!newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }
  user.passwordHash = await bcrypt.hash(String(newPassword), 10);
  save();
  res.json({ message: 'Password changed successfully' });
});

router.get('/:id', (req, res) => {
  const user = findUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(publicUser(user));
});

export default router;
