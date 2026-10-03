/**
 * Die Arbeitssicht des Zustands: genau das, was der Takt braucht, an einer
 * Stelle zusammengezogen. Reducer und Uhr lesen dieselbe Sicht — es gibt
 * keine zweite Wahrheit über Dunglinge, Bauten und Essenz.
 */
import { parseTileId } from '../domain/world/tile.js';
import { hasWork } from '../domain/labour/work-tick.js';

export function workOf(state) {
  return {
    essence: state.essence,
    anchor: parseTileId(state.world.spawnTileId),
    dunglings: state.dunglings,
    buildings: state.buildings,
    popups: state.popups,
    popupSeq: state.popupSeq,
  };
}

/** Schweigt die Uhr? Dann tickt sie nicht — wie die der Verwurzelung. */
export function workIsIdle(state) {
  return !hasWork(workOf(state));
}
