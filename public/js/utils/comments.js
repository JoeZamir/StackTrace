import { getAuthUser } from './auth-gate.js';
// utils/comments.js
import { apiRequest } from './api.js';

const getComments = (postId) => apiRequest(`/api/posts/${postId}/comments`, {
    headers: { 'X-User-Id': getAuthUser()?.id || '' },
  });
const addComment = (postId, data) =>
  apiRequest(`/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
       'X-User-Id': getAuthUser()?.id || '',
     },
    body: JSON.stringify(data),
  });

export { getComments, addComment };
