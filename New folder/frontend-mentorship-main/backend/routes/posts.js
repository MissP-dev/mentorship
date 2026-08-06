import { Router } from 'express';
import { getDb, save, nextId, findUser, publicUser } from '../db.js';
import { requireAuth } from '../auth.js';
import commentsRouter from './comments.js';

const router = Router();
router.use(requireAuth);

router.use('/:postId/comments', commentsRouter);

const REACTION_TYPES = ['like', 'celebrate', 'support'];

function toPublicPost(post, userId) {
  const { userReactions, ...rest } = post;
  return {
    ...rest,
    reactions: { like: post.reactions.like || 0, celebrate: post.reactions.celebrate || 0, support: post.reactions.support || 0 },
    userReaction: userId ? userReactions[userId] || null : null,
  };
}

router.get('/', (req, res) => {
  const db = getDb();
  let list = db.posts;
  if (req.query.authorId) list = list.filter((p) => p.authorId === Number(req.query.authorId));
  res.json(list.map((p) => toPublicPost(p, req.userId)));
});

router.get('/:id', (req, res) => {
  const post = getDb().posts.find((p) => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(toPublicPost(post, req.userId));
});

router.post('/', (req, res) => {
  const db = getDb();
  const { content, mediaUrl, mediaType } = req.body || {};
  if (!content || !String(content).trim()) {
    return res.status(400).json({ error: 'Content is required' });
  }
  const post = {
    id: nextId(db.posts),
    authorId: req.userId,
    content: String(content),
    mediaUrl: mediaUrl || null,
    mediaType: mediaType || null,
    reactions: { like: 0, celebrate: 0, support: 0 },
    userReactions: {},
    commentCount: 0,
    createdAt: new Date().toISOString(),
  };
  db.posts.unshift(post);
  save();
  res.status(201).json(toPublicPost(post, req.userId));
});

router.post('/:id/reactions', (req, res) => {
  const db = getDb();
  const post = db.posts.find((p) => p.id === Number(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  const { type } = req.body || {};
  if (!REACTION_TYPES.includes(type)) {
    return res.status(400).json({ error: 'Invalid reaction type' });
  }
  const prev = post.userReactions[req.userId];
  if (prev === type) {
    delete post.userReactions[req.userId];
    post.reactions[type] = Math.max(0, post.reactions[type] - 1);
  } else {
    if (prev) post.reactions[prev] = Math.max(0, post.reactions[prev] - 1);
    post.userReactions[req.userId] = type;
    post.reactions[type] = (post.reactions[type] || 0) + 1;
  }
  save();
  res.json(toPublicPost(post, req.userId));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const index = db.posts.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Post not found' });
  if (db.posts[index].authorId !== req.userId) {
    return res.status(403).json({ error: 'You can only delete your own posts' });
  }
  db.posts.splice(index, 1);
  save();
  res.json({ message: 'Post deleted' });
});

export { toPublicPost };
export default router;
