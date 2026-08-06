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
