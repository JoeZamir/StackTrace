import { initMobileNav } from "./utils/nav.js";
import { getAuthUser, refreshAuthStatus, setAuthUser } from "./utils/auth-gate.js";

const form = querySelector("[data-profile-form]");
const feedback = querySelector("[data-profile-feedback]");
const currentUser = getAuthUser();

function showMessage(message, isError = false) {
  if (!feedback) return;
  feedback.textContent = message;
  feedback.classList.toggle("is-error", isError);
}

if (!currentUser) window.location.href = "auth.html";

if (form && currentUser) {
  form.fullName.value = currentUser.fullName || "";
  form.email.value = currentUser.email || "";
  form.username.value = currentUser.username || "";

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const updatedUser = {
      ...currentUser,
      fullName: String(data.get("fullName") || "").trim(),
      email: String(data.get("email") || "").trim(),
      username: String(data.get("username") || "").trim(),
    };

    if (!updatedUser.fullName || !updatedUser.email || !updatedUser.username) {
      showMessage("Please complete every profile field.", true);
      return;
    }

    const users = getStoredUsers();
    const normalized = updatedUser.username.toLowerCase();
    const duplicate = users.some((user) => user.username.toLowerCase() === normalized && user.username !== currentUser.username);
    if (duplicate) {
      showMessage("That username is already taken.", true);
      return;
    }

    const nextUsers = users.map((user) => user.username === currentUser.username ? { ...user, ...updatedUser } : user);
    saveStoredUsers(nextUsers);
    setAuthUser(updatedUser);
    refreshAuthStatus();
    showMessage("Profile saved locally. Backend persistence can attach to the same fields later.");
  });
}

refreshAuthStatus();
initMobileNav();

