/**
 * Welt-Konstanten. Reine Zahlen — keine React-, DOM- oder Stil-Abhängigkeit.
 *
 * Die Spielwelt ist ein direktes 2D-Vogelblick-Raster. Der Hive sitzt zentral,
 * die sichtbare Fläche beginnt mit zwei Tiles Abstand rundherum.
 */

/** Kantenlänge eines Tiles in CSS-Pixeln (Referenzgröße der Welt). */
export const TILE_SIZE = 64;

/** Sichtbare Fläche des ersten Slices: 6 x 6 Tiles. */
export const GRID_WIDTH = 6;
export const GRID_HEIGHT = 6;

/** Der Hive ist exakt 2 x 2 Tiles groß und sitzt zentral im Feld. */
export const HIVE_ORIGIN = Object.freeze({ x: 2, y: 2 });
export const HIVE_SIZE = Object.freeze({ width: 2, height: 2 });

/**
 * Die Welt endet nicht hart am Raster: außen liegt unbearbeitete Erde
 * (Rendering-Rahmen), damit die Fläche wie ein Ausschnitt einer Welt wirkt.
 * In Tiles gemessen.
 */
export const WORLD_BLEED_TILES = 0.75;

/** Grenzen für die Skalierung auf kleinen Bildschirmen (Tiles werden ~48–56px). */
export const MIN_WORLD_SCALE = 0.62;
export const MAX_WORLD_SCALE = 1;

export function worldPixelSize(tileSize = TILE_SIZE) {
  const bleed = WORLD_BLEED_TILES * tileSize;
  return {
    width: GRID_WIDTH * tileSize + bleed * 2,
    height: GRID_HEIGHT * tileSize + bleed * 2,
    bleed,
  };
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Wie stark die komplette Welt skaliert wird, damit sie in den Viewport passt.
 * Auf Desktop bleibt sie bei 1 (Tiles = 64px), auf schmalen Geräten schrumpft
 * sie proportional — die Tiles landen dann im Bereich von etwa 48–56px.
 */
export function computeWorldScale({ availableWidth, availableHeight, tileSize = TILE_SIZE }) {
  const world = worldPixelSize(tileSize);
  if (!availableWidth || !availableHeight) return MAX_WORLD_SCALE;
  const raw = Math.min(availableWidth / world.width, availableHeight / world.height);
  return clamp(raw, MIN_WORLD_SCALE, MAX_WORLD_SCALE);
}
