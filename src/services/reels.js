import { api, getToken } from './api';

export async function getReels() {
  return api('/reels');
}

export async function getReelById(id) {
  return api(`/reels/${id}`);
}

export async function createReel(file, caption) {
  const token = getToken();
  const formData = new FormData();
  if (file) formData.append('file', file);
  if (caption) formData.append('caption', caption);

  const res = await fetch('/api/reels', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

export async function likeReel(reelId) {
  return api(`/reels/${reelId}/likes`, {
    method: 'POST',
  });
}

export async function unlikeReel(reelId) {
  return api(`/reels/${reelId}/likes`, {
    method: 'DELETE',
  });
}

export async function deleteReel(id) {
  return api(`/reels/${id}`, { method: 'DELETE' });
}

export async function getReelsByAuthor(authorId) {
  return api(`/reels?authorId=${authorId}`);
}
