import { Router } from 'express';
import { getDb, save, nextId, findUser, publicUser } from '../db.js';
import { requireAuth } from '../auth.js';
import { upload, toUploadUrl } from '../uploads.js';

const router = Router();
router.use(requireAuth);

function toPublicStory(story) {
  const db = getDb();
  return {
    ...story,
    user: publicUser(db.users.find((u) => u.id === story.userId)),
    comments: (story.comments || []).map((c) => ({
      ...c,
      author: publicUser(db.users.find((u) => u.id === c.authorId)),
    })),
  };
}

router.get('/', (req, res) => {
  const db = getDb();
  const now = Date.now();
  res.json(
    db.stories
      .filter((s) => new Date(s.expiresAt).getTime() > now)
      .map(toPublicStory)
  );
});

router.post('/', upload.single('file'), (req, res) => {
  const db = getDb();
  const file = req.file;
  const caption = String(req.body?.caption || '');
  const text = String(req.body?.text || '');
  const mediaType = req.body?.mediaType || (file ? (file.mimetype.startsWith('video') ? 'video' : 'image') : null);
  if (!file && !text) {
    return res.status(400).json({ error: 'A story needs text or a media file' });
  }
  const story = {
    id: nextId(db.stories),
    userId: req.userId,
    mediaUrl: toUploadUrl(file),
    mediaType: mediaType ? String(mediaType) : null,
    text,
    caption,
    comments: [],
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  db.stories.unshift(story);
  save();
  res.status(201).json(toPublicStory(story));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const index = db.stories.findIndex((s) => s.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Story not found' });
  if (db.stories[index].userId !== req.userId) {
    return res.status(403).json({ error: 'You can only delete your own stories' });
  }
  db.stories.splice(index, 1);
  save();
  res.json({ message: 'Story deleted' });
});

router.post('/:id/comments', (req, res) => {
  const db = getDb();
  const story = db.stories.find((s) => s.id === Number(req.params.id));
  if (!story) return res.status(404).json({ error: 'Story not found' });
  const { text } = req.body || {};
  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: 'Comment text is required' });
  }
  const comment = {
    id: nextId(story.comments || []),
    storyId: story.id,
    authorId: req.userId,
    text: String(text),
    createdAt: new Date().toISOString(),
  };
  story.comments.push(comment);
  save();
  res.status(201).json({ ...comment, author: publicUser(findUser(req.userId)) });
});

router.delete('/:id/comments/:commentId', (req, res) => {
  const db = getDb();
  const story = db.stories.find((s) => s.id === Number(req.params.id));
  if (!story) return res.status(404).json({ error: 'Story not found' });
  const index = story.comments.findIndex((c) => c.id === Number(req.params.commentId));
  if (index === -1) return res.status(404).json({ error: 'Comment not found' });
  if (story.comments[index].authorId !== req.userId) {
    return res.status(403).json({ error: 'You can only delete your own comments' });
  }
  story.comments.splice(index, 1);
  save();
  res.json({ message: 'Comment deleted' });
});

export default router;
