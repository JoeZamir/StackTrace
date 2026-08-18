import { qs, qsa } from "./utils/dom.js";
import { initVoteControls } from "./utils/vote-control.js";
import { initAutoGrow } from "./utils/textarea.js";
import { initCharCounter } from "./utils/char-counter.js";
import { initMobileNav } from "./utils/nav.js";
import {
  getAuthUser,
  isAuthenticated,
  refreshAuthStatus,
  showAuthWarning,
  hideAuthWarning,
} from "./utils/auth-gate.js";
import { posts } from "../../data/site-data.js";

const POST_DATA = posts.reduce((map, post) => {
  map[post.id] = post;
  return map;
}, {});

function getSelectedPost() {
  const id = Number(
    new URLSearchParams(window.location.search).get("id") || "1",
  );
  return POST_DATA[id] || posts[0];
}

function renderPostPage() {
  const post = getSelectedPost();
  const article = qs(".post");
  if (!article) return;

  article.dataset.postId = String(post.id);
  article.dataset.authorName = post.author;

  const title = qs(".post__title", article);
  if (title) title.textContent = post.title;

  const meta = qs(".post__meta", article);
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

  const body = qs(".post__body", article);
  if (body) body.innerHTML = post.body;

  const commentsSection = qs(".comments", document.body);
  if (commentsSection) {
    const comments = Array.isArray(post.commentList) ? post.commentList : [];
    const count = qs(".comments__count", commentsSection);
    if (count) count.textContent = `${comments.length} comments`;

    const list = qs(".comment-list", commentsSection);
    if (list) {
      list.innerHTML = comments
        .map(
          (comment) => `
            <li class="comment" data-comment-author="${comment.author}">
              <div class="vote" data-vote-control>
                <button class="vote__btn" data-vote-action="up" aria-label="Upvote">▲</button>
                <span class="vote__count" data-vote-count>3</span>
                <button class="vote__btn" data-vote-action="down" aria-label="Downvote">▼</button>
              </div>
              <div>
                <div class="comment__meta">
                  <div class="byline">
                    <span class="byline__avatar">${comment.avatar}</span>
                    <span class="byline__name">${comment.author}</span>
                    <span class="byline__dot"></span>
                    <span>${comment.time}</span>
                  </div>
                </div>
                <p class="comment__body">${comment.text}</p>
                <div class="comment__actions">
                  <button class="comment__action" type="button"><span aria-hidden="true">▲</span> Upvote</button>
                  <button class="comment__action" type="button"><span aria-hidden="true">▼</span> Downvote</button>
                  <button class="comment__action" type="button" data-reply-toggle>Reply</button>
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

  document.title = `${post.title} — devfeed`;
}

function applyPostAuthorState() {
  const currentUser = getAuthUser()?.username;
  const post = qs(".post");
  const actions = qs("[data-post-actions]");
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

  const input = qs("[data-comment-input]", commentForm);
  const submit = qs("button[type='submit']", commentForm);
  const warning = qs("[data-comment-warning]", commentForm);
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
  const forms = qsa("[data-comment-form]");
  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      if (!isAuthenticated()) {
        event.preventDefault();
        showAuthWarning(qs("[data-comment-warning]", form), "comment");
        return;
      }

      hideAuthWarning(qs("[data-comment-warning]", form));
    });

    applyCommentComposerState(form);
  });
}

function initReplyToggles() {
  qsa("[data-reply-toggle]").forEach((button) => {
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
        const input = qs("[data-reply-input]", form);
        input?.focus();
      }
    });

    const replyForm = form;
    const replyInput = qs("[data-reply-input]", replyForm);
    const replySubmit = qs("button[type='submit']", replyForm);
    const replyWarning = qs("[data-reply-warning]", replyForm);

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
  const deleteBtn = qs("[data-delete-post]");
  if (!deleteBtn) return;

  deleteBtn.addEventListener("click", (event) => {
    if (!isAuthenticated()) {
      event.preventDefault();
      showAuthWarning(qs("[data-post-warning]"), "delete this post");
      return;
    }

    const confirmed = window.confirm("Delete this post? This can't be undone.");
    if (!confirmed) event.preventDefault();
  });
}

function initPostPage() {
  renderPostPage();
  refreshAuthStatus();
  applyPostAuthorState();
  initVoteControls();
  initAutoGrow("[data-autogrow]");
  initCharCounter("[data-comment-input]", "[data-comment-counter]", 500);
  qsa("[data-reply-input]").forEach((input) => {
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
