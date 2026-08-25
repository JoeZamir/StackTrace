import { initMobileNav } from "./utils/nav.js";

let newsItems = [];

function buildTopicList() {
  const container = querySelector("[data-topic-list]");
  if (!container) return;

  const totals = new Map();
  posts.forEach((post) => {
    post.tags.forEach((tag) => totals.set(tag, (totals.get(tag) || 0) + 1));
  });

  const topics = Array.from(totals.entries())
    .map(([tag, count]) => ({ tag, count }))
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

function renderNewsItems() {
  const list = querySelector("[data-news-list]");
  if (!list) return;

  list.innerHTML = newsItems
    .map(
      (item) => `
        <li class="news-item">
          <span class="news-item__time">${item.time}</span>
          <div class="news-item__content">
            <h2>${item.title}</h2>
            <p>${item.detail}</p>
          </div>
        </li>
      `,
    )
    .join("");
}

renderNewsItems();
buildTopicList();
initMobileNav();


/*
const eventSource = new EventSource("/api/news")

const liveContainer = document.getElementById("live-container")


// Handle live price updates
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  const story = data.story
  liveContainer.textContent = story
}

// Handle connection loss
eventSource.onerror = () => {
  console.log("Connection lost. Attempting to reconnect...")
}

*/
