import { Router } from 'express';
import { getDb, save, nextId, findUser, publicUser } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

function populateRequest(r) {
  const db = getDb();
  return {
    ...r,
    mentor: publicUser(db.users.find((u) => u.id === r.mentorId)),
    mentee: publicUser(db.users.find((u) => u.id === r.menteeId)),
  };
}

router.get('/', (req, res) => {
  const db = getDb();
  const role = req.query.role;
  let list = db.mentorshipRequests;
  if (role === 'mentor') list = list.filter((r) => r.mentorId === req.userId);
  else if (role === 'mentee') list = list.filter((r) => r.menteeId === req.userId);
  res.json(list.map(populateRequest));
});

router.post('/', (req, res) => {
  const db = getDb();
  const { mentorId, message, duration } = req.body || {};
  const mentor = findUser(mentorId);
  if (!mentor) {
    return res.status(400).json({ error: 'Invalid mentor' });
  }
  const existing = db.mentorshipRequests.find(
    (r) => r.mentorId === mentor.id && r.menteeId === req.userId && r.status === 'pending'
  );
  if (existing) {
    return res.status(400).json({ error: 'You already have a pending request with this mentor' });
  }
  const request = {
    id: nextId(db.mentorshipRequests),
    mentorId: mentor.id,
    menteeId: req.userId,
    message: String(message || ''),
    duration: String(duration || '1 month'),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  db.mentorshipRequests.push(request);
  db.notifications.push({
    id: nextId(db.notifications),
    userId: mentor.id,
    type: 'mentorship_request',
    message: `${publicUser(findUser(req.userId)).fullName} sent you a mentorship request for ${request.duration}.`,
    read: false,
    linkTo: '/dashboard',
    createdAt: new Date().toISOString(),
  });
  save();
  res.status(201).json(populateRequest(request));
});

router.patch('/:id', (req, res) => {
  const db = getDb();
  const request = db.mentorshipRequests.find((r) => r.id === Number(req.params.id));
  if (!request) return res.status(404).json({ error: 'Request not found' });
  const { status } = req.body || {};
  if (['pending', 'accepted', 'declined'].includes(status)) request.status = status;
  if ((status === 'accepted' || status === 'declined') && request.menteeId !== req.userId) {
    const mentor = publicUser(findUser(request.mentorId));
    db.notifications.push({
      id: nextId(db.notifications),
      userId: request.menteeId,
      type: 'mentorship_request',
      message: `${mentor.fullName} ${status} your mentorship request.`,
      read: false,
      linkTo: '/dashboard',
      createdAt: new Date().toISOString(),
    });
  }
  save();
  res.json(populateRequest(request));
});

export default router;
