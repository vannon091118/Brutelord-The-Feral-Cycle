/**
 * Der Dungling: kleines arbeitendes Wesen. Kennt seinen Zustand, sein Tile und
 * sein Ziel — aber keine Grafik und keine Timings.
 */
import { TILE_SIZE } from '../world/world-config.js';

export const DUNGLING_STATE = Object.freeze({
  NONE: 'NONE',
  SPAWNING: 'SPAWNING',
  IDLE: 'IDLE',
  MOVING: 'MOVING',
  WORKING: 'WORKING',
});

export function createDungling({ tile, facing = 1 }) {
  return {
    id: 'dungling-1',
    tile: { ...tile },
    facing,
    state: DUNGLING_STATE.NONE,
    targetTileId: null,
  };
}

export function tilePositionPx(tile, tileSize = TILE_SIZE) {
  return { x: (tile.x + 0.5) * tileSize, y: (tile.y + 0.5) * tileSize };
}

export function dunglingPositionPx(dungling, tileSize = TILE_SIZE) {
  return tilePositionPx(dungling.tile, tileSize);
}

export function startSpawning(dungling) {
  return { ...dungling, state: DUNGLING_STATE.SPAWNING };
}

export function idle(dungling) {
  return { ...dungling, state: DUNGLING_STATE.IDLE, targetTileId: null };
}

/** Laufbefehl: Der Dungling übernimmt das Ziel-Tile sichtbar als Position. */
export function walkTo(dungling, targetTile) {
  const facing = targetTile.x >= dungling.tile.x ? 1 : -1;
  return {
    ...dungling,
    state: DUNGLING_STATE.MOVING,
    tile: { x: targetTile.x, y: targetTile.y },
    targetTileId: targetTile.id,
    facing,
  };
}

export function startWork(dungling) {
  return { ...dungling, state: DUNGLING_STATE.WORKING };
}