/** Eco-Stakes-Raid: Regeln und Zahlen, jede aus einer Config abgeleitet. */
import { MAX_DUNGLINGS } from '../buildings/building-config.js';
import { GRID_WIDTH, GRID_HEIGHT, HIVE_ORIGIN } from '../world/world-config.js';
import { STAT_KEYS } from '../brutelord/stone-roll.js';
import { SLOT_ORDER, STONE_DEFS } from '../brutelord/stone-config.js';

export const RAID_PHASE = Object.freeze({
  INFILTRATING: 'INFILTRATING',
  AT_HIVE: 'AT_HIVE',
  EXTRACTING: 'EXTRACTING',
  RESOLVED: 'RESOLVED',
});

export const TERRAIN_CLASS = Object.freeze({
  EARTH: 'EARTH',
  STONE: 'STONE',
  OBSIDIAN: 'OBSIDIAN',
});

/** Der Einmarsch gräbt orthogonal; die ferne Ecke ist (63,63), nicht (0,0). */
const MAX_APPROACH = Math.max(HIVE_ORIGIN.x, GRID_WIDTH - 1 - HIVE_ORIGIN.x)
  + Math.max(HIVE_ORIGIN.y, GRID_HEIGHT - 1 - HIVE_ORIGIN.y);

export const RAID_CONFIG = Object.freeze({
  entryRadius: 60,
  baseStamina: MAX_APPROACH,
  bonusStamina: 116,
  earthCost: 1,
  stoneCost: 6,
  obsidianCost: 12,
  attackApCost: 2,
  reviveWindowMs: 7200000,
});

export function maxTeamGrit({ statMax = 5 } = {}) {
  const perStone = statMax * STONE_DEFS.LEGENDARY.power;
  return STAT_KEYS.includes('grit') ? MAX_DUNGLINGS * SLOT_ORDER.length * perStone : 0;
}

export function teamGritShare(grit, ceiling = maxTeamGrit()) {
  return ceiling > 0 ? Math.min(1, grit / ceiling) : 0;
}

export function teamStamina(grit, config = RAID_CONFIG) {
  return Math.round(config.baseStamina + config.bonusStamina * teamGritShare(grit));
}

export function digCost(terrainClass, config = RAID_CONFIG) {
  if (terrainClass === TERRAIN_CLASS.OBSIDIAN) return config.obsidianCost;
  if (terrainClass === TERRAIN_CLASS.STONE) return config.stoneCost;
  return config.earthCost;
}

export function approachSteps(from, to) {
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
}