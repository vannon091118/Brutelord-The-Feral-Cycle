// @doc: docs/daten/state/reducer-chain.md#reducer-chain
import { reduceHive } from './reducers/hive-reducer.js';
import { reduceDungling } from './reducers/dungling-reducer.js';
import { reduceSelection } from './reducers/selection-reducer.js';
import { reduceLab } from './reducers/lab-reducer.js';

export const COLONY_REDUCERS = [reduceHive, reduceDungling, reduceSelection, reduceLab];
