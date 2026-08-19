# stackTrace Project Context

## Purpose

stackTrace is a small developer-community application intended to be used as a Node.js backend learning project.

The repository currently contains a mostly complete static frontend. The frontend is deliberately UI-only. The Node.js backend is the part that will be built separately and then connected to the frontend later.

The application should eventually allow developers to:

- View a feed of posts.
- View an individual post and its comments.
- Create posts.
- Edit posts.
- Delete posts.
- Comment on posts.
- Upvote and downvote posts and comments.
- View basic user information.
- Browse a simple `/api/news` endpoint.
- Eventually support search, sorting, pagination, authentication, logging, validation, and persistent storage.

The immediate goal is to use this project to consolidate concepts learned in a Node.js course before moving on to Express, PostgreSQL, Prisma, and more advanced backend development.

## Current Architecture

The frontend is plain HTML, CSS, and JavaScript.

There is currently:

- No frontend framework.
- No build step.
- No `fetch()` API calls.
- No frontend backend integration.
- No Express dependency.
- No backend implementation in the frontend project.

The intended initial backend should be implemented using Node's built-in modules rather than Express.

The eventual learning progression is:

1. Raw Node.js HTTP server.
2. Custom request routing.
3. Request body parsing.
4. JSON responses and HTTP status codes.
5. Static file serving.
6. CRUD API endpoints.
7. JSON-file persistence.
8. Error handling and validation.
9. Frontend API integration.
10. More persistent storage such as SQLite/PostgreSQL.
11. Express as a later abstraction/refactoring exercise.
12. Optional serverless deployment through platforms such as Netlify or Vercel.

## Intended Backend API

The eventual API should roughly support:

### Posts

- `GET /api/posts`
- `GET /api/posts/:id`
- `POST /api/posts`
- `PATCH /api/posts/:id`
- `DELETE /api/posts/:id`

### Users

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`

### Comments

- `GET /api/posts/:id/comments`
- `POST /api/posts/:id/comments`
- `DELETE /api/comments/:id`

### News

- `GET /api/news`

The API should return appropriate JSON responses and HTTP status codes.

Examples:

- `200` for successful reads.
- `201` for successful resource creation.
- `400` for malformed or invalid requests.
- `404` for resources or routes that do not exist.
- `500` for unexpected server errors.

## Initial Data Storage

The initial backend learning version may use JSON files:

```text
data/
  users.json
  posts.json
  comments.json
```

These files contain seed data matching the mock content already present in the frontend.

JSON-file persistence is intentionally a learning step. It is not intended to be treated as a production database.

## Frontend Structure

```text
public/
  index.html
  post.html
  new-post.html
  css/
    tokens.css
    base.css
    components.css
    feed.css
    post.css
    form.css
  js/
    feed.js
    post.js
    new-post.js
    utils/
      dom.js
      vote.js
      vote-control.js
      textarea.js
      char-counter.js
      tag-input.js
      nav.js

data/
  users.json
  posts.json
  comments.json
```

The `public/` directory is intended to be served as static files by the eventual Node server.

Each page loads only the CSS and JavaScript it requires. There is no bundler.

## Frontend Design Direction

The visual identity is:

**Terminal meets editorial.**

The design combines:

- Dark, git-diff-inspired UI chrome.
- JetBrains Mono for navigation, controls, metadata, and other interface elements.
- Fraunces for post and comment bodies.
- Vote controls styled like diff gutters using `▲`, score, and `▼`.
- A post editor textarea with a subtle ruled-line/code-editor appearance.

UI changes should preserve this visual language unless there is a strong reason to deliberately change it.

## Data-Attribute Contract

The frontend JavaScript uses `data-*` attributes as behavioral hooks.

Classes are primarily for styling and should not be repurposed as JavaScript selectors when an appropriate data attribute exists.

Important hooks:

| Attribute | Location | Purpose |
|---|---|---|
| `data-post-id` | `.post-card`, `.post`, `.post-form` | Identifies the associated post |
| `data-vote-control` | Vote control wrapper | Identifies a vote widget |
| `data-vote-action="up"` | Vote button | Identifies an upvote action |
| `data-vote-action="down"` | Vote button | Identifies a downvote action |
| `data-comment-form` | Comment form | Identifies the comment form |
| `data-delete-post` | Delete button | Identifies the post deletion UI |
| `data-tag-value` | Hidden form input | Contains comma-separated tags |

Forms use real HTML `<form>` elements and named fields so they can eventually be connected to a backend through normal HTTP requests or `FormData`.

## Frontend and Backend Boundary

The frontend and backend should remain conceptually separate.

The frontend is responsible for:

- Rendering UI.
- DOM manipulation.
- Client-side interaction.
- Form interaction.
- Vote-control state and presentation.
- Character counters.
- Textarea behavior.
- Tag-input behavior.
- Navigation behavior.
- Loading, empty, success, and error UI states.
- Accessibility and responsive behavior.

The backend is responsible for:

- HTTP routing.
- API endpoints.
- Request parsing.
- Validation of incoming data.
- CRUD operations.
- Persistence.
- Server-side error handling.
- HTTP status codes.
- JSON responses.

When backend integration is eventually added, frontend code should consume the API rather than reimplement backend rules.

## Deployment Goal

The project may eventually be deployed as a real application.

A possible deployment model is:

- Static frontend served by Netlify or Vercel.
- API implemented as serverless functions on the same platform.
- Persistent data moved away from local JSON files to a proper database or supported persistent storage.

However, deployment architecture should not drive the initial Node.js learning implementation.

The first version should prioritize understanding raw Node.js HTTP concepts.
