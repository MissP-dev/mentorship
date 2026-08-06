import { Router } from 'express';
import { getDb, save, nextId } from '../db.js';
import { requireAuth } from '../auth.js';
import { upload, toUploadUrl } from '../uploads.js';

const router = Router();
router.use(requireAuth);

function toPublicConversation(conv) {
  const db = getDb();
  const messages = db.messages.filter((m) => m.conversationId === conv.id);
  const last = messages[messages.length - 1];
  const lastSender = last ? db.users.find((u) => u.id === last.senderId) : null;
  return {
    ...conv,
    lastMessage: conv.lastMessage || last?.text || '',
    lastMessageAt: conv.lastMessageAt || last?.sentAt || conv.createdAt,
    lastMessageSenderId: last?.senderId ?? null,
    lastMessageSenderName: lastSender?.fullName ?? null,
    lastMessageType: last?.messageType || 'text',
  };
}

function previewFor(message) {
  if (message.text) return message.text;
  if (message.messageType === 'image') return 'Photo';
  if (message.messageType === 'voice') return 'Voice message';
  if (message.messageType === 'document') return 'Document';
  return '';
}

router.get('/', (req, res) => {
  const db = getDb();
  res.json(
    db.conversations
      .filter((c) => (c.participants || []).some((p) => p.userId === req.userId))
      .map(toPublicConversation)
  );
});

router.get('/:id', (req, res) => {
  const conv = getDb().conversations.find((c) => c.id === Number(req.params.id));
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  res.json(toPublicConversation(conv));
});

router.get('/:id/messages', (req, res) => {
  const db = getDb();
  res.json(db.messages.filter((m) => m.conversationId === Number(req.params.id)));
});

router.post('/:id/messages', upload.single('file'), (req, res) => {
  const db = getDb();
  const conv = db.conversations.find((c) => c.id === Number(req.params.id));
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  const file = req.file;
  let messageType = req.body?.messageType || 'text';
  if (file) {
    if (file.mimetype.startsWith('image')) messageType = 'image';
    else if (file.mimetype.startsWith('audio')) messageType = 'voice';
    else messageType = 'document';
  }
  const message = {
    id: nextId(db.messages),
    conversationId: conv.id,
    senderId: req.userId,
    text: String(req.body?.text || ''),
    attachmentUrl: toUploadUrl(file),
    messageType,
    sentAt: new Date().toISOString(),
    readAt: null,
  };
  db.messages.push(message);
  conv.lastMessage = previewFor(message);
  conv.lastMessageAt = message.sentAt;
  save();
  res.status(201).json(message);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { participantIds, groupName } = req.body || {};
  const ids = Array.isArray(participantIds) ? participantIds.map(Number) : [];
  const participants = [
    { userId: req.userId },
    ...ids.filter((x) => Number.isFinite(x) && x !== req.userId).map((x) => ({ userId: x })),
  ];
  const conv = {
    id: nextId(db.conversations),
    type: 'group',
    participants,
    groupName: String(groupName || 'Group'),
    groupIconUrl: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
    lastMessage: '',
    lastMessageAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  db.conversations.push(conv);
  save();
  res.status(201).json(toPublicConversation(conv));
});

router.patch('/:id/read', (req, res) => {
  const db = getDb();
  db.messages.forEach((m) => {
    if (m.conversationId === Number(req.params.id) && m.senderId !== req.userId && !m.readAt) {
      m.readAt = new Date().toISOString();
    }
  });
  save();
  res.json({ message: 'Conversation marked as read' });
});

export default router;
