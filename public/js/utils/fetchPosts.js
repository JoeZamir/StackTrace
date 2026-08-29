// utils/posts.js
import { apiRequest } from './api.js';
import { getAuthUser } from './auth-gate.js';

const getPosts = () =>
  apiRequest('/api/posts', {
    headers: { 'X-User-Id': getAuthUser()?.id || '' },
  });

const getPost = (id) =>
  apiRequest(`/api/posts/${id}`, {
    headers: { 'X-User-Id': getAuthUser()?.id || '' },
  });

const createPost = (data) =>
  apiRequest('/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': getAuthUser()?.id || '',
    },
    body: JSON.stringify(data),
  });

export { getPosts, getPost, createPost };
