// @doc: docs/daten/reducers/floor-reducer.md#floor-reducer
import { ACTION } from '../../domain/actions/action-types.js';
import { canDescend, createFloorWorld } from '../../domain/world/floor.js';
import { countFloorTiles } from '../../domain/world/grid.js';
import { buyFloor, cycleOf, ladderOpen } from '../../domain/economy/resource-cycle.js';

export function reduceFloor(state, action) {
  if (action.type !== ACTION.FLOOR_DESCEND) return state;
  return descended(state, state.world.depth + 1);
}

function descended(state, target) {
  if (target !== state.world.depth + 1) return state;
  if (!ladderOpen(state.buildings)) return state;
  const cycle = cycleOf(state);
  if (canDescend(state.world.depth)) return moved(state, target, cycle);
  const kauf = buyFloor(cycle);
  return kauf.ok ? moved(state, target, kauf.cycle) : state;
}

function moved(state, target, economy) {
  const world = createFloorWorld(state.playerseed, target);
  if (world === null) return state;
  return {
    ...state,
    world,
    economy,
    usableTileCount: countFloorTiles(world),
    mining: null,
    expansion: null,
    lastDestroyedTileId: null,
    selectedTileId: null,
    highlightedTileId: null,
  };
}
