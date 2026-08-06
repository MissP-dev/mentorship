import { getToken } from './api';

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const token = getToken();
  const res = await fetch('/api/uploads', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url;
}
