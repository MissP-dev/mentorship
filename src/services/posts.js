import { api, getToken } from './api';

export async function getPosts() {
  return api('/posts');
}

export async function getPostById(id) {
  return api(`/posts/${id}`);
}

export async function getPostsByAuthor(authorId) {
  return api(`/posts?authorId=${authorId}`);
}

export async function createPost(data) {
  return api('/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function reactToPost(postId, reactionType) {
  return api(`/posts/${postId}/reactions`, {
    method: 'POST',
    body: JSON.stringify({ type: reactionType }),
  });
}

export async function deletePost(postId) {
  return api(`/posts/${postId}`, { method: 'DELETE' });
}

export async function incrementCommentCount(postId) {
  // handled server-side when comment is created
}

export async function repostPost(postId) {
  return api(`/posts/${postId}/reposts`, {
    method: 'POST',
  });
}

export async function sharePost(postId, data) {
  return api(`/posts/${postId}/shares`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
