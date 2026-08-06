import { Router } from 'express';
import { getDb, save, nextId, findUser, publicUser } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

function populateReview(r) {
  return {
    ...r,
    mentee: publicUser(getDb().users.find((u) => u.id === r.menteeId)),
  };
}

function recalcMentorRating(mentorId) {
  const db = getDb();
  const mentor = findUser(mentorId);
  const list = db.reviews.filter((r) => r.mentorId === mentorId);
  if (mentor) {
    mentor.rating = list.length ? Math.round((list.reduce((sum, r) => sum + r.rating, 0) / list.length) * 10) / 10 : 0;
  }
  return list;
}

router.get('/mentor/:mentorId', (req, res) => {
  const db = getDb();
  res.json(db.reviews.filter((r) => r.mentorId === Number(req.params.mentorId)).map(populateReview));
});

router.post('/', (req, res) => {
  const db = getDb();
  const { mentorId, rating, text } = req.body || {};
  const mentor = findUser(mentorId);
  if (!mentor) return res.status(400).json({ error: 'Invalid mentor' });
  if (mentor.id === req.userId) {
    return res.status(400).json({ error: 'You cannot review yourself' });
  }
  const existing = db.reviews.find((r) => r.mentorId === mentor.id && r.menteeId === req.userId);
  if (existing) {
    return res.status(400).json({ error: 'You already reviewed this mentor' });
  }
  const review = {
    id: nextId(db.reviews),
    mentorId: mentor.id,
    menteeId: req.userId,
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    text: String(text || ''),
    createdAt: new Date().toISOString(),
  };
  db.reviews.push(review);
  recalcMentorRating(mentor.id);
  save();
  res.status(201).json(populateReview(review));
});

router.patch('/:id', (req, res) => {
  const db = getDb();
  const review = db.reviews.find((r) => r.id === Number(req.params.id));
  if (!review) return res.status(404).json({ error: 'Review not found' });
  if (review.menteeId !== req.userId) {
    return res.status(403).json({ error: 'You can only edit your own reviews' });
  }
  const { rating, text } = req.body || {};
  if (rating !== undefined) review.rating = Math.min(5, Math.max(1, Number(rating) || 5));
  if (text !== undefined) review.text = String(text);
  recalcMentorRating(review.mentorId);
  save();
  res.json(populateReview(review));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const index = db.reviews.findIndex((r) => r.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Review not found' });
  if (db.reviews[index].menteeId !== req.userId) {
    return res.status(403).json({ error: 'You can only delete your own reviews' });
  }
  const [removed] = db.reviews.splice(index, 1);
  recalcMentorRating(removed.mentorId);
  save();
  res.json({ message: 'Review deleted' });
});

export default router;
