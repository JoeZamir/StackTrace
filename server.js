import http from 'node:http'
import { serveStatic } from './utils/serveStatic.js'
import { handleGetPosts, handleGetComments } from './handlers/routeHandlers.js'
import { handleSignup } from './auth/handleSignup.js'

const PORT = process.env.PORT || 8000;

const __dirname = import.meta.dirname

const server = http.createServer(async (req, res) => {
  const urlParts = req.url.split('/').filter(Boolean);
  const isApiRequest = urlParts[0] === 'api';

  if (isApiRequest) {

    if (req.method === 'GET') {

      if (req.url === '/api/posts') {
        return await handleGetPosts(res)
      }

      if (urlParts[1] === 'posts' && urlParts[3] === 'comments') {
        const postId = urlParts[2];
        return await handleGetComments(res, postId)
      }

    } else if (req.method === 'POST') {

      if (req.url === '/api/signup') {
        return await handleSignup(req, res)
      }

      if (req.url === '/api/login') {
        return await handleLogin(req, res)
      }

    }

  } else {
    return await serveStatic(req, res, __dirname)
  }

});

server.listen(PORT, () => {
  console.log(`Server running on:${PORT}`);
});
