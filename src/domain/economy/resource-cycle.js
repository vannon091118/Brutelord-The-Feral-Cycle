// @doc: docs/daten/economy/resource-cycle.md#resource-cycle
import { canUnlockDepth, createBloodstoneLedger, depositBloodstone, unlockDepth } from './bloodstone-loop.js';
import { createAetherLedger } from './aether-loop.js';
import { BUILDING_STATE, BUILDING_TYPE } from '../buildings/building-config.js';
import { DEEPEST_FLOOR, canDescend } from '../world/floor.js';

export function createCycle() {
  return Object.freeze({ aether: createAetherLedger(), bloodstone: createBloodstoneLedger() });
}

export function cycleOf(state) {
  return state?.economy ?? createCycle();
}

export function lowestReachable(cycle) {
  return DEEPEST_FLOOR + cycle.bloodstone.depth;
}

export function ladderOpen(buildings = []) {
  return buildings.some((building) => building.type === BUILDING_TYPE.LADDER_SHAFT && building.state === BUILDING_STATE.READY);
}

export function descendOpen({ depth, cycle, buildings = [] }) {
  if (!ladderOpen(buildings)) return false;
  return canDescend(depth) || canUnlockDepth(cycle.bloodstone);
}

export function buyFloor(cycle) {
  if (!canUnlockDepth(cycle.bloodstone)) return { ok: false, cycle };
  const kauf = unlockDepth(cycle.bloodstone);
  return { ok: true, cycle: { ...cycle, bloodstone: kauf.ledger } };
}

export function lootInto(cycle, loot) {
  const menge = Number.isFinite(loot?.bloodstone) ? loot.bloodstone : 0;
  const bloodstone = depositBloodstone(cycle.bloodstone, menge);
  return bloodstone === cycle.bloodstone ? cycle : { ...cycle, bloodstone };
}
