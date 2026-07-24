import { api } from './api';

export async function getNotifications(userId) {
  return api('/notifications');
}

export async function markAsRead(id) {
  return api(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllAsRead(userId) {
  return api('/notifications/read-all', { method: 'PATCH' });
}

export async function getUnreadCount(userId) {
  const { count } = await api('/notifications/unread-count');
  return count;
}
