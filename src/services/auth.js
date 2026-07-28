import { api, setToken, clearToken } from './api';

export async function login(email, password) {
  const { user, token } = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(token);
  return user;
}

export async function signup({ fullName, email, password }) {
  const { user, token } = await api('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password }),
  });
  setToken(token);
  return user;
}

export async function getUserById(id) {
  return api(`/users/${id}`);
}

export async function getAllUsers() {
  return api('/users');
}

export async function getMentors() {
  return api('/users/mentors');
}

export async function updateUserProfile(id, updates) {
  return api('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function changePassword(id, currentPassword, newPassword) {
  return api('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function forgotPassword(email) {
  return api('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token, newPassword) {
  return api('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function deleteAccount() {
  return api('/users/me', { method: 'DELETE' });
}
