import { api, getToken } from './api';

export async function getStories() {
  return api('/stories');
}

export async function createStory(file, caption, text, mediaType) {
  const token = getToken();
  const formData = new FormData();
  if (file) formData.append('file', file);
  if (caption) formData.append('caption', caption);
  if (text) formData.append('text', text);
  if (mediaType) formData.append('mediaType', mediaType);

  const res = await fetch('/api/stories', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

export async function deleteStory(id) {
  return api(`/stories/${id}`, { method: 'DELETE' });
}

export async function addStoryComment(storyId, text) {
  return api(`/stories/${storyId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export async function deleteStoryComment(storyId, commentId) {
  return api(`/stories/${storyId}/comments/${commentId}`, { method: 'DELETE' });
}
