/**
 * Der Etagensprung: der Hive zieht in die naechste Tiefe, und die Welt dort ist
 * eine Funktion aus Seed und Tiefe. Ein Sprung ersetzt den Rasterzustand —
 * Dunglinge, Bauten und Essenz bleiben, das Gestein ist ein neues.
 */
import { ACTION } from '../../domain/actions/action-types.js';
import { createFloorWorld, isFloorTarget } from '../../domain/world/floor.js';
import { countFloorTiles } from '../../domain/world/grid.js';

export function reduceFloor(state, action) {
  if (action.type !== ACTION.FLOOR_DESCEND) return state;
  return descended(state, state.world.depth + 1);
}

function descended(state, target) {
  if (!isFloorTarget(state.world.depth, target)) return state;
  const world = createFloorWorld(state.playerseed, target);
  return {
    ...state,
    world,
    usableTileCount: countFloorTiles(world),
    mining: null,
    expansion: null,
    lastDestroyedTileId: null,
    selectedTileId: null,
    highlightedTileId: null,
  };
}
