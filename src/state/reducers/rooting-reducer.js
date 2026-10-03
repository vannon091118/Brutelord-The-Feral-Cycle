/**
 * Ausbau der Verwurzelung: ein Takt vergeht, jedes wachsende Feld kommt ein
 * Stück weiter, ruhende ruhen aus. Erst danach stoßen die Tentakel in alle
 * Nachbarfelder — und legen dabei den Boden frei, den sie erreichen.
 */
import { ACTION } from '../../domain/actions/action-types.js';
import { ROOTING_CONFIG } from '../../domain/world/rooting-config.js';
import { spreadToNeighbors, tickRooting } from '../../domain/world/rooting-world.js';

export function reduceRooting(state, action) {
  return action.type === ACTION.ROOTING_TICK ? tick(state) : state;
}

function tick(state) {
  const { world, spreading } = tickRooting(state.world, ROOTING_CONFIG.tickMs);
  if (world === state.world) return state;
  return { ...state, world: spreading.length > 0 ? spreadToNeighbors(world, spreading) : world };
}