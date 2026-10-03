/**
 * Ein Tile ist ein einziges, klar beschriebenes Datenobjekt.
 * Es gibt keine zweite Wahrheit: kein Tile liegt gleichzeitig in zwei Arrays
 * mit unterschiedlichem Zustand. Erde, Sichtbarkeit und Nutzbarkeit stehen
 * ausschließlich hier.
 */

/** Was ist dieses Feld? */
export const TILE_KIND = Object.freeze({
  EARTH: 'EARTH',
  HIVE: 'HIVE',
  DUNGEON_FLOOR: 'DUNGEON_FLOOR',
});

/** Sichtbar heißt nicht nutzbar. Erde ist sichtbar, aber kein Bauplatz. */
export const TILE_VISIBILITY = Object.freeze({
  VISIBLE: 'VISIBLE',
  HIDDEN: 'HIDDEN',
});

export const TILE_USABILITY = Object.freeze({
  USABLE: 'USABLE',
  UNUSABLE: 'UNUSABLE',
});

/** Sichtbare Zustände eines Erdblocks. */
export const EARTH_HEALTH = Object.freeze({
  HEALTHY: 'HEALTHY',
  TOUCHED: 'TOUCHED',
  CRITICAL: 'CRITICAL',
  DESTROYED: 'DESTROYED',
});

/** Woher kommt ein freier Boden? */
export const FLOOR_ORIGIN = Object.freeze({
  HIVE_BURROW: 'HIVE_BURROW',
  MINED: 'MINED',
});

export function tileId(x, y) {
  return `${x},${y}`;
}

export function parseTileId(id) {
  const [x, y] = id.split(',').map(Number);
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
  };
}

export function isEarth(tile) {
  return tile.kind === TILE_KIND.EARTH;
}

export function isVisible(tile) {
  return tile.visibility === TILE_VISIBILITY.VISIBLE;
}

/** Nutzbarer Raum: fertiger Boden oder der Hive selbst. */
export function isUsable(tile) {
  return tile.usability === TILE_USABILITY.USABLE;
}

/** Nur fertiger Boden kann später ein Objekt aufnehmen. */
export function isBuildable(tile) {
  return tile.kind === TILE_KIND.DUNGEON_FLOOR;
}

export function withEarthHealth(tile, earthHealth) {
  return { ...tile, earthHealth };
}
