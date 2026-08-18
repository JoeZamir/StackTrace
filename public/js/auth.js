import { qs, qsa } from "./utils/dom.js";
import { initMobileNav } from "./utils/nav.js";
import { posts } from "../../data/site-data.js";
import {
  getAuthUser,
  getStoredUsers,
  refreshAuthStatus,
  saveStoredUsers,
  setAuthUser,
  hideAuthWarning,
} from "./utils/auth-gate.js";

const authModeToggle = qs("[data-auth-mode-toggle]");
const authForm = qs("[data-auth-form]");
const authFeedback = qs("[data-auth-feedback]");
const authSubmit = qs("[data-auth-submit]");
const signupFields = qsa(
  "[data-signup-name], [data-signup-email], [data-signup-username]",
);
const loginField = qs("[data-login-identity]");

const authState = {
  mode: "login",
};

function setAuthMode(mode) {
  authState.mode = mode;
  const isSignup = mode === "signup";

  signupFields.forEach((field) => {
    field.hidden = !isSignup;
  });

  loginField.hidden = isSignup;
  authSubmit.textContent = isSignup ? "Create account" : "Login";

  qsa("[data-auth-tab]", authModeToggle).forEach((button) => {
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

function normalizeIdentity(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function signInUser(user) {
  setAuthUser({
    fullName: user.fullName,
    email: user.email,
    username: user.username,
  });
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

  authForm.addEventListener("submit", (event) => {
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

      const users = getStoredUsers();
      const matchedUser = users.find((user) => {
        const id = normalizeIdentity(identity);
        return (
          (normalizeIdentity(user.email) === id ||
            normalizeIdentity(user.username) === id) &&
          user.password === password
        );
      });

      if (!matchedUser) {
        showAuthMessage(
          "We couldn't find a matching account with that email/username and password.",
          true,
        );
        return;
      }

      hideAuthWarning(authFeedback);
      signInUser(matchedUser);
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

    const users = getStoredUsers();
    const duplicateUser = users.find(
      (user) =>
        normalizeIdentity(user.email) === normalizeIdentity(email) ||
        normalizeIdentity(user.username) === normalizeIdentity(username),
    );

    if (duplicateUser) {
      showAuthMessage(
        "An account with that email or username already exists.",
        true,
      );
      return;
    }

    const nextUser = { fullName, email, username, password };
    users.push(nextUser);
    saveStoredUsers(users);
    showAuthMessage(
      "Account created. You can now sign in and join the discussion.",
    );
    setAuthMode("login");
    authForm.reset();
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

function buildTopicList() {
  const container = qs("[data-topic-list]");
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

refreshAuthStatus();
buildTopicList();
initAuthTabs();
initAuthForm();
initModeFromUrl();
initMobileNav();
