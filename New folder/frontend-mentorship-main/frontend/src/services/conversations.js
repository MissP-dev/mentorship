import { api, getToken } from './api';

function transformConv(c) {
  return {
    ...c,
    participantIds: (c.participants || []).map((p) => p.user?.id ?? p.userId),
    lastMessage: c.lastMessage || '',
    lastMessageAt: c.lastMessageAt || c.createdAt,
  };
}

export async function getConversations(userId) {
  const convs = await api('/conversations');
  return convs.map(transformConv);
}

export async function getConversationById(id) {
  const conv = await api(`/conversations/${id}`);
  return transformConv(conv);
}

export async function getMessages(conversationId) {
  return api(`/conversations/${conversationId}/messages`);
}

export async function sendMessage(data) {
  const token = getToken();

  if (data.file) {
    const formData = new FormData();
    if (data.text) formData.append('text', data.text);
    if (data.messageType) formData.append('messageType', data.messageType);
    formData.append('file', data.file);

    const res = await fetch(`/api/conversations/${data.conversationId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const msg = await res.json();
    if (!res.ok) throw new Error(msg.error || 'Send failed');
    return msg;
  }

  return api(`/conversations/${data.conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text: data.text }),
  });
}

export async function createConversation(data) {
  return api('/conversations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function markAsRead(conversationId) {
  return api(`/conversations/${conversationId}/read`, { method: 'PATCH' });
}
