/** Prüft Tile-Umwandlung und Genau-ein-Feld-Erweiterung. */
import { EARTH_HEALTH, FLOOR_ORIGIN, TILE_KIND, TILE_USABILITY } from '../../src/domain/world/tile.js';
import { allTiles, countFloorTiles, createWorld, getTile } from '../../src/domain/world/grid.js';
import { check } from './expect.mjs';

export function checkMinedTile(state, target, earthBefore) {
  const tile = getTile(state.world, target);
  const earthAfter = allTiles(state.world).filter((entry) => entry.kind === TILE_KIND.EARTH).length;
  check('Erde wird nutzbarer Boden', tile.kind === TILE_KIND.DUNGEON_FLOOR && tile.floorOrigin === FLOOR_ORIGIN.MINED);
  check('Boden ist bereit für Bauen', tile.usability === TILE_USABILITY.USABLE && tile.earthHealth === EARTH_HEALTH.DESTROYED);
  check('Grid erweitert sich um exakt ein Tile', state.expansion.addedTileIds.length === 1 && state.expansion.tileId === target);
  check('Nutzbarer Raum waechst um genau das neue Feld', state.usableTileCount === countFloorTiles(createWorld()) + 1);
  check('Genau ein Erdblock verschwindet', earthAfter === earthBefore - 1);
}
