// @doc: docs/daten/world/world-seed.md#world-seed
import { WORLD_SEED } from './world-config.js';

export function worldSeed(playerseed) {
  if (typeof playerseed === 'number') return playerseed >>> 0;
  if (typeof playerseed !== 'string') return WORLD_SEED.anonymous;
  return Number.parseInt(playerseed.slice(0, WORLD_SEED.hexLength), 16) >>> 0;
}
