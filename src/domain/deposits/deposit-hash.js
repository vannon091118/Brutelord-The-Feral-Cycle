/** Eigener Hash und Zufallsstrom — die Domäne zieht nichts aus src/world/. */
const MIX_X = 73856093;
const MIX_Y = 19349663;
const SALT_X = 1013904223;
const SALT_Y = 1664525;
const MIX_SALT = 2654435761;
const RANGE = 4294967296;

export function blockHash(x, y) {
  return (Math.imul(x + SALT_X, MIX_X) ^ Math.imul(y + SALT_Y, MIX_Y)) >>> 0;
}

function unitOf(hash) {
  return (hash >>> 0) / RANGE;
}

export function pick(hash, salt, max) {
  return Math.floor(unitOf(Math.imul(hash ^ salt, MIX_SALT)) * max);
}

export function keepBlock(hash, skipPerMille) {
  return pick(hash, 3, 1000) >= skipPerMille;
}
