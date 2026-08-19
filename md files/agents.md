# Agent Instructions

## Primary Rule

This repository currently contains the **frontend/UI portion of stackTrace**.

Do **not** create backend code, API code, server code, or API-fetching code in this project unless the user explicitly changes this instruction.

Your job in this repository is strictly concerned with **UI and UX**.

## Do NOT Implement

Do not create or add:

- `fetch()` calls.
- XMLHttpRequest calls.
- API clients.
- API service modules.
- HTTP request helpers.
- Backend routes.
- Node.js HTTP server code.
- Express routes or middleware.
- Serverless functions.
- Database code.
- File-based backend persistence logic.
- Authentication implementation.
- Backend validation.
- API response handling.
- API endpoint mocks that are intended to replace the real backend.
- Code whose primary purpose is communicating with `/api/*`.

Do not modify the frontend to make API requests "because the backend will need it later."

The backend/API integration is intentionally deferred.

## What You MAY Implement

You may work on:

- HTML structure.
- CSS.
- Responsive layouts.
- UI components.
- DOM interaction.
- Client-side UI state.
- Form interaction and presentation.
- Vote-control behavior.
- Character counters.
- Textarea auto-growing.
- Tag input behavior.
- Navigation behavior.
- Modal/dialog behavior.
- Confirmation UI.
- Loading-state presentation, when it does not make network requests.
- Empty-state presentation.
- Error-state presentation.
- Success-state presentation.
- Accessibility.
- Keyboard interaction.
- Focus management.
- Client-side visual validation.
- Animations and transitions.
- Visual polish.
- UX improvements.

## Preserve the Existing Architecture

This is a plain HTML/CSS/JavaScript project.

Do not introduce React, Vue, Svelte, a bundler, or another frontend framework unless the user explicitly asks for one.

Keep the existing structure:

```text
public/
  index.html
  post.html
  new-post.html
  css/
  js/
```

Pages should continue to use ordinary `<link>` and `<script type="module">` tags.

## Data Attributes Are the Behavioral Contract

Use the existing `data-*` attributes for JavaScript behavior.

Prefer:

```js
element.dataset.postId
```

or selectors such as:

```js
document.querySelector('[data-post-id]')
```

over using styling classes as behavioral selectors.

Do not rename or remove existing data attributes without a clear reason.

Existing important hooks include:

- `data-post-id`
- `data-vote-control`
- `data-vote-action="up"`
- `data-vote-action="down"`
- `data-comment-form`
- `data-delete-post`
- `data-tag-value`

## Do Not Fake the Backend

Do not implement a fake `fetch()` layer or pretend that an API exists.

If a UI interaction will eventually require backend functionality, implement only the frontend experience needed around it.

For example, if delete functionality will eventually call:

```text
DELETE /api/posts/:id
```

you may build the confirmation dialog and its UI state, but do not implement the DELETE request.

Likewise, if submitting a post will eventually call:

```text
POST /api/posts
```

you may implement form validation and submission UI, but do not create the API request.

## Design Direction

Preserve the existing **Terminal meets editorial** aesthetic.

Use the established design tokens and existing CSS architecture before introducing new styles.

The visual language includes:

- Dark, git-diff-inspired interface.
- JetBrains Mono for UI chrome and metadata.
- Fraunces for post/comment content.
- Diff-gutter-inspired vote controls.
- Code-editor-inspired post textarea.

Avoid unnecessary redesigns when making functional UI changes.

## When Backend Requirements Are Mentioned

If the user asks for something that crosses into backend/API implementation, do not silently implement it.

Instead, clearly identify the frontend portion that can be implemented safely within this repository and explain what backend work would remain outside this frontend scope.

## Goal

Make the frontend feel complete, polished, accessible, and ready to be connected to the Node.js API later, while keeping the frontend/backend boundary clean.
