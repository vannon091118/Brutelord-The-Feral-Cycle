/**
 * Welt-Konstanten. Reine Zahlen — keine React-, DOM- oder Stil-Abhängigkeit.
 *
 * Die Welt ist ein feines 2D-Raster, aber man sieht sie nie als Raster: der
 * Hive sitzt in einer verwurzelten Senke, das Sichtfeld ist eine Kamera, die
 * dem gebauten Raum folgt, und der Rest der Welt bleibt unerforschte Masse.
 */

/** Kantenlänge eines Tiles in CSS-Pixeln (Referenzgröße der Welt). */
export const TILE_SIZE = 64;

/**
 * Die Welt ist bewusst viel größer als das Sichtfeld. Das Raster ist nur die
 * Rechengrundlage — sichtbar wird immer nur ein Ausschnitt.
 */
export const GRID_WIDTH = 64;
export const GRID_HEIGHT = 64;

/** Der Hive ist exakt 2 x 2 Tiles groß und sitzt in der Mitte der Welt. */
export const HIVE_ORIGIN = Object.freeze({ x: 31, y: 31 });
export const HIVE_SIZE = Object.freeze({ width: 2, height: 2 });

/** Wie viele Tiles der Verwurzelung sichtbar sind (Chebyshev-Radius). */
export const REVEAL_RADIUS = 2;

/** Kantenlänge des Sichtfelds in Tiles. */
export const VIEW_TILES = 13;

/**
 * Die Leiter — der Eingang von draußen. Sie liegt weit außerhalb des
 * Sichtfelds und wird erst sichtbar, wenn die Verwurzelung herangewachsen ist.
 */
export const LADDER_TILE = Object.freeze({ x: 47, y: 47 });

/**
 * Die Welt endet nicht hart am Raster: außen liegt unbearbeitete Masse
 * (Rendering-Rahmen), damit der Ausschnitt nicht wie ein Kasten wirkt.
 */
export const WORLD_BLEED_TILES = 0.75;

/** Grenzen für die Skalierung des Sichtfelds auf kleinen Bildschirmen. */
export const MIN_WORLD_SCALE = 0.4;
export const MAX_WORLD_SCALE = 1;

/** Größe des kompletten Rasters in Pixeln. */
export function worldPixelSize(tileSize = TILE_SIZE) {
  const bleed = WORLD_BLEED_TILES * tileSize;
  return {
    width: GRID_WIDTH * tileSize + bleed * 2,
    height: GRID_HEIGHT * tileSize + bleed * 2,
    bleed,
  };
}

/** Größe des Sichtfelds in Pixeln — das ist die Bühne, nicht die Welt. */
export function viewportPixelSize(tileSize = TILE_SIZE) {
  const bleed = WORLD_BLEED_TILES * tileSize;
  return {
    width: VIEW_TILES * tileSize + bleed * 2,
    height: VIEW_TILES * tileSize + bleed * 2,
    bleed,
  };
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Wie stark das Sichtfeld skaliert wird, damit es in den Viewport passt.
 * Auf Desktop bleibt es bei 1 (Tiles = 64px), auf schmalen Geräten schrumpft
 * es proportional — die Tiles landen dann im Bereich von etwa 48–56px.
 */
export function computeWorldScale({ availableWidth, availableHeight, tileSize = TILE_SIZE }) {
  const view = viewportPixelSize(tileSize);
  if (!availableWidth || !availableHeight) return MAX_WORLD_SCALE;
  const raw = Math.min(availableWidth / view.width, availableHeight / view.height);
  return clamp(raw, MIN_WORLD_SCALE, MAX_WORLD_SCALE);
}

/** Liegt eine Kachelkoordinate im Sichtfeld-Fenster um den Mittelpunkt? */
export function isInsideView({ center, x, y }, tileSize = TILE_SIZE) {
  const half = (VIEW_TILES / 2) * tileSize;
  return (
    (x + 0.5) * tileSize >= center.x - half &&
    (x + 0.5) * tileSize < center.x + half &&
    (y + 0.5) * tileSize >= center.y - half &&
    (y + 0.5) * tileSize < center.y + half
  );
}