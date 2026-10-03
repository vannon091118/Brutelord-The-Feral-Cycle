/**
 * Dungling-Domäne: geboren werden, kriechen, bereit sein.
 */
import { createDungling, idle, startSpawning } from '../../domain/entities/dungling.js';
import { parseTileId } from '../../domain/world/tile.js';
import { ONBOARDING_CONFIG } from '../../domain/onboarding/onboarding-config.js';
import { ONBOARDING_STATE, enterOnboarding } from '../../domain/onboarding/onboarding-state.js';
import { ACTION } from '../../domain/actions/action-types.js';
import { firstMineableTileId } from '../selectors.js';

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

function spawnTileOf(world) {
  const spawn = world.spawnTileId ?? ONBOARDING_CONFIG.dunglingSpawnTile;
  return typeof spawn === 'string' ? parseTileId(spawn) : spawn;
}

function spawned(state) {
  if (state.onboarding.state !== ONBOARDING_STATE.WAITING_FOR_DUNGLING) return state;
  return {
    ...state,
    dungling: startSpawning(createDungling({ tile: spawnTileOf(state.world) })),
    hive: { ...state.hive, spawned: state.hive.spawned + 1 },
    onboarding: enterOnboarding(state.onboarding, ONBOARDING_STATE.DUNGLING_SPAWNING),
  };
}

function emerged(state) {
  if (state.onboarding.state !== ONBOARDING_STATE.DUNGLING_SPAWNING) return state;
  return {
    ...state,
    dungling: idle(state.dungling),
    onboarding: enterOnboarding(state.onboarding, ONBOARDING_STATE.DUNGLING_IDLE),
  };
}

/** Der Dungling ist bereit: genau ein Erdblock wird zur nächsten Aktion. */
function ready(state) {
  if (state.onboarding.state !== ONBOARDING_STATE.DUNGLING_IDLE) return state;
  return {
    ...state,
    highlightedTileId: firstMineableTileId(state.world),
    onboarding: enterOnboarding(state.onboarding, ONBOARDING_STATE.TILE_SELECTION),
  };
}
