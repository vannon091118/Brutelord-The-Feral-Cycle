// @doc: docs/daten/raid/raid-traits.md#raid-traits
import { RAID_TRAIT_DEFS, NEUTRAL_TRAITS } from './raid-config.js';

function peak(heroes, key) {
  const values = heroes.flatMap((hero) => (hero.traits ?? [])
    .map((trait) => RAID_TRAIT_DEFS[trait][key])
    .filter((value) => value !== undefined));
  return values.length === 0 ? NEUTRAL_TRAITS[key] : Math.max(...values);
}

export function teamTraitProfile(heroes) {
  return Object.freeze({
    lootScale: peak(heroes, 'lootScale'),
    apScale: peak(heroes, 'apScale'),
    digScale: peak(heroes, 'digScale'),
  });
}

export function carriedLoot(loot, traits) {
  return Math.round(loot * traits.lootScale);
}