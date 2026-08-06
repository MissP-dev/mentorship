import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb, save, nextId, publicUser } from '../db.js';
import { signToken } from '../auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const db = getDb();
  const user = db.users.find((u) => u.email === String(email || '').toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const ok = await bcrypt.compare(String(password || ''), user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ user: publicUser(user), token: signToken(user) });
});

router.post('/signup', async (req, res) => {
  const { fullName, email, password } = req.body || {};
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Full name, email and password are required' });
  }
  const db = getDb();
  const normalized = String(email).toLowerCase();
  if (db.users.some((u) => u.email === normalized)) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }
  const user = {
    id: nextId(db.users),
    fullName: String(fullName),
    email: normalized,
    passwordHash: await bcrypt.hash(String(password), 10),
    isAdmin: false,
    avatarUrl: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
    bio: '',
    expertiseTags: [],
    rating: 0,
    isMentorProfileComplete: false,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  save();
  res.status(201).json({ user: publicUser(user), token: signToken(user) });
});

export default router;
