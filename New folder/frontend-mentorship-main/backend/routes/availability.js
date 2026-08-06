import { Router } from 'express';
import { getDb, save } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

router.get('/:mentorId', (req, res) => {
  const db = getDb();
  const mentorId = Number(req.params.mentorId);
  const availability = db.availability.find((a) => a.mentorId === mentorId);
  res.json(availability || { mentorId, slots: [] });
});

router.put('/:mentorId', (req, res) => {
  const db = getDb();
  const mentorId = Number(req.params.mentorId);
  const slots = Array.isArray(req.body?.slots) ? req.body.slots : [];
  let availability = db.availability.find((a) => a.mentorId === mentorId);
  if (availability) {
    availability.slots = slots;
  } else {
    availability = { mentorId, slots };
    db.availability.push(availability);
  }
  save();
  res.json(availability);
});

export default router;
