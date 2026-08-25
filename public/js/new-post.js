import { initTagInput } from "./utils/tag-input.js";
import { initAutoGrow } from "./utils/textarea.js";
import { initCharCounter } from "./utils/char-counter.js";
import { initMobileNav } from "./utils/nav.js";
import {
  refreshAuthStatus,
  isAuthenticated,
  showAuthWarning,
  hideAuthWarning,
} from "./utils/auth-gate.js";

const tagField = document.querySelector("[data-tag-field]");
const postForm = document.querySelector("[data-post-form]");
const authWarning = document.querySelector("[data-auth-warning]");

function applyGuestState() {
  if (!postForm) return;

  const fields = postForm.querySelectorAll("input, textarea, button");
  const guest = !isAuthenticated();

  fields.forEach((field) => {
    if (field.matches("button[type='submit']")) {
      field.disabled = guest;
    }

    if (field.matches("input, textarea")) {
      field.disabled = guest;
      field.setAttribute("aria-disabled", String(guest));
    }
  });

  if (guest) {
    showAuthWarning(authWarning, "create a post");
  } else {
    hideAuthWarning(authWarning);
  }
}

if (postForm) {
  postForm.addEventListener("submit", (event) => {
    if (!isAuthenticated()) {
      event.preventDefault();
      showAuthWarning(authWarning, "create a post");
    } else {
      hideAuthWarning(authWarning);
    }
  });
}

if (tagField) initTagInput(tagField);

initAutoGrow("[data-autogrow]");
initCharCounter("[data-title-input]", "[data-title-counter]", 90);
refreshAuthStatus();
applyGuestState();
initMobileNav();
