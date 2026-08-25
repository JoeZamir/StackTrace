import { getData } from '../utils/getData.js'
import { sendResponse } from '../utils/sendResponse.js'
// import { parseJSONBody } from '../utils/parseJSONBody.js'
//import { addNewSighting } from '../utils/addNewSighting.js'
//import { sanitizeJSON } from '../utils/sanitizeJSON.js'
//import { createAlert } from '../utils/createAlert.js'
//import { stories } from "../data/stories.js";
//import { sightingEvents } from '../events/sightingEvents.js'



export async function handleGetPosts(res) {
    const data = await getData('posts.json')
    const content = JSON.stringify(data)
    sendResponse(res, 200, 'application/json', content)
}

export async function handleGetPost(res, id) {
    const posts = await getData('posts.json')
    const post = posts.find(p => p.id === id)
    sendResponse(res, 200, 'application/json', JSON.stringify(post))
}

export async function handleGetComments(res, postId) {
    const comments = await getData('comments.json')
    const postComments = comments.filter(c => c.postId === postId)
    sendResponse(res, 200, 'application/json', JSON.stringify(postComments))
}

/*
export async function handlePost(req, res) {

  try {
    const parsedBody = await parseJSONBody(req)
    const sanitized = sanitizeJSON(parsedBody)
    console.log(sanitized)
    await addNewSighting(sanitized)
    sightingEvents.emit('sighting-added', createAlert(sanitized))

    sendResponse(res, 201, 'application/json', JSON.stringify(sanitized))
  } catch (err) {
    sendResponse(res, 400, 'application/json', JSON.stringify({error: err}))
  }
}
/*
export async function handleNews(req, res) {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  setInterval(() => {
    let randomIndex = Math.floor(Math.random() * stories.length)
    console.log(stories[randomIndex])

    res.write(`data: ${JSON.stringify({event: 'news-update', story: stories[randomIndex]})}\n\n`)
  }, 3000)
}
*/
