/** Die Trait-Faltung des Teams: der stärkste Stein zählt, nicht die Summe. */
import { RAID_TRAIT_DEFS, NEUTRAL_TRAITS } from './raid-config.js';

/** Jeder Trait nennt genau eine Achse, also ist der fehlende Wert keine Luecke, sondern neutral. */
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

/** Was das Team aus dem fremden Dungeon heraushält — GREEDY zählt doppelt. */
export function carriedLoot(loot, traits) {
  return Math.round(loot * traits.lootScale);
}