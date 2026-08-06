import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'mconnect-dev-secret';

export function signToken(user) {
  return jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Not authorized' });
  }
  try {
    const payload = jwt.verify(token, SECRET);
    req.userId = payload.id;
    return next();
  } catch {
    return res.status(401).json({ error: 'Session expired, please log in again' });
  }
}
