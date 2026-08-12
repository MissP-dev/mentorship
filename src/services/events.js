import { api } from './api';

export async function getEvents() {
  return api('/events');
}

export async function getEventById(id) {
  return api(`/events/${id}`);
}

export async function createEvent(data) {
  return api('/events', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEvent(id, updates) {
  return api(`/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteEvent(id) {
  return api(`/events/${id}`, { method: 'DELETE' });
}