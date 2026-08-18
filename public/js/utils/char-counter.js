import { qs } from "./dom.js";

// Wires a live "12 / 80" counter and a limit warning class onto `counterEl`.
export function initCharCounter(inputSelector, counterSelector, max, scope = document) {
  const input = qs(inputSelector, scope);
  const counter = qs(counterSelector, scope);
  if (!input || !counter) return;

  const update = () => {
    counter.textContent = `${input.value.length} / ${max}`;
    counter.classList.toggle("is-limit", input.value.length >= max);
  };

  input.addEventListener("input", update);
  update();
}
