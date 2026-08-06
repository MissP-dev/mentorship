import { Router } from 'express';
import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new pkg.PrismaClient({ adapter });

const MIN_DAYS = 1;
const MAX_DAYS = 180;

function parseDaysFromString(duration) {
  const d = (duration || '').toLowerCase();
  const m = d.match(/(\d+)\s*day/);
  if (m) return Math.max(MIN_DAYS, Math.min(MAX_DAYS, Number(m[1])));
  if (d.includes('month')) return 30;
  if (d.includes('week')) return 7;
  if (d.includes('year')) return 180;
  return 30;
}

function formatDuration(days) {
  if (days === 1) return '1 day';
  return `${days} days`;
}

function normalizeDuration(body) {
  let days = null;
  let display = null;
  if (body.durationDays !== undefined) {
    days = Math.round(Number(body.durationDays));
    if (!Number.isFinite(days) || days < MIN_DAYS || days > MAX_DAYS) {
      throw new Error(`Duration must be between ${MIN_DAYS} day and ${MAX_DAYS} days`);
    }
    display = formatDuration(days);
  } else if (body.duration) {
    days = parseDaysFromString(body.duration);
    display = body.duration;
  }
  return { days, display };
}

function endDateFromStart(start, days) {
  const d = new Date(start);
  d.setDate(d.getDate() + (days || 30));
  return d;
}

router.get('/mentees', authenticate, async (req, res) => {
  try {
    const requests = await prisma.mentorshipRequest.findMany({
      where: { mentorId: req.userId, status: { in: ['accepted', 'ended'] } },
      include: {
        mentee: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const { role } = req.query;
    const where = {};
    if (role === 'mentor') where.mentorId = req.userId;
    else if (role === 'mentee') where.menteeId = req.userId;
    else where.OR = [{ mentorId: req.userId }, { menteeId: req.userId }];

    const requests = await prisma.mentorshipRequest.findMany({
      where,
      include: {
        mentor: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        mentee: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { mentorId, message } = req.body;
    let durationDays;
    let duration;
    try {
      ({ days: durationDays, display: duration } = normalizeDuration(req.body));
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }
    const mentor = await prisma.user.findUnique({ where: { id: Number(mentorId) } });
    if (!mentor) return res.status(404).json({ error: 'Mentor not found' });
    if (!mentor.isMentorProfileComplete) {
      return res.status(400).json({ error: 'This user is not a mentor' });
    }
    const existing = await prisma.mentorshipRequest.findFirst({
      where: { mentorId, menteeId: req.userId, status: 'pending' },
    });
    if (existing) {
      return res.status(400).json({ error: 'You already have a pending request with this mentor' });
    }
    const request = await prisma.mentorshipRequest.create({
      data: { mentorId, menteeId: req.userId, message, duration, durationDays },
      include: {
        mentor: { select: { id: true, fullName: true, email: true } },
        mentee: { select: { id: true, fullName: true, email: true } },
      },
    });
    await prisma.notification.create({
      data: {
        userId: mentorId,
        type: 'mentorship_request',
        message: `${req.userFullName || 'A mentee'} sent you a mentorship request.`,
        linkTo: '/profile',
      },
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const existing = await prisma.mentorshipRequest.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!existing) return res.status(404).json({ error: 'Request not found' });

    const data = { status };
    if (status === 'accepted') {
      const startDate = existing.startDate || new Date();
      const days = existing.durationDays || parseDaysFromString(existing.duration);
      data.startDate = startDate;
      data.endDate = endDateFromStart(startDate, days);
      if (existing.durationDays === null) data.durationDays = days;
    }

    const request = await prisma.mentorshipRequest.update({
      where: { id: Number(req.params.id) },
      data,
      include: {
        mentor: { select: { id: true, fullName: true, email: true } },
        mentee: { select: { id: true, fullName: true, email: true } },
      },
    });
    if (status === 'accepted') {
      const conv = await prisma.conversation.create({ data: { type: 'direct' } });
      await prisma.conversationParticipant.createMany({
        data: [
          { conversationId: conv.id, userId: request.mentorId },
          { conversationId: conv.id, userId: request.menteeId },
        ],
      });
      await prisma.notification.create({
        data: {
          userId: request.menteeId,
          type: 'mentorship_request',
          message: `${request.mentor.fullName} accepted your mentorship request!`,
          linkTo: '/profile',
        },
      });
    }
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

