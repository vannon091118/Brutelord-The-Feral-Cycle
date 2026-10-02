/**
 * Static world constants. Presentation-independent, no React, no DOM.
 */

export const TILE_SIZE = 64;

/** Visible playfield for the first slice: a compact 6x6 area around the hive. */
export const GRID_SIZE = 6;

/** The hive occupies exactly 2x2 tiles. */
export const HIVE_SIZE = 2;

/** Top-left tile of the hive inside the 6x6 grid. */
export const HIVE_ORIGIN = { x: 2, y: 2 };

/** Number of hand-drawn earth tile variations. */
export const EARTH_VARIANT_COUNT = 5;

/** Padding around the grid inside the SVG viewBox, so glows can bleed out. */
export const VIEW_PADDING = 44;

export const WORLD_WIDTH = GRID_SIZE * TILE_SIZE;
export const WORLD_HEIGHT = GRID_SIZE * TILE_SIZE;

export const VIEWBOX = {
  x: -VIEW_PADDING,
  y: -VIEW_PADDING,
  width: WORLD_WIDTH + VIEW_PADDING * 2,
  height: WORLD_HEIGHT + VIEW_PADDING * 2,
};

/** Ratio of a position given in tile units to the percentage of the rendered world box. */
export function tileUnitsToPercent(value) {
  return ((value * TILE_SIZE + VIEW_PADDING) / VIEWBOX.width) * 100;
}