# stackTrace — frontend skeleton

A static frontend for a small developer-community app: a feed of posts,
a post detail page with comments, and a create/edit post form. This is
**HTML/CSS + UI-only JS** — no `fetch` calls anywhere. That part is yours
to build as you work through the Node.js backend.

## Folder structure

```
public/              → served as static files by your Node server
  index.html          the feed
  post.html            a single post + comments
  new-post.html         create/edit post form
  css/
    tokens.css          design tokens (colors, type, spacing)
    base.css             reset, typography, sidebar/page shell
    components.css        vote control, tag pills, buttons, byline
    feed.css               feed-only styles
    post.css                post-detail-only styles
    form.css                  create/edit-form-only styles
  js/
    feed.js              feed page entry point
    post.js               post page entry point
    new-post.js            form page entry point
    utils/
      dom.js                qs/qsa helpers
      vote.js                pure vote-state logic (no DOM)
      vote-control.js         wires vote.js up to the DOM
      textarea.js               auto-grow behavior
      char-counter.js            live character counters
      tag-input.js                 tag chip input
      nav.js                        mobile sidebar toggle

data/                → sample data shaped for your backend, not served to the browser
  users.json
  posts.json
  comments.json
```

Each page loads only the CSS/JS it needs (`base.css` + `components.css`
are shared everywhere). Nothing is bundled — it's plain `<link>` and
`<script type="module">` tags, so you can drop this straight behind
`express.static('public')` with no build step.

## Design direction

"Terminal meets editorial" — a dark, git-diff-inspired feed. UI chrome
(nav, buttons, meta text) is set in JetBrains Mono; post and comment
bodies are set in Fraunces, an editorial serif, so long-form writing
stays readable against all the monospace structure. The vote control is
styled like a diff gutter (▲/▼ around a count), and the post editor's
textarea has a faint ruled-line background like a code editor.

## The data-attribute contract

The JS here only touches elements marked with `data-*` attributes —
classes are for styling only (per your convention). These are the hooks
you'll want when you wire up real requests:

| Attribute | Where | Meaning |
| --- | --- | --- |
| `data-post-id` | `.post-card`, `.post`, `.post-form` | which post an element belongs to |
| `data-vote-control` | wrapping the ▲ count ▼ group | one vote widget (post or comment) |
| `data-vote-action="up"` / `"down"` | the two buttons inside it | which direction was clicked |
| `data-comment-form` | the comment `<form>` | submit handler target |
| `data-delete-post` | delete button on `post.html` | delete-confirmation target |
| `data-tag-value` | hidden input on the form | comma-separated tags, ready to submit |

The forms (`new-post.html`'s form, the comment form) are real `<form>`
elements with `name` attributes on their fields — they'll work with a
plain HTML POST or with `FormData` once you add the fetch logic.

## Data seed

`data/posts.json`, `data/comments.json`, and `data/users.json` mirror
the mock content already in the HTML (same authors, same first post and
its three comments), so your backend responses and the frontend markup
should line up while you're testing.
