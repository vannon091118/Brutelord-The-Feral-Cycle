// @doc: docs/daten/reducers/world-reducer.md#world-reducer
import { reduceMining } from './mining-reducer.js';
import { reduceExpansion } from './expansion-reducer.js';
import { reduceRooting } from './rooting-reducer.js';

const WORLD_REDUCERS = [reduceMining, reduceExpansion, reduceRooting];

export function reduceWorld(state, action) {
  for (const reduce of WORLD_REDUCERS) {
    const next = reduce(state, action);
    if (next !== state) return next;
  }
  return state;
}