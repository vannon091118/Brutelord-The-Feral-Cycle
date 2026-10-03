/** Welt-Konstanten: Raster, Hive, Sichtfeld, Skalierung. */
export const TILE_SIZE = 64;

export const GRID_WIDTH = 64;
export const GRID_HEIGHT = 64;

export const HIVE_ORIGIN = Object.freeze({ x: 31, y: 31 });
export const HIVE_SIZE = Object.freeze({ width: 2, height: 2 });

export const REVEAL_RADIUS = 2;

export const VIEW_TILES = 13;

export const LADDER_TILE = Object.freeze({ x: 47, y: 47 });

export const WORLD_BLEED_TILES = 0.75;

export const DEPTH_RADIUS_TILES = 14;

export const MIN_WORLD_SCALE = 0.4;
export const MAX_WORLD_SCALE = 1;

export function worldPixelSize(tileSize = TILE_SIZE) {
  const bleed = WORLD_BLEED_TILES * tileSize;
  return {
    width: GRID_WIDTH * tileSize + bleed * 2,
    height: GRID_HEIGHT * tileSize + bleed * 2,
    bleed,
  };
}

export function viewportPixelSize(tileSize = TILE_SIZE) {
  const bleed = WORLD_BLEED_TILES * tileSize;
  return {
    width: VIEW_TILES * tileSize + bleed * 2,
    height: VIEW_TILES * tileSize + bleed * 2,
    bleed,
  };
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function computeWorldScale({ availableWidth, availableHeight, tileSize = TILE_SIZE }) {
  const view = viewportPixelSize(tileSize);
  if (!availableWidth || !availableHeight) return MAX_WORLD_SCALE;
  const raw = Math.min(availableWidth / view.width, availableHeight / view.height);
  return clamp(raw, MIN_WORLD_SCALE, MAX_WORLD_SCALE);
}

export function isInsideView({ center, x, y }, tileSize = TILE_SIZE) {
  const half = (VIEW_TILES / 2) * tileSize;
  return (
    (x + 0.5) * tileSize >= center.x - half &&
    (x + 0.5) * tileSize < center.x + half &&
    (y + 0.5) * tileSize >= center.y - half &&
    (y + 0.5) * tileSize < center.y + half
  );
}
