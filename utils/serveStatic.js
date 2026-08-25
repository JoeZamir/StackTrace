import path from 'node:path'
import fs from 'node:fs/promises'
import { sendResponse } from './sendResponse.js'
import { getContentType } from './getContentType.js'

export async function serveStatic(req, res, baseDir) {

  const publicDir = path.join(baseDir, 'public')

  const url = new URL(req.url, `http://${req.headers.host}`)
  const pathname = url.pathname  // "/post.html", query string dropped

  const filePath = path.join(
    publicDir,
    pathname === '/' ? 'index.html' : pathname
  )
  const ext = path.extname(filePath)
  const contentType = getContentType(ext)

  try {
    const content = await fs.readFile(filePath)
    sendResponse(res, 200, contentType, content)

  } catch (err) {

    if (err.code === "ENOENT") {
      const err404 = path.join(publicDir, '404.html')
      const content = await fs.readFile(err404)
      sendResponse(
        res,
        404,
        'text/html',
        content
      )
    } else {
      sendResponse(
        res,
        500,
        'text/html',
        `<html><h1>Server Error: ${err.code}</h1></html>`
      )
    }
    console.log(err)
  }

}
