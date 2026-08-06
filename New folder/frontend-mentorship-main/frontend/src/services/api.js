const envBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const BASE = envBase ? `${envBase}/api` : '/api';

const UNREACHABLE_MSG =
  'Cannot reach the MConnect server. Make sure the backend is running and try again.';

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

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error(UNREACHABLE_MSG);
  }

  const text = await res.text();

  // An API route should never return HTML. If it does, the request was
  // handled by a non-API server (e.g. the Vite SPA fallback) and the
  // backend is not reachable.
  if (text.trim().startsWith('<')) {
    throw new Error(UNREACHABLE_MSG);
  }

  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!res.ok) throw new Error(text || `Request failed (${res.status})`);
    }
  }

  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}
