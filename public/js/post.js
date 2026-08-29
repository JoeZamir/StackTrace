import { initAutoGrow } from "./utils/textarea.js";
import { initCharCounter } from "./utils/char-counter.js";
import { initMobileNav } from "./utils/nav.js";
import { getAuthUser, isAuthenticated, refreshAuthStatus, showAuthWarning, hideAuthWarning} from "./utils/auth-gate.js";
import { getPosts, getPost } from "./utils/fetchPosts.js";
import { getComments } from "./utils/comments.js";

//refactor
/*
1. Fetch posts and comments from the server using the provided utility functions.
2. remove imports from site-data.js and use the fetch api to get the data instead of using the static site-data.js file.
3. Initialize event listeners for voting on posts and comments, as well as for comment forms and reply toggles.
*/

let post = [];
let comments = [];


function getSelectedId() {
  const id = new URLSearchParams(window.location.search).get("id") || "p1";
  return id;
}

function renderPostPage() {
  const article = document.querySelector(".post");
  if (!article) return;

  article.dataset.postId = String(post.id);
  article.dataset.authorName = post.author;

  const title = document.querySelector(".post__title", article);
  if (title) title.textContent = post.title;

  const meta = document.querySelector(".post__meta", article);
  if (meta) {
    meta.innerHTML = `
      <div class="byline">
        <span class="byline__avatar">${post.avatar}</span>
        <span class="byline__name">${post.author}</span>
        <span class="byline__dot"></span>
        <span>${post.time}</span>
      </div>
      <ul class="tag-list">
        ${post.tags.map((tag) => `<li class="tag-pill">${tag}</li>`).join("")}
      </ul>
    `;
  }

  const body = document.querySelector(".post__body", article);
  if (body) body.innerHTML = post.bodyHtml;

  const commentsSection = document.querySelector(".comments", document.body);
  if (commentsSection) {
    const count = document.querySelector(".comments__count", commentsSection);
    if (count) count.textContent = `${post.commentList.length} comments`;

    const list = document.querySelector(".comment-list", commentsSection);
    if (list) {
      list.innerHTML = post.commentList
        .map(
          (comment) => `
            <li class="comment" data-comment-author="${comment.author}">

              <div class="comment__content">
                <div class="comment__meta">
                  <div class="byline">
                    <span class="byline__avatar">${comment.avatar}</span>
                    <span class="byline__name">${comment.author}</span>
                    <span class="byline__dot"></span>
                    <span>${comment.time}</span>
                  </div>
                </div>
                <p class="comment__body">${comment.text}</p>
                <div class="post-card__footer comment__footer">
                  <div class="post-card__vote-row" data-vote-row data-comment-id="${comment.id}">
                    <button class="post-card__vote" type="button" data-vote-button="up" aria-label="Upvote" aria-pressed="false"><span aria-hidden="true">▲</span><span class="post-card__vote-count">${comment.upvotes}</span></button>
                    <button class="post-card__vote" type="button" data-vote-button="down" aria-label="Downvote" aria-pressed="false"><span aria-hidden="true">▼</span><span class="post-card__vote-count">${comment.downvotes}</span></button>
                  </div>
                  <div class="comment__actions"><button class="comment__action" type="button" data-reply-toggle>Reply</button></div>
                </div>
                <form class="comment-reply" data-reply-form hidden>
                  <textarea data-autogrow data-reply-input rows="2" maxlength="200" placeholder="Write a reply…"></textarea>
                  <div class="comment-reply__footer">
                    <span class="hint" data-reply-counter>0 / 200</span>
                    <button class="btn btn--primary" type="submit">Reply</button>
                  </div>
                  <div class="auth-form__feedback" data-reply-warning hidden></div>
                </form>
              </div>
            </li>
          `,
        )
        .join("");
    }
  }

  document.title = `${post.title} — stackTrace`;
}


function updateInlineVote(row, source) {
  const upButton = document.querySelector('[data-vote-button="up"]', row);
  const downButton = document.querySelector('[data-vote-button="down"]', row);
  const upCount = document.querySelector(".post-card__vote-count", upButton ?? row);
  const downCount = document.querySelector(".post-card__vote-count", downButton ?? row);

  if (upButton) {
    const active = source.userVote === "up";
    upButton.classList.toggle("is-active", active);
    upButton.setAttribute("aria-pressed", String(active));
    if (upCount) upCount.textContent = String(source.upvotes);
  }

  if (downButton) {
    const active = source.userVote === "down";
    downButton.classList.toggle("is-active", active);
    downButton.setAttribute("aria-pressed", String(active));
    if (downCount) downCount.textContent = String(source.downvotes);
  }
}

function updateVoteState(source, direction, row) {
  const previousState = source.userVote || "none";
  const isSameVote = previousState === direction;

  if (previousState === "up") source.upvotes = Math.max(0, source.upvotes - 1);
  if (previousState === "down") source.downvotes = Math.max(0, source.downvotes - 1);

  if (isSameVote) {
    source.userVote = "none";
  } else {
    if (direction === "up") source.upvotes += 1;
    if (direction === "down") source.downvotes += 1;
    source.userVote = direction;
  }

  updateInlineVote(row, source);
}

