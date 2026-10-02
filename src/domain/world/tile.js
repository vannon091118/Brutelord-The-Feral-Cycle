import { TILE_SIZE } from './world-config.js';

export const TILE_KIND = {
  EARTH: 'earth',
  HIVE: 'hive',
  FLOOR: 'floor',
};

/** The three visible states of an earth block. */
export const EARTH_PHASE = {
  HEALTHY: 'healthy',
  TOUCHED: 'touched',
  CRITICAL: 'critical',
};

/** Progress thresholds that map mining progress to a visible earth phase. */
export const PHASE_THRESHOLDS = {
  TOUCHED: 0.45,
  CRITICAL: 0.8,
};

export function createTile(id, x, y, kind, variant) {
  return {
    id,
    x,
    y,
    kind,
    variant,
    buildable: false,
    mining: {
      active: false,
      progress: 0,
      phase: EARTH_PHASE.HEALTHY,
      collapsing: false,
    },
  };
}

export function isEarthTile(tile) {
  return tile.kind === TILE_KIND.EARTH;
}

export function isFloorTile(tile) {
  return tile.kind === TILE_KIND.FLOOR;
}

export function isHiveTile(tile) {
  return tile.kind === TILE_KIND.HIVE;
}

/** Tile units (fractional) of the tile centre. */
export function tileCenter(tile) {
  return { x: tile.x + 0.5, y: tile.y + 0.5 };
}

/** SVG user units of the tile centre. */
export function tileCenterPx(tile) {
  return { x: (tile.x + 0.5) * TILE_SIZE, y: (tile.y + 0.5) * TILE_SIZE };
}

export function phaseForProgress(progress) {
  if (progress >= PHASE_THRESHOLDS.CRITICAL) return EARTH_PHASE.CRITICAL;
  if (progress >= PHASE_THRESHOLDS.TOUCHED) return EARTH_PHASE.TOUCHED;
  return EARTH_PHASE.HEALTHY;
}