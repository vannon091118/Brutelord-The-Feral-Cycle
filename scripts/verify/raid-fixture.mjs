/** Der Prüfaufbau des Raids: Ticket mit Kader, fremder Dungeon, zwei Bewegungshelfer. */
import { entryPointFor } from '../../src/domain/raid/raid-spawn-seed.js';
import { createRaidWorld } from '../../src/domain/raid/raid-world.js';
import { orderFrom, tickMove } from '../../src/domain/raid/raid-move.js';
import { RAID_VERB } from '../../src/domain/raid/raid-verbs.js';
import { createRaidState } from '../../src/domain/raid/raid-state.js';

export const SNAPSHOT_SEED = 4242;

export function raidWorld(seed = SNAPSHOT_SEED) {
  return createRaidWorld({ snapshotSeed: seed });
}

export function raidTicket({ traits = [], dig = true, heroes = 1 } = {}) {
  const world = raidWorld();
  const team = Array.from({ length: heroes }, (unused, index) => ({
    id: `held-${index}`,
    name: `Held ${index}`,
    atk: 4,
    grit: 20,
    speed: 5,
    traits,
    dig,
  }));
  return { id: 'ticket-1', snapshotSeed: SNAPSHOT_SEED, entry: entryPointFor(world, { seed: 11, origin: world.hiveOrigin }), heroes: team };
}

export function raidState(options = {}) {
  return createRaidState(raidTicket(options));
}

export function runTicks(state, world, ticks) {
  let current = state;
  for (let tick = 0; tick < ticks; tick += 1) current = tickMove(current, world);
  return current;
}

export function westOf(state, steps = 1) {
  return { x: state.at.x - steps, y: state.at.y };
}

export function digTo(state, world, point) {
  const ordered = orderFrom(state, world, { verb: RAID_VERB.DIG, ...point });
  return runTicks(ordered, world, ordered.path.length);
}

export function knownCount(state) {
  return Object.keys(state.dug).length;
}