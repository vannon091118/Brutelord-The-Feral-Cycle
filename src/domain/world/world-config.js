// @doc: docs/daten/world/world-config.md#world-config
export const TILE_SIZE = 64;

export const GRID_WIDTH = 64;
export const GRID_HEIGHT = 64;

export const HIVE_ORIGIN = Object.freeze({ x: 31, y: 31 });
export const HIVE_SIZE = Object.freeze({ width: 2, height: 2 });

export const REVEAL_RADIUS = 2;
export const REVEAL_GUARANTEED = 1;

const VIEW_TILES = 13;

export const LADDER_TILE = Object.freeze({ x: 47, y: 47 });

const WORLD_BLEED_TILES = 0.75;

export const DEPTH_RADIUS_TILES = 14;

const MIN_WORLD_SCALE = 0.4;
const MAX_WORLD_SCALE = 1;

export const WORLD_SEED = Object.freeze({
  anonymous: 0xc0ffee,
  hexLength: 8,
});

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
