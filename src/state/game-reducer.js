/**
 * Der zentrale Reducer — als Verteiler, nicht als Sammelbecken.
 *
 * Jede Domäne bringt ihren eigenen Reducer mit und gibt den Zustand
 * unverändert zurück, wenn der Befehl sie nicht betrifft. Genau ein Befehl
 * ändert genau einen Bereich; die Darstellung hört danach passiv zu.
 */
import { reduceHive } from './reducers/hive-reducer.js';
import { reduceDungling } from './reducers/dungling-reducer.js';
import { reduceSelection } from './reducers/selection-reducer.js';
import { reduceMining } from './reducers/mining-reducer.js';
import { reduceExpansion } from './reducers/expansion-reducer.js';
import { reduceRooting } from './reducers/rooting-reducer.js';

const DOMAIN_REDUCERS = [
  reduceHive,
  reduceDungling,
  reduceSelection,
  reduceMining,
  reduceExpansion,
  reduceRooting,
];

export function gameReducer(state, action) {
  for (const reduce of DOMAIN_REDUCERS) {
    const next = reduce(state, action);
    if (next !== state) return next;
  }
  return state;
}
