/**
 * Ausbau-Domäne: Der zerstörte Block wird zum nutzbaren Raum, danach wird
 * das Baumenü sichtbar. Das Grid wächst exakt um das eine Tile.
 */
import { countFloorTiles } from '../../domain/world/grid.js';
import { ONBOARDING_STATE, enterOnboarding } from '../../domain/onboarding/onboarding-state.js';
import { ACTION } from '../../domain/actions/action-types.js';

export function reduceExpansion(state, action) {
  switch (action.type) {
    case ACTION.GRID_EXPANDED:
      return expanded(state);
    case ACTION.BUILD_MENU_SHOWN:
      return menuShown(state);
    default:
      return state;
  }
}

function expanded(state) {
  if (state.onboarding.state !== ONBOARDING_STATE.TILE_DESTROYED || !state.mining) return state;
  const gainedTileId = state.mining.tileId;
  return {
    ...state,
    usableTileCount: countFloorTiles(state.world),
    expansion: { tileId: gainedTileId, addedTileIds: [gainedTileId] },
    onboarding: enterOnboarding(state.onboarding, ONBOARDING_STATE.GRID_EXPANDED),
  };
}

function menuShown(state) {
  if (state.onboarding.state !== ONBOARDING_STATE.GRID_EXPANDED) return state;
  return {
    ...state,
    buildMenuVisible: true,
    onboarding: enterOnboarding(state.onboarding, ONBOARDING_STATE.BUILD_MENU_VISIBLE),
  };
}
