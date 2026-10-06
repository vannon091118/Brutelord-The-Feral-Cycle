/** Der Kreislauf durch den echten Reducer: der Etagensprung und der Grab im
 *  Spielzustand, damit die Abnahme nicht am Spiel vorbeiprueft. */
import { ACTION } from '../../src/domain/actions/action-types.js';
import { ONBOARDING_STATE, enterOnboarding } from '../../src/domain/onboarding/onboarding-state.js';
import { createInitialGameState } from '../../src/state/game-state.js';
import { gameReducer } from '../../src/state/game-reducer.js';
import { reduceMining } from '../../src/state/reducers/mining-reducer.js';
import { firstMineableTileId } from '../../src/state/selectors.js';
import { DEEPEST_FLOOR, createFloorWorld } from '../../src/domain/world/floor.js';

export const SEED = 'a1b2c3d4';
export const TIEFSTE = DEEPEST_FLOOR;

export function start() {
  return createInitialGameState(SEED);
}

export function abstiege(state, schritte) {
  let next = state;
  for (let schritt = 0; schritt < schritte; schritt += 1) next = gameReducer(next, { type: ACTION.FLOOR_DESCEND });
  return next;
}

export function versuch(state) {
  return gameReducer(state, { type: ACTION.FLOOR_DESCEND });
}

export function weltInTiefe(depth) {
  return createFloorWorld(SEED, depth);
}

export function grab(state, world) {
  const bereit = {
    ...state,
    world,
    dunglings: [{ id: 'dungling-1', tile: { x: 0, y: 0 }, state: 'IDLE', facing: 1, targetTileId: null, job: null }],
    selectedTileId: firstMineableTileId(world),
    onboarding: enterOnboarding(state.onboarding, ONBOARDING_STATE.ACTION_MENU),
  };
  const geordnet = reduceMining(bereit, { type: ACTION.MINING_ORDERED });
  const amFeld = reduceMining(geordnet, { type: ACTION.DUNGLING_REACHED_TILE });
  return reduceMining(amFeld, { type: ACTION.MINING_COMPLETED });
}
