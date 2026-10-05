// @doc: docs/daten/brutelord/stone-seed.md#stone-seed
const MIX = 2654435761;
const RANGE = 4294967296;

export function mixSeed(seed, salt) {
  return Math.imul(seed ^ salt, MIX) >>> 0;
}

export function unitOf(hash) {
  return (hash >>> 0) / RANGE;
}

export function pickFrom(seed, salt, max) {
  return Math.floor(unitOf(mixSeed(seed, salt)) * max);
}

export function weightedFrom(seed, salt, weights) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = unitOf(mixSeed(seed, salt)) * total;
  for (let index = 0; index < weights.length; index += 1) {
    roll -= weights[index];
    if (roll < 0) return index;
  }
  return weights.length - 1;
}

export const STONE_SALT = Object.freeze({
  trait: 7717,
  rarity: 3313,
  stat: 9091,
  visual: 4423,
  capability: 5501,
});