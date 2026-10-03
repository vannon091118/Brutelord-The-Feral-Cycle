/**
 * Ableitung für die Darstellung: was ist gerade zu sehen, was ist anklickbar,
 * wo steht der Dungling. Reine Leseoperation auf dem Spielzustand.
 */
import { allTiles } from '../domain/world/grid.js';
import { mineableFrontierIds } from '../domain/actions/mining.js';
import { dunglingPositionPx } from '../domain/entities/dungling.js';
import { worldPixelSize } from '../domain/world/world-config.js';
import { ONBOARDING_STATE } from '../domain/onboarding/onboarding-state.js';
import {
  selectMaySelectTiles,
  selectSoftHintVisible,
  selectWorkingTileId,
} from '../state/selectors.js';

const ARRIVAL_STATES = [ONBOARDING_STATE.GRID_EXPANDED, ONBOARDING_STATE.TILE_DESTROYED];

export function worldView({ game, tileSize }) {
  return {
    size: worldPixelSize(tileSize),
    gridWidth: game.world.width * tileSize,
    gridHeight: game.world.height * tileSize,
    tiles: allTiles(game.world),
    frontier: new Set(mineableFrontierIds(game.world)),
    canSelect: selectMaySelectTiles(game),
    softHint: selectSoftHintVisible(game),
    workingTileId: selectWorkingTileId(game),
    dunglingPx: game.dungling ? dunglingPositionPx(game.dungling, tileSize) : null,
    newFloorTileId: game.expansion?.tileId ?? null,
    showArrival: game.expansion !== null && ARRIVAL_STATES.includes(game.onboarding.state),
  };
}
