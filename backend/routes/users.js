import { Router } from 'express';
import bcrypt from 'bcrypt';
import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new pkg.PrismaClient({ adapter });

const safeSelect = {
  id: true, fullName: true, email: true, isAdmin: true, avatarUrl: true,
  bio: true, expertiseTags: true, rating: true, isMentorProfileComplete: true, suspended: true, createdAt: true,
};

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: safeSelect });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/mentors', authenticate, async (req, res) => {
  try {
    const { search, expertise, minRating } = req.query;
    const where = { isMentorProfileComplete: true };
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (expertise) {
      where.expertiseTags = { has: expertise };
    }
    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }
    const mentors = await prisma.user.findMany({ where, select: safeSelect, orderBy: { rating: 'desc' } });
    res.json(mentors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) }, select: safeSelect });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', optionalAuth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: safeSelect, orderBy: { createdAt: 'desc' } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/me', authenticate, async (req, res) => {
  try {
    const { fullName, bio, avatarUrl, expertiseTags } = req.body;
    const data = {};
    if (fullName !== undefined) data.fullName = fullName;
    if (bio !== undefined) data.bio = bio;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    if (expertiseTags !== undefined) {
      data.expertiseTags = expertiseTags;
      if (expertiseTags.length > 0 && (!req.body._skipMentorFlag)) {
        data.isMentorProfileComplete = true;
      }
    }
    const user = await prisma.user.update({ where: { id: req.userId }, data, select: safeSelect });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/mentor-profile', authenticate, async (req, res) => {
  try {
    const { bio, expertiseTags } = req.body;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { bio, expertiseTags, isMentorProfileComplete: true },
      select: safeSelect,
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.userId }, data: { passwordHash } });
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/me', authenticate, async (req, res) => {
  try {
    const userId = req.userId;

    await prisma.$transaction(async (tx) => {
      await tx.passwordReset.deleteMany({ where: { userId } });
      await tx.storyComment.deleteMany({ where: { authorId: userId } });
      await tx.story.deleteMany({ where: { userId } });
      await tx.postReaction.deleteMany({ where: { userId } });
      await tx.comment.deleteMany({ where: { authorId: userId } });
      await tx.post.deleteMany({ where: { authorId: userId } });
      await tx.notification.deleteMany({ where: { userId } });
      await tx.message.deleteMany({ where: { senderId: userId } });
      await tx.conversationParticipant.deleteMany({ where: { userId } });
      await tx.report.deleteMany({ where: { reportedBy: userId } });
      await tx.review.deleteMany({ where: { OR: [{ mentorId: userId }, { menteeId: userId }] } });
      await tx.mentorshipRequest.deleteMany({ where: { OR: [{ mentorId: userId }, { menteeId: userId }] } });
      await tx.session.deleteMany({ where: { OR: [{ mentorId: userId }, { menteeId: userId }] } });
      await tx.availability.deleteMany({ where: { mentorId: userId } });
      await tx.user.delete({ where: { id: userId } });
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
