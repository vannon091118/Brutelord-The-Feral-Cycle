/** Der Replay-Check: das Log nachrechnen und den Endzustand vergleichen — ohne Server. */
import { createRaidState, stateHashInput } from './raid-state.js';
import { createRaidWorld } from './raid-world.js';
import { applyAction } from './raid-steps.js';

export function replayRaid({ ticket, actions = [] }) {
  const world = createRaidWorld({ snapshotSeed: ticket.snapshotSeed });
  return actions.reduce((state, action) => applyAction(state, world, action), createRaidState(ticket));
}

/** Der Client behauptet einen Endzustand; der Server hält seinen eigenen daneben. */
export function replayMatches({ ticket, actions = [], claimed }) {
  const eigenes = replayRaid({ ticket, actions });
  return JSON.stringify(stateHashInput(eigenes)) === JSON.stringify(stateHashInput(claimed));
}