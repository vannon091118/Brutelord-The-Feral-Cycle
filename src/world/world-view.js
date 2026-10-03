/** Ableitung für die Darstellung: Ausschnitt, Schwarm, Popups, Bauten. */
import { TILE_KIND, isVisible } from '../domain/world/tile.js';
import { allTiles } from '../domain/world/grid.js';
import { MINING_PHASE, mineableFrontierIds } from '../domain/actions/mining.js';
import { tilePositionPx, workerPositionPx } from '../domain/entities/dungling.js';
import {
  TILE_SIZE,
  clamp,
  viewportPixelSize,
  worldPixelSize,
} from '../domain/world/world-config.js';
import { ONBOARDING_STATE } from '../domain/onboarding/onboarding-state.js';
import {
  selectMaySelectTiles,
  selectSoftHintVisible,
  selectWorkingTileId,
} from '../state/selectors.js';

const ARRIVAL_STATES = [ONBOARDING_STATE.GRID_EXPANDED, ONBOARDING_STATE.TILE_DESTROYED];

export function builtCenterPx(world, tileSize) {
  const built = allTiles(world).filter((tile) => tile.kind !== TILE_KIND.EARTH);
  const source = built.length > 0 ? built : [{ x: world.hiveOrigin.x, y: world.hiveOrigin.y }];
  const sumX = source.reduce((sum, tile) => sum + (tile.x + 0.5) * tileSize, 0);
  const sumY = source.reduce((sum, tile) => sum + (tile.y + 0.5) * tileSize, 0);
  return { x: sumX / source.length, y: sumY / source.length };
}

export function cameraBox({ world, tileSize, viewport }) {
  const whole = worldPixelSize(tileSize);
  const focus = builtCenterPx(world, tileSize);
  return {
    x: Math.round(clamp(focus.x, viewport.width / 2, whole.width - viewport.width / 2) - viewport.width / 2),
    y: Math.round(clamp(focus.y, viewport.height / 2, whole.height - viewport.height / 2) - viewport.height / 2),
    width: viewport.width,
    height: viewport.height,
  };
}

function tilesInView(world, camera, tileSize) {
  return allTiles(world).filter((tile) => {
    if (!isVisible(tile)) return false;
    const x = tile.x * tileSize;
    const y = tile.y * tileSize;
    return x + tileSize > camera.x && x < camera.x + camera.width && y + tileSize > camera.y && y < camera.y + camera.height;
  });
}

function workerViews(game, tileSize) {
  return game.dunglings.map((worker) => ({
    id: worker.id,
    dungling: worker,
    position: workerPositionPx(worker, tileSize),
    step: game.mining && game.mining.workerId === worker.id ? game.mining.tick : 0,
    mining:
      Boolean(game.mining) &&
      game.mining.workerId === worker.id &&
      game.mining.phase === MINING_PHASE.WORKING,
  }));
}

function popupViews(game, tileSize) {
  return game.popups.map((popup) => ({ id: popup.id, position: tilePositionPx(popup, tileSize) }));
}

function depositsOf(world, tiles) {
  return tiles.map((tile) => ({ ...tile, deposit: tile.depositId ? world.deposits?.[tile.depositId] ?? null : null }));
}

export function worldView({ game, tileSize = TILE_SIZE }) {
  const viewport = viewportPixelSize(tileSize);
  const camera = cameraBox({ world: game.world, tileSize, viewport });
  const visible = tilesInView(game.world, camera, tileSize);
  return {
    tileSize,
    viewport,
    camera,
    tiles: depositsOf(game.world, visible),
    frontier: new Set(mineableFrontierIds(game.world)),
    canSelect: selectMaySelectTiles(game),
    softHint: selectSoftHintVisible(game),
    workingTileId: selectWorkingTileId(game),
    workers: workerViews(game, tileSize),
    popups: popupViews(game, tileSize),
    world: game.world,
    buildings: game.buildings,
    buildChoice: game.buildChoice,
    selectedBuildingId: game.selectedBuildingId,
    newFloorTileId: game.expansion?.tileId ?? null,
    lastHarvest: game.lastHarvest ?? null,
    showArrival: game.expansion !== null && ARRIVAL_STATES.includes(game.onboarding.state),
  };
}
