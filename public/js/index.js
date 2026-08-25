import { initMobileNav } from "./utils/nav.js";
import { getPosts } from "./utils/fetchPosts.js";
import { getComments } from "./utils/comments.js";
import { enrichPost } from "./site-data.js";

const TOPIC_POOL = [
  "api-design",
  "async",
  "cli",
  "debugging",
  "express",
  "node.js",
  "performance",
  "typescript",
  "show-stacktrace",
  "api",
  "testing",
  "security",
  "databases",
  "architecture",
  "learning",
  "tooling",
  "system-design",
  "observability",
  "react",
  "nextjs",
  "postgres",
  "prisma",
  "deployment",
  "patterns",
  "frontend",
  "backend",
  "infra",
  "sql",
  "redis",
  "graphql",
  "websocket",
  "sse",
  "authentication",
  "ux",
  "design",
  "docs",
  "monorepo",
  "microservices",
  "cloud",
];

let feedPosts = [];
let comments = [];

let activeTopic = null;

function getVisiblePosts() {
  if (!activeTopic) return feedPosts;
  return feedPosts.filter((post) => post.tags.includes(activeTopic));
}

function buildTopicList() {
  const container = document.querySelector("[data-topic-list]");
  if (!container) return;

  const totals = new Map();
  feedPosts.forEach((post) => {
    post.tags.forEach((tag) => totals.set(tag, (totals.get(tag) || 0) + 1));
  });

  const topics = [...new Set([...TOPIC_POOL, ...Array.from(totals.keys())])]
    .map((tag) => ({ tag, count: totals.get(tag) || 0 }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.tag.localeCompare(b.tag);
    })
    .slice(0, 8);

  container.innerHTML = topics
    .map(
      (topic) => `
        <button type="button" data-topic="${topic.tag}">
          <span>#${topic.tag}</span>
          <span class="sidebar-topic-list__count">${topic.count}</span>
        </button>
      `,
    )
    .join("");
}

function syncVoteRow(postId) {
  const post = feedPosts.find((item) => item.id === postId);
  if (!post) return;

  const row = document.querySelector(`[data-vote-row][data-post-id="${post.id}"]`);
  if (!row) return;

  const upButton = document.querySelector('[data-vote-button="up"]', row);
  const downButton = document.querySelector('[data-vote-button="down"]', row);
  const upCount = document.querySelector(".post-card__vote-count", upButton ?? row);
  const downCount = document.querySelector(".post-card__vote-count", downButton ?? row);

  if (upButton) {
    const isActive = post.userVote === "up";
    upButton.classList.toggle("is-active", isActive);
    upButton.setAttribute("aria-pressed", String(isActive));
    if (upCount) {
      upCount.textContent = String(post.upvotes);
    }
  }

  if (downButton) {
    const isActive = post.userVote === "down";
    downButton.classList.toggle("is-active", isActive);
    downButton.setAttribute("aria-pressed", String(isActive));
    if (downCount) {
      downCount.textContent = String(post.downvotes);
    }
  }
}

function renderFeedPosts() {
  const list = document.querySelector("[data-feed-list]");
  if (!list) return;

  const visiblePosts = getVisiblePosts();

  if (visiblePosts.length === 0) {
    list.innerHTML = `
      <li class="post-card post-card--empty">
        <div class="post-card__body">
          <h2 class="post-card__title">No posts match this topic yet.</h2>
          <p class="post-card__excerpt">Pick another tag or clear the filter to see the full feed.</p>
        </div>
      </li>
    `;
    return;
  }

  list.innerHTML = visiblePosts
    .map(
      (post) => `
        <li class="post-card" data-post-id="${post.id}">
          <div class="post-card__body">
            <div class="post-card__header">
              <div class="byline">
                <span class="byline__avatar">${post.avatar}</span>
                <span class="byline__name">${post.author}</span>
                <span class="byline__dot"></span>
                <span>${post.time}</span>
              </div>
            </div>

            <h2 class="post-card__title"><a href="post.html?id=${post.id}">${post.title}</a></h2>
            <p class="post-card__excerpt">${post.excerpt}</p>

            <ul class="tag-list">
              ${post.tags.map((tag) => `<li class="tag-pill">${tag}</li>`).join("")}
            </ul>

            <div class="post-card__footer">
              <div class="post-card__vote-row" data-vote-row data-post-id="${post.id}">
                <button
                  class="post-card__vote ${post.userVote === "up" ? "is-active" : ""}"
                  type="button"
                  data-vote-button="up"
                  data-post-id="${post.id}"
                  aria-label="Upvote"
                  aria-pressed="${post.userVote === "up"}"
                >
                  <span aria-hidden="true">▲</span>
                  <span class="post-card__vote-count">${post.upvotes}</span>
                </button>
                <button
                  class="post-card__vote ${post.userVote === "down" ? "is-active" : ""}"
                  type="button"
                  data-vote-button="down"
                  data-post-id="${post.id}"
                  aria-label="Downvote"
                  aria-pressed="${post.userVote === "down"}"
                >
                  <span aria-hidden="true">▼</span>
                  <span class="post-card__vote-count">${post.downvotes}</span>
                </button>
              </div>

              <div class="post-card__actions">
                <a class="post-card__action" href="post.html?id=${post.id}"><span aria-hidden="true">💬</span> Comment</a>
                <a class="post-card__comments" href="post.html?id=${post.id}">${post.comments} comments</a>
              </div>
            </div>
          </div>
        </li>
      `,
    )
    .join("");

  initVoteButtons();
}

function updateVoteState(postId, direction) {
  const post = feedPosts.find((item) => item.id === postId);
  if (!post) return;

  const previousState = post.userVote || "none";
  const isSameVote = previousState === direction;

  if (previousState === "up") {
    post.upvotes = Math.max(0, post.upvotes - 1);
  }

  if (previousState === "down") {
    post.downvotes = Math.max(0, post.downvotes - 1);
  }

  if (isSameVote) {
    post.userVote = "none";
  } else {
    if (direction === "up") post.upvotes += 1;
    if (direction === "down") post.downvotes += 1;
    post.userVote = direction;
  }

  syncVoteRow(post.id);
}

function initVoteButtons() {
  document.querySelectorAll("[data-vote-button]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      updateVoteState(button.dataset.postId, button.dataset.voteButton);
    });
  });
}

function initTopicFilters() {
    document.querySelectorAll("[data-topic]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextTopic = button.dataset.topic;
      activeTopic = activeTopic === nextTopic ? null : nextTopic;
      document.querySelectorAll("[data-topic]").forEach((topicButton) =>
        topicButton.classList.toggle(
          "is-active",
          topicButton.dataset.topic === activeTopic,
        ),
      );
      renderFeedPosts();
    });
  });
}

function initSortToolbar() {
  const toolbar = document.querySelector("[data-sort-toolbar]");
  if (!toolbar) return;

  toolbar.addEventListener("click", (event) => {
    const button = event.target.closest("[data-sort]");
    if (!button) return;
    document.querySelectorAll("[data-sort]", toolbar).forEach((btn) =>
      btn.classList.remove("is-active"),
    );
    button.classList.add("is-active");
  });
}

function getEnrichedPost(post, comments) {
  let users = [];
  const enriched = enrichPost(post, comments, users);
  return enriched;
}

async function init() {
  feedPosts = await getPosts();
  comments = await getComments();
  enriched = getEnrichedPost(feedPosts, comments);
  console.log(enriched);


    buildTopicList();
    renderFeedPosts();
    initTopicFilters();
    initSortToolbar();
    initMobileNav();
  }

  init();
