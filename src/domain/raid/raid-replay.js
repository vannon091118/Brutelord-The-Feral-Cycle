// @doc: docs/daten/raid/raid-replay.md#raid-replay
import { createRaidState, stateHashInput } from './raid-state.js';
import { createRaidWorld } from './raid-world.js';
import { applyAction } from './raid-steps.js';
import { RAID_CONFIG } from './raid-config.js';

export function replayRaid({ ticket, actions = [] }) {
  const world = createRaidWorld({ snapshotSeed: ticket.snapshotSeed });
  return actions.reduce((state, action) => applyAction(state, world, action), createRaidState(ticket));
}

export function replayOverflow(actions) {
  return actions.length > RAID_CONFIG.maxActions;
}

export function replayMatches({ ticket, actions = [], claimed }) {
  if (replayOverflow(actions)) return false;
  const eigenes = replayRaid({ ticket, actions });
  return JSON.stringify(stateHashInput(eigenes)) === JSON.stringify(stateHashInput(claimed));
}
