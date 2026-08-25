

const AUTH_STORAGE_KEY = "stacktrace-auth-user";
const LEGACY_AUTH_STORAGE_KEY = "stackTrace-auth-user";


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

function getInitials(user) {
  return user.avatar || (user.fullName || user.username).split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function closeAccountMenus(except) {
  document.querySelectorAll("[data-account-menu]").forEach((menu) => { if (menu !== except) menu.hidden = true; });

  document.querySelectorAll("[data-account-trigger]").forEach((button) => button.setAttribute("aria-expanded", "false"));
}

export function refreshAuthStatus(scope = document) {
  const user = getAuthUser();
  scope.querySelectorAll("[data-auth-status]").forEach((node) => {
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
    const trigger = node.querySelector("[data-account-trigger]");
    const menu = node.querySelector("[data-account-menu]");
    trigger?.addEventListener("click", () => { const open = menu.hidden; closeAccountMenus(menu); menu.hidden = !open; trigger.setAttribute("aria-expanded", String(open)); });
    node.querySelector("[data-signout]")?.addEventListener("click", () => { clearAuthUser(); refreshAuthStatus(); window.location.href = "index.html"; });
  });
}

document.addEventListener("click", (event) => {
  if (!event.target.closest("[data-auth-status]")) closeAccountMenus();
});
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeAccountMenus(); });
