// @doc: docs/daten/world/world-seed.md#world-seed
import { SeedError, worldSeed32 } from '../seed/seed-input.js';

export { SeedError, worldSeed32 };

export function worldSeed(input) {
  const seed = worldSeed32(input);
  if (seed === null) throw new SeedError(input);
  return seed;
}
