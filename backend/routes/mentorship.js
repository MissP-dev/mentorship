import { Router } from 'express';
import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new pkg.PrismaClient({ adapter });

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
    const { mentorId, message, duration } = req.body;
    const existing = await prisma.mentorshipRequest.findFirst({
      where: { mentorId, menteeId: req.userId, status: 'pending' },
    });
    if (existing) {
      return res.status(400).json({ error: 'You already have a pending request with this mentor' });
    }
    const request = await prisma.mentorshipRequest.create({
      data: { mentorId, menteeId: req.userId, message, duration },
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
        linkTo: '/dashboard',
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
    const request = await prisma.mentorshipRequest.update({
      where: { id: Number(req.params.id) },
      data: { status },
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
          linkTo: '/dashboard',
        },
      });
    }
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
