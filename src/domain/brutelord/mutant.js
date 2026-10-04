/** Die Fusion: Steine wandern in einen Dungling, die Rückentwicklung löst sie. */
import { placedStones } from './lab-state.js';
import { MUTANT_CONFIG, STONE_CONFIG } from './stone-config.js';

export function unitStones(worker) {
  return worker.stones ?? [];
}

export function isMutant(worker) {
  return unitStones(worker).length > 0;
}

export function fusionStones(lab) {
  return placedStones(lab);
}

export function investedIn(stones) {
  return stones.length * STONE_CONFIG.cost;
}

// Mutieren darf jeder; freie Dunglinge gehen den arbeitenden vor.
export function nextCandidate(dunglings) {
  const free = dunglings.filter((worker) => !isMutant(worker));
  return free.find((worker) => !worker.job) ?? free[0] ?? null;
}

export function fuse(worker, stones) {
  if (stones.length === 0 || isMutant(worker)) return null;
  return { ...worker, stones, invested: investedIn(stones), battleEp: 0 };
}

export function refundFor(worker) {
  const veteran = (worker.battleEp ?? 0) >= MUTANT_CONFIG.veteranEp;
  const rate = veteran ? MUTANT_CONFIG.refundVeteran : MUTANT_CONFIG.refundUnused;
  return Math.floor((worker.invested ?? 0) * rate);
}

export function asBase(worker) {
  return { ...worker, stones: [], invested: 0, battleEp: 0 };
}