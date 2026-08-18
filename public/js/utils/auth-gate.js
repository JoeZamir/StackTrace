import { qs, qsa } from "./dom.js";

const AUTH_STORAGE_KEY = "devfeed-auth-user";
const USERS_STORAGE_KEY = "devfeed-users";

const defaultUsers = [
  {
    fullName: "Ada Lovelace",
    email: "ada@example.com",
    username: "ada_codes",
    password: "devfeed123",
  },
  {
    fullName: "Tomek Banas",
    email: "tomek@example.com",
    username: "tomek_b",
    password: "devfeed123",
  },
  {
    fullName: "Kesh Patel",
    email: "kesh@example.com",
    username: "kesh_dev",
    password: "devfeed123",
  },
];

export function getStoredUsers() {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
      return [...defaultUsers];
    }
    return JSON.parse(stored);
  } catch {
    return [...defaultUsers];
  }
}

export function saveStoredUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function getAuthUser() {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function setAuthUser(user) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function clearAuthUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isAuthenticated() {
  return Boolean(getAuthUser());
}

export function getAuthWarning(action) {
  return `You must be signed in to ${action}.`;
}

export function showAuthWarning(element, action) {
  if (!element) return;
  element.hidden = false;
  element.textContent = getAuthWarning(action);
  element.classList.add("is-warning");
  element.classList.remove("is-error");
}

export function hideAuthWarning(element) {
  if (!element) return;
  element.hidden = true;
  element.textContent = "";
  element.classList.remove("is-warning", "is-error");
}

export function refreshAuthStatus(scope = document) {
  const user = getAuthUser();
  qsa("[data-auth-status]", scope).forEach((node) => {
    if (user) {
      const shortName = user.username.slice(0, 2).toUpperCase();
      node.innerHTML = `
        <div class="account-pill">
          <span class="account-pill__avatar" aria-label="Current user avatar">${shortName}</span>
          <span class="account-pill__name">${user.username}</span>
          <button type="button" class="account-pill__signout" data-signout>Sign out</button>
        </div>
      `;
    } else {
      node.innerHTML = `
        <a href="auth.html">Login</a>
        <span>/</span>
        <a href="auth.html?mode=signup">Sign up</a>
      `;
    }

    const signOutBtn = qs("[data-signout]", node);
    if (signOutBtn) {
      signOutBtn.addEventListener("click", () => {
        clearAuthUser();
        refreshAuthStatus();
        window.location.href = "index.html";
      });
    }
  });
}
