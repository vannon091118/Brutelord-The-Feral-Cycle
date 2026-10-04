/** Der zentrale Reducer als Verteiler. */
import { reduceHive } from './reducers/hive-reducer.js';
import { reduceDungling } from './reducers/dungling-reducer.js';
import { reduceSelection } from './reducers/selection-reducer.js';
import { reduceLab } from './reducers/lab-reducer.js';
import { reduceWorld } from './reducers/world-reducer.js';
import { reduceColony } from './reducers/colony-reducer.js';
import { reduceMutant } from './reducers/mutant-reducer.js';

/** Welt-Themen (Abbau, Ausbau, Verwurzelung) teilen sich eine Kette. */
const DOMAIN_REDUCERS = [reduceHive, reduceDungling, reduceSelection, reduceLab, reduceMutant, reduceWorld, reduceColony];

export function gameReducer(state, action) {
  for (const reduce of DOMAIN_REDUCERS) {
    const next = reduce(state, action);
    if (next !== state) return next;
  }
  return state;
}