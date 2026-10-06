// @doc: docs/daten/raid/raid-sim.md#raid-sim
import { RAID_ACTION, RAID_STEP } from './raid-actions.js';
import { RAID_CONFIG } from './raid-config.js';
import { createRaidState, stateHashInput } from './raid-state.js';
import { createRaidWorld } from './raid-world.js';
import { applyAction } from './raid-steps.js';
import { pickFrom } from '../brutelord/stone-seed.js';

export const RAID_SIM = Object.freeze({ steps: 96, seed: 0x5eed1a, salt: 0x51ed270b });

const WOERTER = Object.freeze([
  ...RAID_STEP,
  ...RAID_STEP.map((type) => type.replace('MOVE', 'DIG')),
  RAID_ACTION.ATTACK,
  RAID_ACTION.LOOT,
  RAID_ACTION.SACRIFICE,
]);

function actionFor(seed, index) {
  return { type: WOERTER[pickFrom(seed, (RAID_SIM.salt + index * 977) >>> 0, WOERTER.length)] };
}

export function raidScript({ seed = RAID_SIM.seed, steps = RAID_SIM.steps } = {}) {
  const anzahl = Math.min(Math.max(0, steps), RAID_CONFIG.maxActions);
  return Array.from({ length: anzahl }, (_, index) => actionFor(seed, index));
}

export function raidDigest(state) {
  const text = JSON.stringify(stateHashInput(state));
  let h = 2166136261;
  for (let index = 0; index < text.length; index += 1) h = Math.imul(h ^ text.charCodeAt(index), 16777619);
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function raidSeries({ ticket, seed = RAID_SIM.seed, steps = RAID_SIM.steps, actions = null } = {}) {
  const world = createRaidWorld({ snapshotSeed: ticket.snapshotSeed });
  const skript = actions ?? raidScript({ seed, steps });
  let state = createRaidState(ticket);
  const digests = skript.map((action) => {
    state = applyAction(state, world, action);
    return raidDigest(state);
  });
  return { actions: skript, digests, state };
}
