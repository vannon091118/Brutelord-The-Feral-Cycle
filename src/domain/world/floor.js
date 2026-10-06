// @doc: docs/daten/world/floor.md#floor
import { createWorld } from './grid.js';
import { worldSeed32 } from '../seed/seed-input.js';
import { FLOOR } from './floor-config.js';

export const DEEPEST_FLOOR = FLOOR.deepest;

export function createFloorWorld(playerseed, depth = FLOOR.start) {
  const seed = floorSeed(playerseed, depth);
  return seed === null ? null : createWorld({ playerseed, seed, depth });
}

export function floorSeed(playerseed, depth = FLOOR.start) {
  const base = worldSeed32(playerseed);
  if (base === null) return null;
  if (depth <= FLOOR.start) return base;
  let hash = (base ^ FLOOR.seedSalt) >>> 0;
  for (let level = 0; level < depth; level += 1) {
    hash = (Math.imul(hash ^ level, 1664525) + 1013904223) >>> 0;
  }
  return hash >>> 0;
}

export function canDescend(depth) {
  return Number.isInteger(depth) && depth >= FLOOR.start && depth < DEEPEST_FLOOR;
}

export function isFloorTarget(depth, target) {
  return canDescend(depth) && target === depth + 1;
}
