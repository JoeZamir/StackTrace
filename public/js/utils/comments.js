// utils/comments.js
import { apiRequest } from './api.js';

const getComments = (postId) => apiRequest(`/api/posts/${postId}/comments`);
const addComment = (postId, data) =>
  apiRequest(`/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export { getComments, addComment };
