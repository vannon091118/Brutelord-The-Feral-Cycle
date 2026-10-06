// @doc: docs/daten/deposits/deposit-hash.md#deposit-hash
const MIX_X = 73856093;
const MIX_Y = 19349663;
const SALT_X = 1013904223;
const SALT_Y = 1664525;
const MIX_SEED = 2246822519;
const SALT_SEED = 3266489917;
const MIX_SALT = 2654435761;
const RANGE = 4294967296;

export function blockHash(x, y, seed) {
  return (Math.imul(x + SALT_X, MIX_X) ^ Math.imul(y + SALT_Y, MIX_Y) ^ Math.imul(seed + SALT_SEED, MIX_SEED)) >>> 0;
}

export function depositSalt(index, seed) {
  return 1511 + index * 2654435761 + Math.imul(seed, 7919);
}

function unitOf(hash) {
  return (hash >>> 0) / RANGE;
}

export function pick(hash, salt, max) {
  return Math.floor(unitOf(Math.imul(hash ^ salt, MIX_SALT)) * max);
}

export function pickForSalt(salt, saltOffset, max) {
  return Math.floor(unitOf(Math.imul(salt ^ saltOffset, MIX_SALT)) * max);
}

export function keepBlock(hash, skipPerMille) {
  return pick(hash, 3, 1000) >= skipPerMille;
}

