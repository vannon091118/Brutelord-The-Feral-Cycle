/**
 * Die zweite Haelfte der Kette. Zusammen mit `reducer-chain.js` ergibt sie die
 * vollstaendige Reihenfolge — aufgeteilt am Import-Cap, nicht an einer Grenze
 * der Spiellogik: der Etagen-Reducer gehoert genauso zur Welt wie der Abbau.
 */
import { reduceMutant } from './reducers/mutant-reducer.js';
import { reduceWorld } from './reducers/world-reducer.js';
import { reduceColony } from './reducers/colony-reducer.js';
import { reduceFloor } from './reducers/floor-reducer.js';

export const WORLD_REDUCERS = [reduceMutant, reduceWorld, reduceColony, reduceFloor];
