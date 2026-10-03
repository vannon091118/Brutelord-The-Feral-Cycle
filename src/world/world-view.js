/**
 * Ableitung für die Darstellung: was ist gerade zu sehen, was ist anklickbar,
 * wo steht der Dungling. Reine Leseoperation auf dem Spielzustand.
 *
 * Die Welt ist groß, das Bild ist klein: die Kamera folgt dem gebauten Raum,
 * und sie zeigt nur, was die Verwurzelung freigelegt hat.
 */
import { TILE_KIND, isVisible } from '../domain/world/tile.js';
import { allTiles } from '../domain/world/grid.js';
import { mineableFrontierIds } from '../domain/actions/mining.js';
import { dunglingPositionPx } from '../domain/entities/dungling.js';
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

/** Mittelpunkt von allem, was gebaut oder gewachsen ist. */
export function builtCenterPx(world, tileSize) {
  const built = allTiles(world).filter((tile) => tile.kind !== TILE_KIND.EARTH);
  const source = built.length > 0 ? built : [{ x: world.hiveOrigin.x, y: world.hiveOrigin.y }];
  const sumX = source.reduce((sum, tile) => sum + (tile.x + 0.5) * tileSize, 0);
  const sumY = source.reduce((sum, tile) => sum + (tile.y + 0.5) * tileSize, 0);
  return { x: sumX / source.length, y: sumY / source.length };
}

/** Das Sichtfeld als Kasten in Weltkoordinaten, im Raster verankert. */
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

export function worldView({ game, tileSize = TILE_SIZE }) {
  const viewport = viewportPixelSize(tileSize);
  const camera = cameraBox({ world: game.world, tileSize, viewport });
  return {
    tileSize,
    viewport,
    camera,
    tiles: tilesInView(game.world, camera, tileSize),
    frontier: new Set(mineableFrontierIds(game.world)),
    canSelect: selectMaySelectTiles(game),
    softHint: selectSoftHintVisible(game),
    workingTileId: selectWorkingTileId(game),
    dunglingPx: game.dungling ? dunglingPositionPx(game.dungling, tileSize) : null,
    newFloorTileId: game.expansion?.tileId ?? null,
    showArrival: game.expansion !== null && ARRIVAL_STATES.includes(game.onboarding.state),
  };
}