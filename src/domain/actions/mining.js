import { applyMiningProgress, getTile, patchTile } from '../world/grid.js';
import { TILE_KIND } from '../world/tile.js';

/**
 * Mining is the only tile transition in this slice:
 *
 *   earth -> being dug (three visible states) -> collapsed -> usable floor
 *
 * Every step is a pure function over the grid. No component ever invents a tile.
 */

export function startMining(grid, tileId) {
  const tile = getTile(grid, tileId);
  if (!tile) return grid;
  return patchTile(grid, tileId, {
    mining: { ...tile.mining, active: true, progress: 0, collapsing: false },
  });
}

export function advanceMining(grid, tileId, deltaMs, durationMs) {
  const tile = getTile(grid, tileId);
  if (!tile || !tile.mining.active) return grid;
  const progress = Math.min(1, tile.mining.progress + deltaMs / durationMs);
  return applyMiningProgress(grid, tileId, progress);
}

/** The earth gives way. Visually it crumbles, it is not floor yet. */
export function beginCollapse(grid, tileId) {
  const tile = getTile(grid, tileId);
  if (!tile) return grid;
  return patchTile(grid, tileId, {
    mining: { ...tile.mining, active: false, progress: 1, collapsing: true },
  });
}

/** Exactly one tile becomes usable dungeon floor. */
export function completeMining(grid, tileId) {
  const tile = getTile(grid, tileId);
  if (!tile) return grid;
  return patchTile(grid, tileId, {
    kind: TILE_KIND.FLOOR,
    buildable: true,
    mining: { active: false, progress: 1, phase: tile.mining.phase, collapsing: false },
  });
}

export function miningProgress(tile) {
  return tile ? tile.mining.progress : 0;
}