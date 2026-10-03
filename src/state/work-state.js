/** Die Arbeitssicht des Zustands für Reducer und Uhr. */
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

export function workIsIdle(state) {
  return !hasWork(workOf(state));
}
