import { countVotes, getUserVote } from "./voteHelpers.js";
// utils/enrichPost.js

function getInitials(user) {
  return user.avatar || (user.fullName || user.username).split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function formatRelativeTime(value) {
  const then = new Date(value).getTime();
  const now = Date.now();
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

export function enrichComments(comments, users, votes, currUserId) {
  const usersById = new Map(users.map((user) => [user.id, user]));

  return comments.map((comment) => {
    const commentAuthor = usersById.get(comment.authorId);
    const { upvotes, downvotes } = countVotes(votes, "comment", comment.id);
    return {
      ...comment,
      author: commentAuthor?.username || "unknown_user",
      avatar: getInitials(commentAuthor || { username: "??" }),
      time: formatRelativeTime(comment.createdAt),
      upvotes,
      downvotes,
      text: comment.body,
      userVote: getUserVote(votes, 'comment', comment.id, currUserId) || "none",
    };
  });
}

export function enrichPost(post, comments, users, votes, currUserId) {
  const usersById = new Map(users.map((user) => [user.id, user]));
  const author = usersById.get(post.authorId);

  const postComments = comments.filter((comment) => comment.postId === post.id);
  const commentList = enrichComments(postComments, users, votes, currUserId);
  const { upvotes, downvotes } = countVotes(votes, "post", post.id);

  return {
    ...post,
    author: author?.username || "unknown_user",
    avatar: getInitials(author || { username: "??" }),
    excerpt: post.body.split("\n\n")[0],
    time: formatRelativeTime(post.createdAt),
    comments: commentList.length,
    userVote: getUserVote(votes, 'post', post.id, currUserId) || "none",
    upvotes,
    downvotes,
    bodyHtml: formatBody(post.body),
    commentList,
  };
}

export function enrichPosts(posts, comments, users, votes, currUserId) {
  return posts.map((post) => enrichPost(post, comments, users, votes, currUserId));
}

export function enrichUser(user) {
  return {
    ...user,
    avatar: getInitials(user),
  };
}

