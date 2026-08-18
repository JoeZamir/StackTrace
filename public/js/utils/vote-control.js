import { qs, qsa } from "./dom.js";
import { nextVoteState, voteDelta } from "./vote.js";

// Wires up every [data-vote-control] found under `scope`.
// This is UI-only: it updates the number on screen, it does not persist
// anything. The backend logic for real vote counts happens server-side.
export function initVoteControls(scope = document) {
  qsa("[data-vote-control]", scope).forEach((control) => {
    const countEl = qs("[data-vote-count]", control);
    let state = "none";
    let count = Number(countEl.textContent);

    control.addEventListener("click", (event) => {
      const button = event.target.closest("[data-vote-action]");
      if (!button) return;

      const action = button.dataset.voteAction;
      const next = nextVoteState(state, action);

      count += voteDelta(state, next);
      countEl.textContent = count;
      state = next;

      qsa("[data-vote-action]", control).forEach((btn) => btn.classList.remove("is-active"));
      if (state !== "none") {
        qs(`[data-vote-action="${state}"]`, control).classList.add("is-active");
      }
    });
  });
}
