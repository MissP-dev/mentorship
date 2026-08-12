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

export async function freezeConversation(conversationId) {
  return api(`/conversations/${conversationId}/freeze`, { method: 'POST' });
}

export async function updateMessage(convId, messageId, text) {
  return api(`/conversations/${convId}/messages/${messageId}`, {
    method: 'PATCH',
    body: JSON.stringify({ text }),
  });
}

export async function removeMessage(convId, messageId) {
  return api(`/conversations/${convId}/messages/${messageId}`, { method: 'DELETE' });
}

export async function updateGroup(convId, data, file) {
  const token = getToken();
  const formData = new FormData();
  if (data.groupName !== undefined) formData.append('groupName', data.groupName);
  if (file) formData.append('file', file);

  const res = await fetch(`/api/conversations/${convId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Update failed');
  return result;
}

export async function addGroupMember(convId, userId) {
  return api(`/conversations/${convId}/participants`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function removeGroupMember(convId, userId) {
  const token = getToken();
  const res = await fetch(`/api/conversations/${convId}/participants/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Remove failed');
  return result;
}
