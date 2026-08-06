import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import mentorshipRoutes from './routes/mentorship.js';
import sessionRoutes from './routes/sessions.js';
import availabilityRoutes from './routes/availability.js';
import postsRoutes from './routes/posts.js';
import reviewRoutes from './routes/reviews.js';
import storyRoutes from './routes/stories.js';
import conversationRoutes from './routes/conversations.js';
import notificationRoutes from './routes/notifications.js';
import uploadRoutes from './routes/uploads.js';
import { uploadDir } from './uploads.js';
import { resetDb } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadDir));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/mentorship-requests', mentorshipRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/uploads', uploadRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3002;

if (process.env.RESET_DB === 'true') {
  resetDb();
  console.log('Database reset to seed data.');
}

app.listen(PORT, () => {
  console.log(`MConnect API running on http://localhost:${PORT}`);
});
