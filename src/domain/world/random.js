/**
 * Deterministic pseudo randomness.
 *
 * Game truth never uses Math.random - visual variation is derived from stable
 * seeds (tile ids, entity ids) so a tile always looks the same.
 */

export function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createRng(seed) {
  let state = (typeof seed === 'string' ? hashString(seed) : seed) >>> 0;
  if (state === 0) state = 0x9e3779b9;
  return function next() {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Deterministic value in [min, max) for a given seed and key. */
export function seededRange(seed, key, min, max) {
  const rng = createRng(`${seed}:${key}`);
  return min + rng() * (max - min);
}