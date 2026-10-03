/** Das Raster: ein Tile pro Koordinate, Sichtbarkeit folgt der Sonde. */
import {
  GRID_HEIGHT,
  GRID_WIDTH,
  HIVE_ORIGIN,
  HIVE_SIZE,
  LADDER_TILE,
} from './world-config.js';
import {
  FLOOR_ORIGIN,
  TILE_VISIBILITY,
  createEarthTile,
  createFloorTile,
  createHiveTile,
  isBuildable,
  parseTileId,
  tileId,
} from './tile.js';
import { revealWorld } from './reveal.js';
import { ONBOARDING_CONFIG } from '../onboarding/onboarding-config.js';

function isHiveCell(x, y, hiveOrigin) {
  return (
    x >= hiveOrigin.x &&
    x < hiveOrigin.x + HIVE_SIZE.width &&
    y >= hiveOrigin.y &&
    y < hiveOrigin.y + HIVE_SIZE.height
  );
}

function tileForCell({ x, y, hiveOrigin, spawnTile }) {
  if (isHiveCell(x, y, hiveOrigin)) return createHiveTile(x, y);
  if (spawnTile && x === spawnTile.x && y === spawnTile.y) {
    return createFloorTile(x, y, FLOOR_ORIGIN.HIVE_BURROW);
  }
  return { ...createEarthTile(x, y), visibility: TILE_VISIBILITY.HIDDEN };
}

function hiveAnchorIds(hiveOrigin) {
  const ids = [];
  for (let y = hiveOrigin.y; y < hiveOrigin.y + HIVE_SIZE.height; y += 1) {
    for (let x = hiveOrigin.x; x < hiveOrigin.x + HIVE_SIZE.width; x += 1) ids.push({ x, y });
  }
  return ids;
}

export function createWorld({
  width = GRID_WIDTH,
  height = GRID_HEIGHT,
  hiveOrigin = HIVE_ORIGIN,
  spawnTile = ONBOARDING_CONFIG.dunglingSpawnTile,
} = {}) {
  const context = { hiveOrigin, spawnTile };
  const tiles = {};
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      tiles[tileId(x, y)] = tileForCell({ x, y, ...context });
    }
  }

  const world = {
    width,
    height,
    hiveOrigin: { ...hiveOrigin },
    spawnTileId: spawnTile ? tileId(spawnTile.x, spawnTile.y) : null,
    entrance: { ...LADDER_TILE },
    tiles,
  };

  return revealWorld(world, [...hiveAnchorIds(hiveOrigin), ...(spawnTile ? [spawnTile] : [])]);
}

export function getTile(world, id) {
  return world.tiles[id] ?? null;
}

export function allTiles(world) {
  return Object.values(world.tiles);
}

export function isInsideGrid(world, x, y) {
  return x >= 0 && y >= 0 && x < world.width && y < world.height;
}

export function replaceTile(world, nextTile) {
  return { ...world, tiles: { ...world.tiles, [nextTile.id]: nextTile } };
}

export function neighborIds(world, id) {
  const { x, y } = parseTileId(id);
  return [
    { x: x + 1, y },
    { x: x - 1, y },
    { x, y: y + 1 },
    { x, y: y - 1 },
  ]
    .filter((p) => isInsideGrid(world, p.x, p.y))
    .map((p) => tileId(p.x, p.y));
}

export function floorTiles(world) {
  return allTiles(world).filter(isBuildable);
}

export function countFloorTiles(world) {
  return floorTiles(world).length;
}
