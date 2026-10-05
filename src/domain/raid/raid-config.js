// @doc: docs/daten/raid/raid-config.md#raid-config
import { MAX_DUNGLINGS } from '../buildings/building-config.js';
import { GRID_WIDTH, GRID_HEIGHT, HIVE_ORIGIN } from '../world/world-config.js';
import { TILE_TERRAIN } from '../world/tile.js';
import { STAT_KEYS } from '../brutelord/stone-roll.js';
import { SLOT_ORDER, STONE_DEFS, STONE_TRAIT, STONE_TRAIT_DEFS } from '../brutelord/stone-config.js';

export const RAID_FORMAT_VERSION = 2;

export const RAID_PHASE = Object.freeze({
  INFILTRATING: 'INFILTRATING',
  AT_HIVE: 'AT_HIVE',
  EXTRACTING: 'EXTRACTING',
  RESOLVED: 'RESOLVED',
});

const MAX_APPROACH = Math.max(HIVE_ORIGIN.x, GRID_WIDTH - 1 - HIVE_ORIGIN.x)
  + Math.max(HIVE_ORIGIN.y, GRID_HEIGHT - 1 - HIVE_ORIGIN.y);

export const RAID_TRAIT_DEFS = Object.freeze({
  [STONE_TRAIT.GREEDY]: Object.freeze({ lootScale: 1 + STONE_TRAIT_DEFS[STONE_TRAIT.GREEDY].carryBonus }),
  [STONE_TRAIT.MOTIVATOR]: Object.freeze({ apScale: 1 + STONE_TRAIT_DEFS[STONE_TRAIT.MOTIVATOR].speedBonus }),
  [STONE_TRAIT.SLIMY]: Object.freeze({ digScale: 1 / (1 - STONE_TRAIT_DEFS[STONE_TRAIT.SLIMY].trailSlow) }),
});

export const NEUTRAL_TRAITS = Object.freeze({ lootScale: 1, apScale: 1, digScale: 1 });

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

export const RAID_TERRAIN = Object.freeze({
  stoneChance: 0.18,
  obsidianChance: 0.05,
  coreRadius: 6,
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
  if (terrainClass === TILE_TERRAIN.OBSIDIAN) return config.obsidianCost;
  if (terrainClass === TILE_TERRAIN.STONE) return config.stoneCost;
  return config.earthCost;
}

export function canDig(terrain, heroes) {
  if (terrain === TILE_TERRAIN.EARTH) return true;
  return heroes.some((held) => held.dig === true);
}

export function pathCost({ terrains, heroes, config = RAID_CONFIG } = {}) {
  let sum = 0;
  for (const terrain of terrains) {
    if (!canDig(terrain, heroes)) return null;
    sum += digCost(terrain, config);
  }
  return sum;
}

export function worstEntryDistance(config = RAID_CONFIG) {
  return Math.min(config.entryRadius, MAX_APPROACH);
}

export function approachSteps(from, to) {
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
}