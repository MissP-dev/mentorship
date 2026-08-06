import { Router } from 'express';
import { getDb, save, nextId, findUser, publicUser } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router({ mergeParams: true });
router.use(requireAuth);

router.get('/', (req, res) => {
  const db = getDb();
  const postId = Number(req.params.postId);
  const all = db.comments.filter((c) => c.postId === postId);
  const top = all.filter((c) => !c.parentId);
  res.json(
    top.map((c) => ({
      ...c,
      replies: all.filter((r) => r.parentId === c.id),
    }))
  );
});

router.post('/', (req, res) => {
  const db = getDb();
  const postId = Number(req.params.postId);
  const post = db.posts.find((p) => p.id === postId);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const { text, parentId } = req.body || {};
  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: 'Comment text is required' });
  }
  const comment = {
    id: nextId(db.comments),
    postId,
    authorId: req.userId,
    text: String(text),
    parentId: parentId ? Number(parentId) : null,
    createdAt: new Date().toISOString(),
  };
  db.comments.push(comment);
  post.commentCount = (post.commentCount || 0) + 1;
  if (post.authorId !== req.userId) {
    db.notifications.push({
      id: nextId(db.notifications),
      userId: post.authorId,
      type: 'new_comment',
      message: `${publicUser(findUser(req.userId)).fullName} commented on your post: "${String(text).slice(0, 60)}"`,
      read: false,
      linkTo: '/feed',
      createdAt: new Date().toISOString(),
    });
  }
  save();
  res.status(201).json(comment);
});

export default router;
