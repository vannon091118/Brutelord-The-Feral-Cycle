/** Dungling-Domäne: geboren werden, kriechen, bereit sein. */
import { createDungling, idle, nextDunglingId, startSpawning } from '../../domain/entities/dungling.js';
import { ONBOARDING_STATE, enterOnboarding } from '../../domain/onboarding/onboarding-state.js';
import { ACTION } from '../../domain/actions/action-types.js';
import { spawnTile, firstMineableTileId } from '../selectors.js';

export function reduceDungling(state, action) {
  switch (action.type) {
    case ACTION.DUNGLING_SPAWNED:
      return spawned(state);
    case ACTION.DUNGLING_EMERGED:
      return emerged(state);
    case ACTION.DUNGLING_READY:
      return ready(state);
    default:
      return state;
  }
}

function withLead(state, change) {
  return { ...state, dunglings: state.dunglings.map((worker, index) => (index === 0 ? change(worker) : worker)) };
}

function spawned(state) {
  if (state.onboarding.state !== ONBOARDING_STATE.WAITING_FOR_DUNGLING) return state;
  const born = startSpawning(
    createDungling({ id: nextDunglingId(state.dunglings), tile: spawnTile(state.world) }),
  );
  return {
    ...state,
    dunglings: [...state.dunglings, born],
    hive: { ...state.hive, spawned: state.hive.spawned + 1 },
    onboarding: enterOnboarding(state.onboarding, ONBOARDING_STATE.DUNGLING_SPAWNING),
  };
}

function emerged(state) {
  if (state.onboarding.state !== ONBOARDING_STATE.DUNGLING_SPAWNING) return state;
  return {
    ...withLead(state, idle),
    onboarding: enterOnboarding(state.onboarding, ONBOARDING_STATE.DUNGLING_IDLE),
  };
}

function ready(state) {
  if (state.onboarding.state !== ONBOARDING_STATE.DUNGLING_IDLE) return state;
  return {
    ...state,
    highlightedTileId: firstMineableTileId(state.world),
    onboarding: enterOnboarding(state.onboarding, ONBOARDING_STATE.TILE_SELECTION),
  };
}
