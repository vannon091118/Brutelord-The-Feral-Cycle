import { HIVE_ORIGIN, HIVE_SIZE, TILE_SIZE } from '../world/world-config.js';

/**
 * The hive is the centre of the world. It occupies exactly 2x2 tiles
 * and is owned by the hive, never by the player.
 */

export const HIVE_BOUNDS = {
  x: HIVE_ORIGIN.x * TILE_SIZE,
  y: HIVE_ORIGIN.y * TILE_SIZE,
  size: HIVE_SIZE * TILE_SIZE,
};

export const HIVE_CENTER_PX = {
  x: (HIVE_ORIGIN.x + HIVE_SIZE / 2) * TILE_SIZE,
  y: (HIVE_ORIGIN.y + HIVE_SIZE / 2) * TILE_SIZE,
};

/** Centre of the hive expressed in tile units. */
export const HIVE_CENTER_TILES = {
  x: HIVE_ORIGIN.x + HIVE_SIZE / 2,
  y: HIVE_ORIGIN.y + HIVE_SIZE / 2,
};

export const HIVE_ID = 'hive';