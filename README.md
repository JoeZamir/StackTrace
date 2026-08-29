# stackTrace

A small developer-community app — a feed of posts, upvotes/downvotes,
comments, and user accounts — built with **vanilla JavaScript on both
ends**: no frontend framework, no backend framework, no build step.

## Why this exists

This project is a hands-on way to actually learn Node.js fundamentals
(working through Scrimba's *Learn Node.js* course) by building
something real on top of them, rather than just following along with
course exercises. The frontend UI/markup was scaffolded first; the
backend — the HTTP server, routing, file-based data storage,
authentication, and the API it exposes — was built from scratch, one
feature at a time, with a deliberate constraint: **use Node's built-in
`http` module directly, no Express, no framework, no shortcuts** — so
that request parsing, routing, and response handling all had to be
understood rather than abstracted away.

The goal was never to ship the fastest possible dev-community clone —
it was to come out the other side actually understanding how a server
handles a request, why `async`/`await` timing bugs happen, and where
the real boundary sits between "runs in the browser" and "runs on the
server."

## What it does

- Browse a feed of posts, filterable by tag
- Sign up / log in (server-validated against a JSON "database")
- View a single post with its full comment thread
- Upvote / downvote posts and comments
- (In progress) create posts and comments, with the same vote and
  auth rules applied

## Architecture

```
server.js              → plain http.createServer, routes by method + URL path
auth/
  handleSignup.js         validates + creates a user in data/users.json
  handleLogin.js           validates credentials, returns the user (no password)
handlers/
  routeHandlers.js          GET /api/posts, /api/posts/:id, /api/posts/:id/comments
utils/
  getData.js                 reads a JSON file from /data
  saveData.js                  appendData (add one record) + writeData (overwrite)
  parseJSON.js                   reads a request body stream into a JS object
  sanitizeJSON.js                  strips unsafe HTML out of incoming string fields
  sendResponse.js                   writes status + headers + body to res
  enrichData.js                      joins posts/comments/users/votes into
                                      what the frontend actually renders
                                      (author, avatar, relative time, vote
                                      counts, this-user's vote state)
  voteHelpers.js                      countVotes / getUserVote, shared by
                                      enrichData.js and the (upcoming) vote
                                      endpoint
data/
  users.json, posts.json, comments.json, votes.json
                          → the "database" — flat JSON files, read/written
                            directly with fs, no ORM, no SQL (yet — see
                            Known limitations)
public/
  index.html, post.html, auth.html, new-post.html
  css/                    plain CSS, no framework, custom design tokens
  js/
    index.js, post.js, auth.js         → one entry point per page
    utils/
      fetchPosts.js, comments.js, api.js   → fetch wrappers, hit /api/*
      auth-gate.js                          → client-side session state
                                               (localStorage cache of who's
                                               logged in — NOT the source
                                               of truth, the server is)
      nav.js, textarea.js, char-counter.js, dom.js  → small UI-only helpers
```

The split that matters most throughout this project: **anything that
touches `fs`, reads `data/*.json`, or trusts a password is server-only
code** (`server.js`, `auth/`, `handlers/`, `utils/` at the root).
**Anything that runs in a browser tab** lives under `public/` and can
only ever reach data through `fetch()` calls to the API — it has no
access to the filesystem, ever, no matter how tempting an import looks.

## Challenges along the way

A few things that weren't obvious going in, and had to be actually
debugged into understanding rather than looked up and copy-pasted:

- **Async timing, repeatedly.** The most common bug shape in this
  project wasn't "wrong logic," it was "correct logic, running before
  the data it depends on has arrived." `let post = []` sitting next to
  a `.reduce()` that runs immediately at module load, before any
  `await` has resolved, is a subtle trap — the fix is always the same
  (do the work in a function, call that function *after* the fetch
  resolves), but recognizing *where* it's happening takes practice.

- **Browser vs. Node are two different environments, sharing one
  language.** Trying to import server-side code (`fs`-based file
  reading, `routeHandlers.js`) into frontend page scripts was a
  recurring mistake — it looks like it should work because it's all
  JavaScript, but a browser tab has no filesystem access at all. The
  fix each time was moving logic to whichever side could actually run
  it, and only ever crossing that boundary via `fetch`.

- **Path resolution and the working directory.** `path.join('data',
  filename)` works locally by accident, because the terminal happens
  to be sitting in the project root — but it breaks the moment the
  process is launched from anywhere else, which is exactly what
  happens on most hosts. `import.meta.dirname` fixes it by anchoring
  to the file's real location instead of guessing at the cwd.

- **Query strings vs. path segments vs. request bodies** all needed to
  be told apart — `req.url` includes the query string and has to be
  parsed with `URL`/`searchParams` before it's used to look up a
  static file (or it 404s on `post.html?id=p2`); a POST body arrives
  as a raw stream, not a ready object, and has to be read and
  `JSON.parse`d by hand.

- **One source of truth, chosen deliberately.** Comment counts and
  vote totals could have been stored as static numbers on each
  post/comment and incremented by hand — but that means two places
  that have to stay in sync forever, with no guardrail if they don't.
  Both ended up computed live from the actual records (`comments.json`
  filtered by `postId`, `votes.json` filtered by `targetId`) instead,
  so there's exactly one place the real number can come from.

- **Not over-abstracting.** A recurring tendency was reaching for a
  new utility file for every small variation of a task, which risked
  ending up with several functions doing the same thing with extra
  steps. The rule that stuck: extract a function when the *same logic*
  is genuinely needed in more than one place (like `appendData` /
  `writeData`, or `countVotes` / `getUserVote` being shared between
  read-side enrichment and the future vote-casting endpoint) — not
  just because a new file *could* exist.

## Known limitations (deliberately deferred, not overlooked)

- **Passwords are stored in plain text.** Real hashing (bcrypt) is a
  known next step, intentionally postponed to keep the request/response
  plumbing simple while that part was being built.
- **No sessions or tokens.** The server currently trusts a `userId`
  passed by the client on each request to know who's asking — enough
  to build real per-user features like vote state, but not something
  that would survive someone tampering with it. A real session/auth
  layer is future work.
- **Votes are read-accurate but not yet write-real.** Vote counts and
  per-user vote state are computed live and correctly from
  `votes.json` server-side; the UI-side click handling that actually
  persists a new vote (with optimistic update + rollback on failure)
  is in progress.
- **Storage is flat JSON files, not a database.** This was a
  deliberate choice to focus on Node fundamentals first. It also means
  the app can't be deployed as-is to most serverless/free hosting
  platforms (their filesystems are ephemeral between requests) — a
  real database is planned before deployment, once SQL/a DB is
  properly learned rather than bolted on.

## Data seed

`data/posts.json`, `data/comments.json`, `data/users.json`, and
`data/votes.json` are internally consistent — vote totals in
`votes.json` sum to exactly the `upvotes`/`downvotes` shown on each
post and comment, generated and verified programmatically rather than
by hand.

## Running locally

```nodejs
node server.js
```

Serves the frontend and the API from the same process — no separate
dev server, no build step, no bundler.
