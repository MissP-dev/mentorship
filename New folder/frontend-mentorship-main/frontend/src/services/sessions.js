import { api } from './api';

export async function getSessions() {
  return api('/sessions');
}

export async function getSessionsByUser(userId) {
  return api('/sessions');
}

export async function getSessionsByDate(userId, date) {
  return api(`/sessions?date=${date}`);
}

export async function getSessionById(id) {
  return api(`/sessions/${id}`);
}

export async function updateSession(id, updates) {
  return api(`/sessions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}
