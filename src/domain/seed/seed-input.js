// @doc: docs/daten/seed/seed-input.md#seed-input
import { WORLD_SEED } from '../world/world-config.js';

const UINT32 = 4294967295;
const CANONICAL = /^[0-9a-fA-F]+$/;

export class SeedError extends Error {
  constructor(input) {
    super(`Ungueltiger Seed "${String(input)}": erwartet werden 1 bis ${WORLD_SEED.canonicalHex} Hex-Zeichen oder eine ganze Zahl von 0 bis ${UINT32}.`);
    this.name = 'SeedError';
    this.input = input;
  }
}

export function worldSeed32(input) {
  if (typeof input === 'number') return wholeNumber(input);
  if (typeof input !== 'string') return WORLD_SEED.anonymous;
  return hexOf(input.trim());
}

function wholeNumber(value) {
  return Number.isInteger(value) && value >= 0 && value <= UINT32 ? value >>> 0 : null;
}

function hexOf(text) {
  if (text.length === 0 || text.length > WORLD_SEED.canonicalHex || !CANONICAL.test(text)) return null;
  return Number.parseInt(text.slice(0, WORLD_SEED.hexLength), 16) >>> 0;
}
