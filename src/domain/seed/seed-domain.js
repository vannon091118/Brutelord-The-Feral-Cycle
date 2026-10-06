// @doc: docs/daten/seed/seed-domain.md#seed-domain
import { worldSeed32 } from './seed-input.js';

const MIX = 2654435761;
const FNV = 16777619;
const FNV_OFFSET = 2166136261;

export const DERIVATION_VERSION = 1;

export const SEED_DOMAIN = Object.freeze({
  WORLD: 'WORLD',
  ORGANISM: 'ORGANISM',
  EVENT: 'EVENT',
  PRESENTATION: 'PRESENTATION',
});

export const DOMAIN_SALT = Object.freeze({
  [SEED_DOMAIN.WORLD]: 0x1b873593,
  [SEED_DOMAIN.ORGANISM]: 0xcc9e2d51,
  [SEED_DOMAIN.EVENT]: 0x7feb352d,
  [SEED_DOMAIN.PRESENTATION]: 0x846ca68b,
});

export const SALT_HOME = Object.freeze({
  WORLD_SEED: Object.freeze({ domain: SEED_DOMAIN.WORLD, module: 'src/domain/world/world-config.js' }),
  FLOOR_SEED: Object.freeze({ domain: SEED_DOMAIN.WORLD, module: 'src/domain/world/floor-config.js' }),
  REVEAL_WOBBLE: Object.freeze({ domain: SEED_DOMAIN.WORLD, module: 'src/domain/world/reveal.js' }),
  DEPOSIT_HASH: Object.freeze({ domain: SEED_DOMAIN.WORLD, module: 'src/domain/deposits/deposit-hash.js' }),
  GENOME_SALT: Object.freeze({ domain: SEED_DOMAIN.ORGANISM, module: 'src/domain/brutelord/genome-config.js' }),
  ORGANIC_SALT: Object.freeze({ domain: SEED_DOMAIN.ORGANISM, module: 'src/domain/brutelord/genome-config.js' }),
  STONE_SALT: Object.freeze({ domain: SEED_DOMAIN.ORGANISM, module: 'src/domain/brutelord/stone-seed.js' }),
  TILE_SHAPES: Object.freeze({ domain: SEED_DOMAIN.PRESENTATION, module: 'src/world/tile-shapes.js' }),
  RAID_SPAWN: Object.freeze({ domain: SEED_DOMAIN.EVENT, module: 'src/domain/raid/raid-spawn-seed.js' }),
  RAID_TERRAIN: Object.freeze({ domain: SEED_DOMAIN.EVENT, module: 'src/domain/raid/raid-terrain.js' }),
  RAID_WARDEN: Object.freeze({ domain: SEED_DOMAIN.EVENT, module: 'src/domain/raid/raid-warden.js' }),
  RAID_MOVE: Object.freeze({ domain: SEED_DOMAIN.EVENT, module: 'src/domain/raid/raid-move.js' }),
  RAID_SIM: Object.freeze({ domain: SEED_DOMAIN.EVENT, module: 'src/domain/raid/raid-sim.js' }),
});

export function deriveSeed({ playerseed, domain, topic = 0, index = 0 }) {
  const base = worldSeed32(playerseed);
  const salt = DOMAIN_SALT[domain];
  if (base === null || salt === undefined) return null;
  const head = Math.imul(base ^ salt, MIX) >>> 0;
  const tail = Math.imul(topicHash(topic) + index, FNV) >>> 0;
  return (Math.imul(head ^ tail, MIX) + index) >>> 0;
}

function topicHash(topic) {
  if (Number.isInteger(topic)) return topic >>> 0;
  const text = String(topic);
  let hash = FNV_OFFSET;
  for (let index = 0; index < text.length; index += 1) hash = Math.imul(hash ^ text.charCodeAt(index), FNV);
  return hash >>> 0;
}
