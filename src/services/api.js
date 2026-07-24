const BASE = '/api';

export function getToken() {
  return localStorage.getItem('mconnect_token');
}

export function setToken(token) {
  localStorage.setItem('mconnect_token', token);
}

export function clearToken() {
  localStorage.removeItem('mconnect_token');
}

export async function api(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
