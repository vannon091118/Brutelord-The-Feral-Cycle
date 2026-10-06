// @doc: docs/daten/raid/raid-spawn-seed.md#raid-spawn-seed
import { RAID_CONFIG } from './raid-config.js';
import { tileAt } from '../world/grid.js';
import { TILE_KIND } from '../world/tile.js';
import { GRID_WIDTH, GRID_HEIGHT } from '../world/world-config.js';

const MIX = 2246822519;
const RANGE = 4294967296;
const SALT_X = 73856093;
const SALT_Y = 19349663;
const SALT_GEGNER = 2654435761;
const SALT_STEP = 3266489917;

export function mixRaid(hash, salt) {
  return Math.imul(hash ^ salt, MIX) >>> 0;
}

export function unitOf(hash) {
  return (hash >>> 0) / RANGE;
}

export function textSeed(text) {
  let hash = 2166136261;
  const wort = String(text);
  for (let index = 0; index < wort.length; index += 1) hash = Math.imul(hash ^ wort.charCodeAt(index), 16777619);
  return hash >>> 0;
}

function seedOf(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : textSeed(value);
}

export function entrySeed({ attackerId = '', defenderId = '', defenderSeed = 0 } = {}) {
  const team = mixRaid(seedOf(attackerId), SALT_STEP);
  const gegner = mixRaid(seedOf(defenderId), SALT_GEGNER);
  return mixRaid(team ^ gegner, SALT_X) ^ mixRaid(defenderSeed, SALT_Y);
}

function isFree(world, x, y) {
  const tile = tileAt(world, x, y);
  return Boolean(tile) && tile.kind === TILE_KIND.EARTH;
}

export function candidates(world, { origin, radius = RAID_CONFIG.entryRadius } = {}) {
  const list = [];
  for (let y = Math.max(0, origin.y - radius); y <= Math.min(GRID_HEIGHT - 1, origin.y + radius); y += 1) {
    const span = Math.min(GRID_WIDTH - 1, origin.x + radius) - Math.max(0, origin.x - radius) + 1;
    for (let i = 0; i < span; i += 1) {
      const x = Math.max(0, origin.x - radius) + i;
      if (Math.abs(x - origin.x) + Math.abs(y - origin.y) <= radius && isFree(world, x, y)) list.push({ x, y });
    }
  }
  return list;
}

export function entryPointFor(world, { seed = 0, origin, radius = RAID_CONFIG.entryRadius } = {}) {
  const list = candidates(world, { origin, radius });
  if (list.length === 0) return null;
  const index = Math.floor(unitOf(mixRaid(seed, SALT_STEP)) * list.length);
  const point = list[index];
  return { ...point, distance: Math.abs(point.x - origin.x) + Math.abs(point.y - origin.y) };
}