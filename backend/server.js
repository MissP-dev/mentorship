import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import mentorshipRoutes from './routes/mentorship.js';
import sessionRoutes from './routes/sessions.js';
import availabilityRoutes from './routes/availability.js';
import postRoutes from './routes/posts.js';
import conversationRoutes from './routes/conversations.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import reviewRoutes from './routes/reviews.js';
import uploadRoutes from './routes/uploads.js';
import storyRoutes from './routes/stories.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mentorship-requests', mentorshipRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/stories', storyRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'MConnect API is running' });
});

app.listen(PORT, () => {
  console.log(`MConnect API running at http://localhost:${PORT}`);
});
