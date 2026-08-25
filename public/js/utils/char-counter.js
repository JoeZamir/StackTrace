// Wires a live "12 / 80" counter and a limit warning class onto `counterEl`.
export function initCharCounter(inputSelector, counterSelector, max, scope = document) {
  const input = scope.querySelector(inputSelector, scope);
  const counter = scope.querySelector(counterSelector, scope);
  if (!input || !counter) return;

  const update = () => {
    counter.textContent = `${input.value.length} / ${max}`;
    counter.classList.toggle("is-limit", input.value.length >= max);
  };

  input.addEventListener("input", update);
  update();
}
