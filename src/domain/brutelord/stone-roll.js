/**
 * Der Wurf: Seltenheit aus dem Seed, Pity-Timer, Fähigkeiten, Trait. Aus
 * demselben Seed kommt immer derselbe Stein — Neuladen ist kein Losgriff.
 */
import {
  RARITY_ORDER,
  RARITY_WEIGHTS,
  SLOT_ORDER,
  STONE_CONFIG,
  STONE_DEFS,
  STONE_TRAIT_DEFS,
  TRAIT_ORDER,
} from './stone-config.js';
import { STONE_SALT, mixSeed, pickFrom, unitOf, weightedFrom } from './stone-seed.js';

const LEGENDARY_INDEX = RARITY_ORDER.length - 1;

export const STAT_KEYS = Object.freeze(['atk', 'speed', 'haul', 'grit']);

export function pityMisses(lab) {
  return Math.max(0, lab?.pityMisses ?? 0);
}

// Die Legende-Chance steigt unsichtbar mit jedem Fehlschlag.
export function pityBonus(misses, config = STONE_CONFIG) {
  return Math.min(config.pityMaxBonus, misses * config.pityStep);
}

export function rarityWeights(misses, config = STONE_CONFIG) {
  const bonus = pityBonus(misses, config);
  return RARITY_WEIGHTS.map((weight, index) => (index === LEGENDARY_INDEX ? weight * (1 + bonus) : weight));
}

export function rarityFor(seed, misses = 0) {
  return RARITY_ORDER[weightedFrom(seed, STONE_SALT.rarity, rarityWeights(misses))];
}

export function nextPityMisses(rarity, misses) {
  return RARITY_ORDER.indexOf(rarity) === LEGENDARY_INDEX ? 0 : misses + 1;
}

export function hasPity(seed, misses, config = STONE_CONFIG) {
  return misses >= config.pityLimit;
}

function slotSalt(slot) {
  const index = SLOT_ORDER.indexOf(slot);
  return index < 0 ? 0 : index + 1;
}

export function visualFor(seed, slot) {
  return {
    slot: slot ?? null,
    variant: pickFrom(seed, STONE_SALT.visual + slotSalt(slot) * 17, 5),
    wobble: unitOf(mixSeed(seed, STONE_SALT.visual + slotSalt(slot))),
  };
}

export function statsFor(seed, rarity) {
  const power = STONE_DEFS[rarity].power;
  return Array.from({ length: STONE_DEFS[rarity].statCount }, (unused, index) => ({
    key: STAT_KEYS[index % STAT_KEYS.length],
    value: (pickFrom(seed, STONE_SALT.stat + index * 13, 5) + 1) * power,
  }));
}

export function traitFor(seed, rarity) {
  if (unitOf(mixSeed(seed, STONE_SALT.trait)) >= STONE_DEFS[rarity].traitChance) return null;
  return TRAIT_ORDER[pickFrom(seed, STONE_SALT.trait + 1, TRAIT_ORDER.length)];
}

export function createStone({ seed, pityMisses: misses = 0, slot = null }) {
  const rarity = hasPity(seed, misses) ? RARITY_ORDER[LEGENDARY_INDEX] : rarityFor(seed, misses);
  return {
    seed,
    rarity,
    trait: traitFor(seed, rarity),
    stats: statsFor(seed, rarity),
    visual: visualFor(seed, slot),
    slot,
    discovered: false,
    pityMisses: nextPityMisses(rarity, misses),
  };
}

export function withSlot(stone, slot) {
  return { ...stone, slot, visual: visualFor(stone.seed, slot), discovered: true };
}

export function traitDef(trait) {
  return trait ? STONE_TRAIT_DEFS[trait] : null;
}