import { initMobileNav } from "./utils/nav.js";
import { getPosts } from "./utils/fetchPosts.js";
import {
  getAuthUser,
  refreshAuthStatus,
  setAuthUser,
  hideAuthWarning,
} from "./utils/auth-gate.js";

const authModeToggle = document.querySelector("[data-auth-mode-toggle]");
const authForm = document.querySelector("[data-auth-form]");
const authFeedback = document.querySelector("[data-auth-feedback]");
const authSubmit = document.querySelector("[data-auth-submit]");
const signupFields = document.querySelectorAll(
  "[data-signup-name], [data-signup-email], [data-signup-username]",
);
const loginField = document.querySelector("[data-login-identity]");

const authState = {
  mode: "login",
};
let posts = [];

function setAuthMode(mode) {
  authState.mode = mode;
  const isSignup = mode === "signup";

  signupFields.forEach((field) => {
    field.hidden = !isSignup;
    field.required = isSignup ? true : false;
  });

  loginField.hidden = isSignup;
  loginField.required = !isSignup ? true : false;
  authSubmit.textContent = isSignup ? "Create account" : "Login";

  document.querySelectorAll("[data-auth-tab]", authModeToggle).forEach((button) => {
    const active = button.dataset.authTab === mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (authFeedback) {
    authFeedback.textContent = isSignup
      ? "Create your account to unlock posting, commenting, and replies."
      : "Sign in to continue to the feed.";
    authFeedback.classList.remove("is-error");
  }
}

function showAuthMessage(message, isError = false) {
  if (!authFeedback) return;
  authFeedback.textContent = message;
  authFeedback.classList.toggle("is-error", isError);
}

function signInUser(user) {
  setAuthUser(user);
  refreshAuthStatus();
  window.location.href = "index.html";
}

function initAuthTabs() {
  if (!authModeToggle) return;

  authModeToggle.addEventListener("click", (event) => {
    const button = event.target.closest("[data-auth-tab]");
    if (!button) return;
    setAuthMode(button.dataset.authTab);
  });
}

function initAuthForm() {


  if (!authForm) return;

  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(authForm);
    const identity = String(formData.get("identity") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!password) {
      showAuthMessage("Password is required.", true);
      return;
    }

    if (authState.mode === "login") {
      const hasIdentity = identity.length > 0;
      if (!hasIdentity) {
        showAuthMessage("Enter your email or username to sign in.", true);
        return;
      }

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity, password })
      })

      const data = await response.json();

      if (!response.ok) {
        showAuthMessage(data.error || "Login failed. Please try again.", true);
        return;
      }

      hideAuthWarning(authFeedback);
      signInUser(data);
      return;
    }

    const fullName = String(formData.get("fullName") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const username = String(formData.get("username") || "").trim();

    if (!fullName || !email || !username) {
      showAuthMessage(
        "Please complete your full name, email, and username.",
        true,
      );
      return;
    }

    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showAuthMessage(data.error || "Signup failed. Please try again.", true);
      return;
    }

    hideAuthWarning(authFeedback);
    signInUser(data);
    return;
  });
}

function initModeFromUrl() {
  if (getAuthUser()) {
    window.location.href = "index.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  if (mode === "signup") setAuthMode("signup");
  else setAuthMode("login");
}

async function buildTopicList() {
  const container = document.querySelector("[data-topic-list]");
  if (!container) return;

  posts = await getPosts(); // Fetch posts from the API

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

refreshAuthStatus();
await buildTopicList();
initAuthTabs();
initAuthForm();
initModeFromUrl();
initMobileNav();
