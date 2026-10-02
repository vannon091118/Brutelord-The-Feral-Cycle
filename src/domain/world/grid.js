import { hashString } from './random.js';
import {
  EARTH_VARIANT_COUNT,
  GRID_SIZE,
  HIVE_ORIGIN,
  HIVE_SIZE,
} from './world-config.js';
import {
  EARTH_PHASE,
  TILE_KIND,
  createTile,
  isEarthTile,
  isHiveTile,
  phaseForProgress,
} from './tile.js';

/**
 * The grid is the single source of truth for tiles.
 * A tile lives in exactly one place with exactly one state.
 */

export function tileIdOf(x, y) {
  return `${x}:${y}`;
}

function isInsideHive(x, y) {
  return (
    x >= HIVE_ORIGIN.x &&
    x < HIVE_ORIGIN.x + HIVE_SIZE &&
    y >= HIVE_ORIGIN.y &&
    y < HIVE_ORIGIN.y + HIVE_SIZE
  );
}

export function createInitialGrid() {
  const tiles = {};
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const id = tileIdOf(x, y);
      const kind = isInsideHive(x, y) ? TILE_KIND.HIVE : TILE_KIND.EARTH;
      const variant = hashString(id) % EARTH_VARIANT_COUNT;
      tiles[id] = createTile(id, x, y, kind, variant);
    }
  }
  return { size: GRID_SIZE, tiles };
}

export function getTile(grid, id) {
  return id ? (grid.tiles[id] ?? null) : null;
}

export function patchTile(grid, id, patch) {
  const tile = getTile(grid, id);
  if (!tile) return grid;
  return {
    ...grid,
    tiles: { ...grid.tiles, [id]: { ...tile, ...patch } },
  };
}

export function neighborIds(tile) {
  return [
    tileIdOf(tile.x, tile.y - 1),
    tileIdOf(tile.x + 1, tile.y),
    tileIdOf(tile.x, tile.y + 1),
    tileIdOf(tile.x - 1, tile.y),
  ];
}

export function hiveTileIds(grid) {
  return Object.values(grid.tiles)
    .filter(isHiveTile)
    .map((tile) => tile.id);
}

/** All earth tiles that touch the hive - the only sensible mining targets for now. */
export function hiveAdjacentEarthTiles(grid) {
  const hiveIds = new Set(hiveTileIds(grid));
  const result = [];
  const seen = new Set();
  for (const tile of Object.values(grid.tiles)) {
    if (!isEarthTile(tile) || tile.mining.active) continue;
    if (seen.has(tile.id)) continue;
    const touchesHive = neighborIds(tile).some((id) => hiveIds.has(id));
    if (touchesHive) {
      seen.add(tile.id);
      result.push(tile);
    }
  }
  return result;
}

/** Usable dungeon floor - exactly the tiles the player has dug out. */
export function usableTileIds(grid) {
  return Object.values(grid.tiles)
    .filter((tile) => tile.buildable)
    .map((tile) => tile.id);
}

export function usableTileCount(grid) {
  return usableTileIds(grid).length;
}

/** Applies a mining progress step to a tile and stores the matching visible phase. */
export function applyMiningProgress(grid, id, progress) {
  const tile = getTile(grid, id);
  if (!tile) return grid;
  return patchTile(grid, id, {
    mining: {
      ...tile.mining,
      active: true,
      progress,
      phase: phaseForProgress(progress),
    },
  });
}

export { EARTH_PHASE, TILE_KIND };