// @doc: docs/daten/state/selectors.md#selectors
import {
  MINING_PHASE,
  canMineTile,
  depositInfoAt,
  depositRiskClassAt,
} from '../domain/actions/mining.js';
import { placementReport } from '../domain/buildings/building.js';
import { ONBOARDING_CONFIG } from '../domain/onboarding/onboarding-config.js';
import { ONBOARDING_STATE, hasReached } from '../domain/onboarding/onboarding-state.js';
import { parseTileId, tileId } from '../domain/world/tile.js';

export function spawnTile(world) {
  const spawn = world.spawnTileId ?? tileId(ONBOARDING_CONFIG.dunglingSpawnTile.x, ONBOARDING_CONFIG.dunglingSpawnTile.y);
  return parseTileId(spawn);
}

export function firstMineableTileId(world) {
  const { x, y } = ONBOARDING_CONFIG.firstEarthBlock;
  const id = `${x},${y}`;
  return canMineTile(world, id) ? id : null;
}

function selectMiningActive(state) {
  return Boolean(state.mining) && state.mining.phase !== MINING_PHASE.COMPLETE;
}

export function selectMaySelectTiles(state) {
  return hasReached(state.onboarding, ONBOARDING_STATE.TILE_SELECTION) && !selectMiningActive(state);
}

export function selectSoftHintVisible(state) {
  return (
    state.onboarding.state === ONBOARDING_STATE.BUILD_MENU_VISIBLE ||
    state.onboarding.state === ONBOARDING_STATE.GRID_EXPANDED ||
    (state.buildMenuVisible && !selectMiningActive(state))
  );
}

export function selectWorkingTileId(state) {
  return state.mining?.phase === MINING_PHASE.WORKING ? state.mining.tileId : null;
}

export function selectPlacement(state) {
  if (!state.buildChoice) return null;
  return placementReport({ world: state.world, buildings: state.buildings, type: state.buildChoice });
}

export function selectedDepositInfo(state) {
  const tileId = state.selectedTileId;
  if (!tileId) return null;
  const tile = state.world.tiles?.find((t) => t.id === tileId) ?? null;
  if (!tile) return null;
  return depositInfoAt(state.world, tile);
}

export function selectedDepositRiskClass(state) {
  const tileId = state.selectedTileId;
  if (!tileId) return null;
  const tile = state.world.tiles?.find((t) => t.id === tileId) ?? null;
  if (!tile) return null;
  return depositRiskClassAt(state.world, tile);
}

export function selectSelectedDepositInfo(game) {
  return selectedDepositInfo(game);
}

export function selectSelectedDepositRiskClass(game) {
  return selectedDepositRiskClass(game);
}
