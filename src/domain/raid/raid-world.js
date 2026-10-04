/** Der fremde Dungeon: der Snapshot des Verteidigers plus Hartgestein aus seinem Seed. */
import { createWorld } from '../world/grid.js';
import { TILE_KIND } from '../world/tile.js';
import { terrainAt } from './raid-terrain.js';

/** Ein Durchgang über das Raster statt eines replaceTile je Feld — das war 4096 Kopien. */
function withHardRock(world, seed) {
  const tiles = world.tiles.map((tile) => (tile.kind === TILE_KIND.EARTH
    ? { ...tile, terrain: terrainAt({ seed, x: tile.x, y: tile.y }) }
    : tile));
  return { ...world, tiles };
}

export function createRaidWorld({ snapshotSeed = 0 } = {}) {
  const world = createWorld({ playerseed: snapshotSeed, spawnTile: null });
  return withHardRock(world, world.seed);
}