import { api } from './api';

export async function getMeetings() {
  return api('/meetings');
}

export async function getMeetingById(id) {
  return api(`/meetings/${id}`);
}

export async function createMeeting(data) {
  return api('/meetings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function inviteToMeeting(meetingId, participantIds) {
  return api(`/meetings/${meetingId}/invite`, {
    method: 'POST',
    body: JSON.stringify({ participantIds }),
  });
}

export async function cancelMeeting(meetingId) {
  return api(`/meetings/${meetingId}/cancel`, { method: 'PATCH' });
}

export async function startMeeting(meetingId) {
  return api(`/meetings/${meetingId}/start`, { method: 'POST' });
}

export async function joinMeeting(meetingId) {
  return api(`/meetings/${meetingId}/join`, { method: 'POST' });
}

export async function leaveMeeting(meetingId) {
  return api(`/meetings/${meetingId}/leave`, { method: 'POST' });
}

export async function endMeeting(meetingId) {
  return api(`/meetings/${meetingId}/end`, { method: 'POST' });
}