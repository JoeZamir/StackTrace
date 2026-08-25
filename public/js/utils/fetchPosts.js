// utils/posts.js
import { apiRequest } from './api.js';

const getPosts = () => apiRequest('/api/posts');
const getPost = (id) => apiRequest(`/api/posts/${id}`);
const createPost = (data) =>
  apiRequest('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export { getPosts, getPost, createPost };
