// @doc: docs/daten/raid/raid-world.md#raid-world
import { createWorld } from '../world/grid.js';
import { TILE_KIND } from '../world/tile.js';
import { terrainAt } from './raid-terrain.js';

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