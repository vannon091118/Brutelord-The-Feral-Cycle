// @doc: docs/daten/reducers/rooting-reducer.md#rooting-reducer
import { ACTION } from '../../domain/actions/action-types.js';
import { spreadToNeighbors, tickRooting } from '../../domain/world/rooting-world.js';

export function reduceRooting(state, action) {
  return action.type === ACTION.ROOTING_TICK ? tick(state, action.dtMs) : state;
}

function tick(state, dtMs) {
  const { world, spreading } = tickRooting(state.world, dtMs);
  if (world === state.world) return state;
  return { ...state, world: spreading.length > 0 ? spreadToNeighbors(world, spreading) : world };
}