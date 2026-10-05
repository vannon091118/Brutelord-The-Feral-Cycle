// @doc: docs/daten/state/game-reducer.md#game-reducer
import { COLONY_REDUCERS } from './reducer-chain.js';
import { WORLD_REDUCERS } from './reducer-chain-world.js';

export function gameReducer(state, action) {
  for (const reduce of [...COLONY_REDUCERS, ...WORLD_REDUCERS]) {
    const next = reduce(state, action);
    if (next !== state) return next;
  }
  return state;
}
