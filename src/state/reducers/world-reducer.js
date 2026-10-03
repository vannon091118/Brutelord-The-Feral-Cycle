/**
 * Die Welt-Kette: Abbau, Ausbau, Verwurzelung. Drei Themen, eine Verteidigung —
 * so bleibt der zentrale Reducer unter dem Import-Cap.
 */
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