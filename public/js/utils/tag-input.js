import { qs } from "./dom.js";

const MAX_TAGS = 5;

// Turns a text input + hidden field into a chip-style tag picker.
// The hidden input holds a comma-separated value so a normal <form>
// submit still carries the tags without any fetch/JS-driven networking.
export function initTagInput(root) {
  const input = qs("[data-tag-input]", root);
  const list = qs("[data-tag-list]", root);
  const hiddenField = qs("[data-tag-value]", root);
  if (!input || !list || !hiddenField) return;

  const tags = hiddenField.value ? hiddenField.value.split(",") : [];

  function render() {
    list.innerHTML = "";
    tags.forEach((tag, index) => {
      const chip = document.createElement("li");
      chip.className = "tag-chip";
      chip.innerHTML = `<span>${tag}</span>
        <button type="button" data-remove-tag="${index}" aria-label="Remove tag ${tag}">&times;</button>`;
      list.appendChild(chip);
    });
    hiddenField.value = tags.join(",");
  }

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== ",") return;
    event.preventDefault();

    const value = input.value.trim().replace(",", "");
    const canAdd = value && !tags.includes(value) && tags.length < MAX_TAGS;
    if (canAdd) {
      tags.push(value);
      input.value = "";
      render();
    }
  });

  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-tag]");
    if (!button) return;
    tags.splice(Number(button.dataset.removeTag), 1);
    render();
  });

  render();
}
