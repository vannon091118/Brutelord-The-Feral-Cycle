/**
 * Die Reihenfolge der Fach-Reducer als zwei Ketten, weil acht Imports das Cap
 * sprengen. Zusammengefuegt wird in `game-reducer.js`, dort steht die Reihenfolge.
 */
import { reduceHive } from './reducers/hive-reducer.js';
import { reduceDungling } from './reducers/dungling-reducer.js';
import { reduceSelection } from './reducers/selection-reducer.js';
import { reduceLab } from './reducers/lab-reducer.js';

export const COLONY_REDUCERS = [reduceHive, reduceDungling, reduceSelection, reduceLab];
