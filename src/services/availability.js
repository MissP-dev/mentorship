import { api } from './api';

export async function getAvailabilityByMentor(mentorId) {
  return api(`/availability/${mentorId}`);
}

export async function saveAvailability(mentorId, slots) {
  return api(`/availability/${mentorId}`, {
    method: 'PUT',
    body: JSON.stringify({ slots }),
  });
}
