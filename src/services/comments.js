import { api } from './api';

export async function getCommentsByPost(postId) {
  return api(`/posts/${postId}/comments`);
}

export async function addComment(data) {
  return api(`/posts/${data.postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text: data.text, parentId: data.parentId || null }),
  });
}
