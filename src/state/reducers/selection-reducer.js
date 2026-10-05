// @doc: docs/daten/reducers/selection-reducer.md#selection-reducer
import { MINING_PHASE, canMineTile } from '../../domain/actions/mining.js';
import { ONBOARDING_STATE, enterOnboarding, hasReached } from '../../domain/onboarding/onboarding-state.js';
import { ACTION } from '../../domain/actions/action-types.js';

export function reduceSelection(state, action) {
  switch (action.type) {
    case ACTION.TILE_SELECTED:
      return selectTile(state, action.tileId);
    case ACTION.TILE_SELECTION_CLEARED:
      return clearSelection(state);
    default:
      return state;
  }
}

function isSelectable(state, tileId) {
  if (!tileId) return false;
  if (!hasReached(state.onboarding, ONBOARDING_STATE.TILE_SELECTION)) return false;
  if (state.mining && state.mining.phase !== MINING_PHASE.COMPLETE) return false;
  return canMineTile(state.world, tileId);
}

function selectTile(state, tileId) {
  if (!isSelectable(state, tileId)) return state;
  return {
    ...state,
    selectedTileId: tileId,
    selectedBuildingId: null,
    onboarding: enterOnboarding(state.onboarding, ONBOARDING_STATE.ACTION_MENU),
  };
}

function clearSelection(state) {
  if (state.selectedTileId === null) return state;
  return {
    ...state,
    selectedTileId: null,
    onboarding: enterOnboarding(
      state.onboarding,
      state.buildMenuVisible ? ONBOARDING_STATE.BUILD_MENU_VISIBLE : ONBOARDING_STATE.TILE_SELECTION,
    ),
  };
}
