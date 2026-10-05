/** Der Gang um den Hive: Burrow-Boden statt Erde, sichtbar und ohne Wand. */
import { BURROW_RING, HIVE_SIZE } from '../../src/domain/world/world-config.js';
import { FLOOR_ORIGIN, TILE_KIND, isVisible, tileId } from '../../src/domain/world/tile.js';
import {
  allTiles,
  countFloorTiles,
  createWorld,
  getTile,
  isBurrowCell,
  neighborIds,
} from '../../src/domain/world/grid.js';
import { hiddenMask } from '../../src/domain/world/edge-mask.js';
import { canMineTile } from '../../src/domain/actions/mining.js';
import { ONBOARDING_CONFIG } from '../../src/domain/onboarding/onboarding-config.js';
import { check, section } from './expect.mjs';

function ringTiles(world) {
  return allTiles(world).filter((tile) => tile.kind !== TILE_KIND.HIVE && isBurrowCell(tile.x, tile.y, world.hiveOrigin));
}

function ringSpace(world) {
  const width = world.hiveSize.width + BURROW_RING * 2;
  const height = world.hiveSize.height + BURROW_RING * 2;
  return width * height - world.hiveSize.width * world.hiveSize.height;
}

function checkRing(world) {
  const ring = ringTiles(world);
  section('Der Gang um den Hive');
  check('Der Ring legt genau seine Flaeche frei', ring.length === ringSpace(world), `${ring.length} gegen ${ringSpace(world)}`);
  check('Jedes Ringfeld ist Burrow-Boden', ring.every((tile) => tile.kind === TILE_KIND.DUNGEON_FLOOR && tile.floorOrigin === FLOOR_ORIGIN.HIVE_BURROW));
  check('Der nutzbare Raum ist genau der Ring', countFloorTiles(world) === ring.length);
  check('Kein Ringfeld ist verborgen', ring.every(isVisible));
  check('Der Start liegt mitten im Ring', isBurrowCell(ONBOARDING_CONFIG.dunglingSpawnTile.x, ONBOARDING_CONFIG.dunglingSpawnTile.y, world.hiveOrigin));
  check('Der Hive behaelt seine Flaeche', allTiles(world).filter((tile) => tile.kind === TILE_KIND.HIVE).length === HIVE_SIZE.width * HIVE_SIZE.height);
}

function earthRim(world, ring) {
  const ids = new Set();
  for (const tile of ring) {
    for (const id of neighborIds(world, tile.id)) {
      const nachbar = getTile(world, id);
      if (nachbar && nachbar.kind === TILE_KIND.EARTH) ids.add(id);
    }
  }
  return [...ids];
}

function checkWall(world, ring) {
  section('Der Gang traegt keine Wand');
  const rim = earthRim(world, ring);
  check('Jedes Ringfeld steht ohne Wand zur Unbekannten', ring.every((tile) => hiddenMask(world, tile.x, tile.y) === 0));
  check('Der Erdrand des Rings ist ganz sichtbar', rim.length > 0 && rim.every((id) => isVisible(getTile(world, id))), `${rim.length} Kacheln`);
}

function checkOutside(world) {
  section('Der Ring haengt an der Startkachel');
  const first = ONBOARDING_CONFIG.firstEarthBlock;
  const tile = getTile(world, tileId(first.x, first.y));
  check('Der erste Erdblock liegt ausserhalb des Rings', Boolean(tile) && !isBurrowCell(tile.x, tile.y, world.hiveOrigin));
  check('Der erste Erdblock ist sichtbar und abbaubar', Boolean(tile) && isVisible(tile) && canMineTile(world, tile.id));
  check('Ohne Startkachel entsteht kein Ring', countFloorTiles(createWorld({ spawnTile: null })) === 0);
}

export function checkBurrowRing() {
  const world = createWorld();
  const ring = ringTiles(world);
  checkRing(world);
  checkWall(world, ring);
  checkOutside(world);
}
