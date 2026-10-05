// @doc: docs/daten/state/reducer-chain-world.md#reducer-chain-world
import { reduceMutant } from './reducers/mutant-reducer.js';
import { reduceWorld } from './reducers/world-reducer.js';
import { reduceColony } from './reducers/colony-reducer.js';
import { reduceFloor } from './reducers/floor-reducer.js';

export const WORLD_REDUCERS = [reduceMutant, reduceWorld, reduceColony, reduceFloor];
