import { getData } from '../utils/getData.js'
import { sendResponse } from '../utils/sendResponse.js'
import { enrichPost, enrichPosts, enrichComments } from '../utils/enrichData.js'



export async function handleGetPosts(res, currUserId) {

  try {
    const posts = await getData('posts.json')
    const comments = await getData('comments.json')
    const users = await getData('users.json')
    const votes = await getData('votes.json')

    const data = enrichPosts(posts, comments, users, votes, currUserId)

    const content = JSON.stringify(data)
    sendResponse(res, 200, 'application/json', content)
  } catch (error) {
    console.error('Error fetching posts:', error)
    sendResponse(res, 500, 'application/json', JSON.stringify({ error: 'Internal Server Error' }))
  }

}

export async function handleGetPost(res, id, currUserId) {

  try {
    const posts = await getData('posts.json')
    const post = posts.find(p => p.id === id)
    const comments = await getData('comments.json')
    const users = await getData('users.json')
    const votes = await getData('votes.json')

    if (!post) {
      sendResponse(res, 404, 'application/json', JSON.stringify({ error: 'Post not found' }))
      return
    }

    const enrichedPost = enrichPost(post, comments, users, votes, currUserId)

    sendResponse(res, 200, 'application/json', JSON.stringify(enrichedPost))
  } catch (error) {
    console.error('Error fetching post:', error)
    sendResponse(res, 500, 'application/json', JSON.stringify({ error: 'Internal Server Error' }))
  }

}

export async function handleGetComments(res, postId, currUserId) {

  try {
    const comments = await getData('comments.json')
    const postComments = comments.filter(c => c.postId === postId)
    const users = await getData('users.json')
    const votes = await getData('votes.json')

    const enrichedComments = enrichComments(postComments, users, votes, currUserId)
    sendResponse(res, 200, 'application/json', JSON.stringify(enrichedComments))
  } catch (error) {
    console.error('Error fetching comments:', error)
    sendResponse(res, 500, 'application/json', JSON.stringify({ error: 'Internal Server Error' }))
  }

}
