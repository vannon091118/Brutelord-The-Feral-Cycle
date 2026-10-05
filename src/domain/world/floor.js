/** Die Etage: eine Ebene ist eine Funktion aus Spielerseed und Tiefe, und Tiefe 0
 *  ist die Startwelt. Der LCG laeuft nur vorwaerts — der Spielerseed bleibt eine
 *  Eingabe und wird nie aus dem Welt-Seed zurueckgerechnet. */
import { createWorld } from './grid.js';
import { worldSeed } from './world-seed.js';
import { FLOOR } from './floor-config.js';

export const DEEPEST_FLOOR = FLOOR.deepest;

export function createFloorWorld(playerseed, depth = FLOOR.start) {
  return createWorld({ playerseed, seed: floorSeed(playerseed, depth), depth });
}

/** Eigene Hash-Instanz, nicht `tileSeed`: der Etagen-Seed ist Weltwahrheit. */
export function floorSeed(playerseed, depth = FLOOR.start) {
  const base = worldSeed(playerseed);
  if (depth <= FLOOR.start) return base;
  let hash = (base ^ FLOOR.seedSalt) >>> 0;
  for (let level = 0; level < depth; level += 1) {
    hash = (Math.imul(hash ^ level, 1664525) + 1013904223) >>> 0;
  }
  return hash >>> 0;
}

/** Fail closed: eine negative Tiefe ist kein Sprung, sondern eine kaputte Aktion. */
export function canDescend(depth) {
  return Number.isInteger(depth) && depth >= FLOOR.start && depth < DEEPEST_FLOOR;
}

export function isFloorTarget(depth, target) {
  return canDescend(depth) && target === depth + 1;
}
