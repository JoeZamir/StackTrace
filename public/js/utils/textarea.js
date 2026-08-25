
function autoGrow(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export function initAutoGrow(selector, scope = document) {
  scope.querySelectorAll(selector).forEach((textarea) => {
    autoGrow(textarea);
    textarea.addEventListener("input", () => autoGrow(textarea));
  });
}
