import rawPosts from "./posts.json" with { type: "json" };
import rawComments from "./comments.json" with { type: "json" };
import users from "./users.json" with { type: "json" };

function getInitials(user) {
  return user.avatar || user.displayName?.slice(0, 2).toUpperCase() || user.username.slice(0, 2).toUpperCase();
}

function formatRelativeTime(value) {
  const then = new Date(value).getTime();
  const now = new Date("2026-08-17T10:00:00Z").getTime();
  const minutes = Math.max(1, Math.round((now - then) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatBody(markdown) {
  const blocks = String(markdown || "").split(/\n{2,}/);
  return blocks.map((block) => {
    if (block.startsWith("```")) {
      const code = block.replace(/^```\w*\n?/, "").replace(/```$/, "");
      return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
    }
    return `<p>${escapeHtml(block).replace(/`([^`]+)`/g, "<code>$1</code>")}</p>`;
  }).join("");
}

const usersById = new Map(users.map((user) => [user.id, user]));
const commentsByPost = rawComments.reduce((map, comment) => {
  const list = map.get(comment.postId) || [];
  list.push(comment);
  map.set(comment.postId, list);
  return map;
}, new Map());

export { users };
export const posts = rawPosts.map((post, index) => {
  const author = usersById.get(post.authorId);
  const commentList = (commentsByPost.get(post.id) || []).map((comment) => {
    const commentAuthor = usersById.get(comment.authorId);
    return {
      ...comment,
      author: commentAuthor?.username || "unknown_user",
      avatar: getInitials(commentAuthor || { username: "??" }),
      time: formatRelativeTime(comment.createdAt),
      text: comment.body,
      userVote: "none",
    };
  });

  return {
    ...post,
    numericId: index + 1,
    author: author?.username || "unknown_user",
    avatar: getInitials(author || { username: "??" }),
    excerpt: post.body.split("\n\n")[0],
    time: formatRelativeTime(post.createdAt),
    comments: commentList.length,
    userVote: "none",
    bodyHtml: formatBody(post.body),
    commentList,
  };
});

export const newsItems = [
  { title: "New post in the feed", detail: "A note about improved API testing workflows landed in the community feed.", time: "2m ago" },
  { title: "Node debugging thread trending", detail: "Developers are discussing memory profiling and long-lived worker processes.", time: "8m ago" },
  { title: "Express tooling update", detail: "A new route scaffolding tool is getting attention from people building quick prototypes.", time: "17m ago" },
  { title: "Design system cleanup", detail: "The terminal/editorial styling pass is being refined for better contrast and readability.", time: "24m ago" },
  { title: "Release notes shared", detail: "The team dropped a note about the next learning milestone: frontend polish and live notification UI.", time: "44m ago" },
];
