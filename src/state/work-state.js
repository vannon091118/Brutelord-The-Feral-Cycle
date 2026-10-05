// @doc: docs/daten/state/work-state.md#work-state
import { hasWork } from '../domain/labour/work-tick.js';
import { spawnTile } from './selectors.js';

export function workOf(state) {
  return {
    essence: state.essence,
    anchor: spawnTile(state.world),
    dunglings: state.dunglings,
    buildings: state.buildings,
    popups: state.popups,
    popupSeq: state.popupSeq,
  };
}

export function workIsIdle(state) {
  return !hasWork(workOf(state));
}
