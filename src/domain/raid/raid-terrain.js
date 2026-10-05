// @doc: docs/daten/raid/raid-terrain.md#raid-terrain
import { HIVE_ORIGIN } from '../world/world-config.js';
import { TILE_TERRAIN } from '../world/tile.js';
import { RAID_TERRAIN } from './raid-config.js';

const MIX = 1103515245;
const RANGE = 4294967296;
const SALT_ROW = 6271;
const SALT_COLUMN = 12289;
const SALT_OBSIDIAN = 5387;

export function mixTerrain(hash, salt) {
  return Math.imul(hash ^ salt, MIX) >>> 0;
}

function unitOf(hash) {
  return (hash >>> 0) / RANGE;
}

function cellHash({ seed, x, y }) {
  const row = mixTerrain(seed ^ Math.imul(y + 1, SALT_ROW), MIX);
  return mixTerrain(row ^ Math.imul(x + 1, SALT_COLUMN), MIX);
}

function isNearHive({ x, y, hiveOrigin, radius }) {
  return Math.abs(x - hiveOrigin.x) + Math.abs(y - hiveOrigin.y) <= radius;
}

export function terrainAt({ seed, x, y, hiveOrigin = HIVE_ORIGIN, terrain = RAID_TERRAIN } = {}) {
  const hash = cellHash({ seed, x, y });
  const nearHive = isNearHive({ x, y, hiveOrigin, radius: terrain.coreRadius });
  if (nearHive && unitOf(hash) < terrain.obsidianChance) return TILE_TERRAIN.OBSIDIAN;
  return unitOf(mixTerrain(hash, SALT_OBSIDIAN)) < terrain.stoneChance ? TILE_TERRAIN.STONE : TILE_TERRAIN.EARTH;
}