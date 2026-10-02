import { hiveAdjacentEarthTiles, tileIdOf } from '../world/grid.js';
import { tileCenter } from '../world/tile.js';

/**
 * The dungling is the first worker. It is tiny, alive and not yet very capable.
 * Positions are expressed in tile units so the renderer stays free of grid maths.
 */

/** The dungling starts on the ground directly below the hive wall. */
export const DUNGLING_SPAWN_POSITION = { x: 2.5, y: 4.45 };

/** The tile the dungling is born on - never a mining target for itself. */
export const DUNGLING_SPAWN_TILE_ID = tileIdOf(
  Math.floor(DUNGLING_SPAWN_POSITION.x),
  Math.floor(DUNGLING_SPAWN_POSITION.y),
);

export function createDungling() {
  return {
    position: { ...DUNGLING_SPAWN_POSITION },
    activity: 'idle',
    facing: 1,
  };
}

/**
 * The dungling stops on the rim of the tile it works on - not in its centre -
 * so the block it opens up stays visible.
 */
export function moveDunglingToTile(dungling, tile) {
  const center = tileCenter(tile);
  const dx = dungling.position.x - center.x;
  const dy = dungling.position.y - center.y;
  const length = Math.hypot(dx, dy) || 1;
  const reach = 0.34;
  return {
    ...dungling,
    position: {
      x: center.x + (dx / length) * reach,
      y: center.y + (dy / length) * reach,
    },
    facing: dx >= 0 ? -1 : 1,
    activity: 'move',
  };
}

export function setDunglingActivity(dungling, activity) {
  return { ...dungling, activity };
}

/** Distance in tile units between two tile-unit positions. */
function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Every hive adjacent earth tile the player may act on in this slice.
 * Only one of them is highlighted at a time - that is the target.
 */
export function actionTileIds(grid) {
  return hiveAdjacentEarthTiles(grid)
    .filter((tile) => tile.id !== DUNGLING_SPAWN_TILE_ID)
    .map((tile) => tile.id);
}

/**
 * The next sensible mining target: the hive adjacent earth tile closest to the
 * dungling. Deterministic - ties break by reading order, no randomness involved.
 */
export function pickNextActionTileId(grid, from = DUNGLING_SPAWN_POSITION) {
  const candidates = hiveAdjacentEarthTiles(grid).filter(
    (tile) => tile.id !== DUNGLING_SPAWN_TILE_ID,
  );
  let best = null;
  for (const tile of candidates) {
    const d = distance(from, tileCenter(tile));
    const bestDistance = best ? distance(from, tileCenter(best)) : Infinity;
    if (!best || d < bestDistance || (d === bestDistance && tile.id < best.id)) {
      best = tile;
    }
  }
  return best ? best.id : null;
}