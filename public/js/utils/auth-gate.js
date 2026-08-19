import { qs, qsa } from "./dom.js";
import seedUsers from "../../../data/users.json" with { type: "json" };

const AUTH_STORAGE_KEY = "stacktrace-auth-user";
const USERS_STORAGE_KEY = "stacktrace-users";
const LEGACY_AUTH_STORAGE_KEY = "stackTrace-auth-user";
const LEGACY_USERS_STORAGE_KEY = "stackTrace-users";

function cloneUsers(users) {
  return users.map((user) => ({ ...user }));
}

function normalizeSeedUser(user) {
  return {
    ...user,
    fullName: user.fullName || user.displayName || user.username,
    email: user.email || `${user.username}@example.com`,
    password: user.password || "stacktrace123",
  };
}

const defaultUsers = cloneUsers(seedUsers).map(normalizeSeedUser);

export function getStoredUsers() {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY) || localStorage.getItem(LEGACY_USERS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
      return cloneUsers(defaultUsers);
    }
    const users = JSON.parse(stored).map(normalizeSeedUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return users;
  } catch {
    return cloneUsers(defaultUsers);
  }
}

export function saveStoredUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function getAuthUser() {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(LEGACY_AUTH_STORAGE_KEY);
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
  localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
}

export function isAuthenticated() { return Boolean(getAuthUser()); }
export function getAuthWarning(action) { return `You must be signed in to ${action}.`; }
export function showAuthWarning(element, action) { if (!element) return; element.hidden = false; element.textContent = getAuthWarning(action); element.classList.add("is-warning"); element.classList.remove("is-error"); }
export function hideAuthWarning(element) { if (!element) return; element.hidden = true; element.textContent = ""; element.classList.remove("is-warning", "is-error"); }

function getInitials(user) {
  return user.avatar || (user.fullName || user.username).split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function closeAccountMenus(except) {
  qsa("[data-account-menu]").forEach((menu) => { if (menu !== except) menu.hidden = true; });
  qsa("[data-account-trigger]").forEach((button) => button.setAttribute("aria-expanded", "false"));
}

export function refreshAuthStatus(scope = document) {
  const user = getAuthUser();
  qsa("[data-auth-status]", scope).forEach((node) => {
    if (user) {
      node.innerHTML = `
        <div class="account-menu">
          <button type="button" class="account-pill" data-account-trigger aria-haspopup="menu" aria-expanded="false" aria-label="Open account menu"><span class="account-pill__avatar">${getInitials(user)}</span></button>
          <div class="account-popover" data-account-menu role="menu" hidden>
            <div class="account-popover__identity"><span class="account-pill__avatar">${getInitials(user)}</span><strong>${user.fullName || user.username}</strong></div>
            <a class="account-popover__item" role="menuitem" href="profile.html"><span aria-hidden="true">✎</span><span>Edit profile</span></a>
            <button class="account-popover__item account-popover__item--logout" type="button" role="menuitem" data-signout><span aria-hidden="true">↪</span><span>Logout</span></button>
            <div class="account-popover__legal"><a href="#privacy">Privacy Policy</a><span>·</span><a href="#terms">Terms of Service</a></div>
          </div>
        </div>`;
    } else {
      node.innerHTML = `<a href="auth.html">Login</a><span>/</span><a href="auth.html?mode=signup">Sign up</a>`;
    }
    const trigger = qs("[data-account-trigger]", node);
    const menu = qs("[data-account-menu]", node);
    trigger?.addEventListener("click", () => { const open = menu.hidden; closeAccountMenus(menu); menu.hidden = !open; trigger.setAttribute("aria-expanded", String(open)); });
    qs("[data-signout]", node)?.addEventListener("click", () => { clearAuthUser(); refreshAuthStatus(); window.location.href = "index.html"; });
  });
}

document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-auth-status]")) closeAccountMenus();
});
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeAccountMenus(); });
