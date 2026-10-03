/** Der zentrale Reducer als Verteiler. */
import { reduceHive } from './reducers/hive-reducer.js';
import { reduceDungling } from './reducers/dungling-reducer.js';
import { reduceSelection } from './reducers/selection-reducer.js';
import { reduceMining } from './reducers/mining-reducer.js';
import { reduceExpansion } from './reducers/expansion-reducer.js';
import { reduceRooting } from './reducers/rooting-reducer.js';
import { reduceColony } from './reducers/colony-reducer.js';

const DOMAIN_REDUCERS = [
  reduceHive,
  reduceDungling,
  reduceSelection,
  reduceMining,
  reduceExpansion,
  reduceRooting,
  reduceColony,
];

export function gameReducer(state, action) {
  for (const reduce of DOMAIN_REDUCERS) {
    const next = reduce(state, action);
    if (next !== state) return next;
  }
  return state;
}
