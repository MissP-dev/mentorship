import { api } from './api';

export async function getReviewsByMentor(mentorId) {
  return api(`/reviews/mentor/${mentorId}`);
}

export async function createReview({ mentorId, rating, text }) {
  return api('/reviews', {
    method: 'POST',
    body: JSON.stringify({ mentorId, rating, text }),
  });
}

export async function updateReview(reviewId, { rating, text }) {
  return api(`/reviews/${reviewId}`, {
    method: 'PATCH',
    body: JSON.stringify({ rating, text }),
  });
}

export async function deleteReview(reviewId) {
  return api(`/reviews/${reviewId}`, { method: 'DELETE' });
}
