// Pure functions describing how a vote control changes state.
// Kept separate from the DOM so the logic is easy to reason about (and test).

const VOTE_VALUE = { none: 0, up: 1, down: -1 };

// Pressing the active button clears the vote; otherwise it switches to it.
export function nextVoteState(currentState, action) {
  if (action === "up") return currentState === "up" ? "none" : "up";
  if (action === "down") return currentState === "down" ? "none" : "down";
  return currentState;
}

// How much the visible count should change when moving between two states.
export function voteDelta(prevState, nextState) {
  return VOTE_VALUE[nextState] - VOTE_VALUE[prevState];
}
