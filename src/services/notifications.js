import { api } from './api';

export function resolveNotificationPath(notification) {
  if (!notification) return '/feed';

  const type = (notification.type || '').toLowerCase();

  if (type === 'mentorship_request' || type === 'mentorship') {
    return '/profile?tab=requests';
  }

  if (notification.linkTo) {
    if (notification.linkTo === '/dashboard') return '/feed';
    return normalizeMeetingPath(notification.linkTo);
  }

  switch (type) {
    case 'session_reminder':
      return '/profile';
    case 'new_comment':
    case 'new_like':
      return '/feed';
    case 'new_message':
      return '/messages';
    case 'meeting':
    case 'meeting_invite':
    case 'meeting_cancelled':
      return '/meetings';
    default:
      return '/feed';
  }
}

const MEETING_ROUTE = /^\/meetings\/(\d+)\/?(\?.*)?$/;

function normalizeMeetingPath(path) {
  if (typeof path !== 'string') return '/meetings';
  const match = path.match(MEETING_ROUTE);
  if (match) {
    const id = match[1];
    const query = match[2] || '';
    return `/meetings/${id}/join${query}`;
  }
  return path;
}

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
