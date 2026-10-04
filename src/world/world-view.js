/** Ableitung für die Darstellung: Ausschnitt, Schwarm, Popups, Bauten. */
import { TILE_KIND, isVisible } from '../domain/world/tile.js';
import { tileAt } from '../domain/world/grid.js';
import { MINING_PHASE, canMineTile } from '../domain/actions/mining.js';
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

/** Ohne Array: der Bauplatz zaehlt wenige Kacheln, das Raster hat viertausend. */
export function builtCenterPx(world, tileSize) {
  let count = 0;
  let sumX = 0;
  let sumY = 0;
  for (const tile of world.tiles) {
    if (!tile || tile.kind === TILE_KIND.EARTH) continue;
    count += 1;
    sumX += (tile.x + 0.5) * tileSize;
    sumY += (tile.y + 0.5) * tileSize;
  }
  if (count === 0) {
    return { x: (world.hiveOrigin.x + 0.5) * tileSize, y: (world.hiveOrigin.y + 0.5) * tileSize };
  }
  return { x: sumX / count, y: sumY / count };
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

function insideCamera(tile, camera, tileSize) {
  const x = tile.x * tileSize;
  const y = tile.y * tileSize;
  return x + tileSize > camera.x && x < camera.x + camera.width && y + tileSize > camera.y && y < camera.y + camera.height;
}

/** Der Ausschnitt wird koordinatenweise abgegangen, nicht das ganze Raster. */
function tilesInView(world, camera, tileSize) {
  const seen = [];
  const from = (start) => Math.max(0, Math.floor(start / tileSize) - 1);
  const to = (start, extent, limit) => Math.min(limit, Math.floor((start + extent) / tileSize));
  for (let y = from(camera.y); y <= to(camera.y, camera.height, world.height - 1); y += 1) {
    for (let x = from(camera.x); x <= to(camera.x, camera.width, world.width - 1); x += 1) {
      const tile = tileAt(world, x, y);
      if (tile && isVisible(tile) && insideCamera(tile, camera, tileSize)) seen.push(tile);
    }
  }
  return seen;
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

/** Nur Kacheln mit Vorrat werden kopiert — sonst bliebe die Objektidentitaet. */
function depositsOf(world, tiles) {
  return tiles.map((tile) => (tile.depositId ? { ...tile, deposit: world.deposits?.[tile.depositId] ?? null } : tile));
}

/** Die Frontier zaehlt nur, was der Ausschnitt zeigen kann. */
function frontierOf(world, tiles) {
  const frontier = new Set();
  for (const tile of tiles) if (canMineTile(world, tile.id)) frontier.add(tile.id);
  return frontier;
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
    frontier: frontierOf(game.world, visible),
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
