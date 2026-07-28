import { api } from './api';

export async function getAdminStats() {
  return api('/admin/stats');
}

export async function getAdminActivities() {
  return api('/admin/activities');
}

export async function suspendUser(userId) {
  return api(`/admin/users/${userId}/suspend`, { method: 'PATCH' });
}

export async function adminDeleteUser(userId) {
  return api(`/admin/users/${userId}`, { method: 'DELETE' });
}

export async function getAdminReports() {
  return api('/admin/reports');
}

export async function updateReport(id, data) {
  return api(`/admin/reports/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
