/** Ein Tile als ein Datenobjekt: Art, Sichtbarkeit, Nutzbarkeit, Verwurzelung. */
import { ROOTING_PHASE, createRooting } from './rooting.js';

export const TILE_KIND = Object.freeze({
  EARTH: 'EARTH',
  HIVE: 'HIVE',
  DUNGEON_FLOOR: 'DUNGEON_FLOOR',
});

export const TILE_VISIBILITY = Object.freeze({
  VISIBLE: 'VISIBLE',
  HIDDEN: 'HIDDEN',
});

export const TILE_USABILITY = Object.freeze({
  USABLE: 'USABLE',
  UNUSABLE: 'UNUSABLE',
});

export const EARTH_HEALTH = Object.freeze({
  HEALTHY: 'HEALTHY',
  TOUCHED: 'TOUCHED',
  CRITICAL: 'CRITICAL',
  DESTROYED: 'DESTROYED',
});

export const FLOOR_ORIGIN = Object.freeze({
  HIVE_BURROW: 'HIVE_BURROW',
  MINED: 'MINED',
});

export function tileId(x, y) {
  return `${x},${y}`;
}

export function parseTileId(id) {
  const commaIndex = id.indexOf(',');
  const x = +(id.substring(0, commaIndex));
  const y = +(id.substring(commaIndex + 1));
  return { x, y };
}

export function createEarthTile(x, y) {
  return {
    id: tileId(x, y),
    x,
    y,
    kind: TILE_KIND.EARTH,
    visibility: TILE_VISIBILITY.VISIBLE,
    usability: TILE_USABILITY.UNUSABLE,
    earthHealth: EARTH_HEALTH.HEALTHY,
    floorOrigin: null,
    rooting: createRooting(),
  };
}

export function createHiveTile(x, y) {
  return {
    id: tileId(x, y),
    x,
    y,
    kind: TILE_KIND.HIVE,
    visibility: TILE_VISIBILITY.VISIBLE,
    usability: TILE_USABILITY.USABLE,
    earthHealth: EARTH_HEALTH.DESTROYED,
    floorOrigin: null,
    rooting: createRooting(ROOTING_PHASE.CLAIMED),
  };
}

export function createFloorTile(x, y, origin = FLOOR_ORIGIN.MINED) {
  return {
    id: tileId(x, y),
    x,
    y,
    kind: TILE_KIND.DUNGEON_FLOOR,
    visibility: TILE_VISIBILITY.VISIBLE,
    usability: TILE_USABILITY.USABLE,
    earthHealth: EARTH_HEALTH.DESTROYED,
    floorOrigin: origin,
    rooting: createRooting(origin === FLOOR_ORIGIN.HIVE_BURROW ? ROOTING_PHASE.CLAIMED : ROOTING_PHASE.DARK),
  };
}

export function isEarth(tile) {
  return tile.kind === TILE_KIND.EARTH;
}

export function isVisible(tile) {
  return tile.visibility === TILE_VISIBILITY.VISIBLE;
}

/** Trägt null, weil tileAt() am Rand des Rasters leer bleibt. */
export function isUsable(tile) {
  return tile?.usability === TILE_USABILITY.USABLE;
}

export function isBuildable(tile) {
  return tile.kind === TILE_KIND.DUNGEON_FLOOR;
}

export function withEarthHealth(tile, earthHealth) {
  return { ...tile, earthHealth };
}

export function withRooting(tile, rooting) {
  return { ...tile, rooting };
}