function initPostVoteRows(post) {
  const postRow = document.querySelector("[data-post-vote]");
  if (postRow) {
    postRow.dataset.postId = post.id;
    updateInlineVote(postRow, post);
  }

  document.querySelectorAll("[data-vote-row]").forEach((row) => {
    row.addEventListener("click", (event) => {
      const button = event.target.closest("[data-vote-button]");
      if (!button) return;
      event.preventDefault();
      const source = row.dataset.commentId
        ? post.commentList.find((comment) => comment.id === row.dataset.commentId)
        : post;
      if (source) updateVoteState(source, button.dataset.voteButton, row);
    });
  });
}


function applyPostAuthorState() {
  const currentUser = getAuthUser()?.username;
  const post = document.querySelector(".post");
  const actions = document.querySelector("[data-post-actions]");
  const postAuthor = post?.dataset.authorName;

  if (actions) {
    const canManage = Boolean(
      currentUser && postAuthor && currentUser === postAuthor,
    );
    actions.hidden = !canManage;
  }
}


function applyCommentComposerState(commentForm) {
  if (!commentForm) return;

  const input = document.querySelector("[data-comment-input]", commentForm);
  const submit = document.querySelector("button[type='submit']", commentForm);
  const warning = document.querySelector("[data-comment-warning]", commentForm);
  const guest = !isAuthenticated();

  if (input) {
    input.disabled = guest;
    input.placeholder = guest
      ? "Sign in to join the discussion…"
      : "Say something useful…";
    input.setAttribute("aria-disabled", String(guest));
  }

  if (submit) {
    submit.disabled = guest;
  }

  if (guest) {
    showAuthWarning(warning, "comment");
    commentForm.classList.add("is-guest");
  } else {
    hideAuthWarning(warning);
    commentForm.classList.remove("is-guest");
  }
}

function initCommentForms() {
  const forms = document.querySelectorAll("[data-comment-form]");
  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      if (!isAuthenticated()) {
        event.preventDefault();
        showAuthWarning(document.querySelector("[data-comment-warning]", form), "comment");
        return;
      }

      hideAuthWarning(document.querySelector("[data-comment-warning]", form));
    });

    applyCommentComposerState(form);
  });
}

function initReplyToggles() {
  document.querySelectorAll("[data-reply-toggle]").forEach((button) => {
    const form = button.closest(".comment")?.querySelector("[data-reply-form]");
    if (!form) return;

    button.addEventListener("click", () => {
      if (!isAuthenticated()) {
        showAuthWarning(form.querySelector("[data-reply-warning]"), "reply");
        return;
      }

      const isOpen = !form.hidden;
      form.hidden = isOpen;
      button.textContent = isOpen ? "Reply" : "Cancel";
      hideAuthWarning(form.querySelector("[data-reply-warning]"));

      if (!isOpen) {
        const input = document.querySelector("[data-reply-input]", form);
        input?.focus();
      }
    });

    const replyForm = form;
    const replyInput = document.querySelector("[data-reply-input]", replyForm);
    const replySubmit = document.querySelector("button[type='submit']", replyForm);
    const replyWarning = document.querySelector("[data-reply-warning]", replyForm);

    if (replyInput) {
      replyInput.disabled = !isAuthenticated();
    }
    if (replySubmit) {
      replySubmit.disabled = !isAuthenticated();
    }

    replyForm.addEventListener("submit", (event) => {
      if (!isAuthenticated()) {
        event.preventDefault();
        showAuthWarning(replyWarning, "reply");
        return;
      }

      event.preventDefault();
      hideAuthWarning(replyWarning);
      replyForm.hidden = true;
      button.textContent = "Reply";
    });
  });
}

function initDeleteConfirm() {
  const deleteBtn = document.querySelector("[data-delete-post]");
  if (!deleteBtn) return;

  deleteBtn.addEventListener("click", (event) => {
    if (!isAuthenticated()) {
      event.preventDefault();
      showAuthWarning(document.querySelector("[data-post-warning]"), "delete this post");
      return;
    }

    const confirmed = window.confirm("Delete this post? This can't be undone.");
    if (!confirmed) event.preventDefault();
  });
}


async function initPostPage() {

    post = await getPost(getSelectedId());

    renderPostPage();
    refreshAuthStatus();
    applyPostAuthorState();
    initPostVoteRows(post);
    initAutoGrow("[data-autogrow]");
    initCharCounter("[data-comment-input]", "[data-comment-counter]", 500);
  document.querySelectorAll("[data-reply-input]").forEach((input) => {
    const form = input.closest("[data-reply-form]");
    const counter = form?.querySelector("[data-reply-counter]");
    if (counter) {
      const max = Number(input.maxLength || 200);
      const update = () => {
        counter.textContent = `${input.value.length} / ${max}`;
      };
      input.addEventListener("input", update);
      update();
    }
  });
  initCommentForms();
  initReplyToggles();
  initDeleteConfirm();
  initMobileNav();
}

initPostPage();
