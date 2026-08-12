import { api } from './api';

export async function getMentorshipRequests() {
  return api('/mentorship-requests');
}

export async function getMentorshipRequestsByMentor(mentorId) {
  return api('/mentorship-requests?role=mentor');
}

export async function getMentorshipRequestsByMentee(menteeId) {
  return api('/mentorship-requests?role=mentee');
}

export async function createMentorshipRequest(data) {
  return api('/mentorship-requests', {
    method: 'POST',
    body: JSON.stringify({ ...data, mentorId: Number(data.mentorId) }),
  });
}

export async function updateMentorshipRequest(id, updates) {
  return api(`/mentorship-requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function completeMentorshipRequest(id) {
  return api(`/mentorship-requests/${id}/complete`, {
    method: 'POST',
  });
}
