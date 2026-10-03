/**
 * Bildschirmposition eines Tiles innerhalb der Bühne. Die Welt ist skaliert,
 * Menüs sind DOM und bleiben in echter Größe — deshalb wird hier gerechnet.
 */
import { parseTileId } from '../domain/world/tile.js';

export function menuPositionFor({ tileId, size, scale, tileSize }) {
  const { x, y } = parseTileId(tileId);
  return {
    left: (size.bleed + (x + 0.5) * tileSize) * scale,
    top: (size.bleed + (y + 0.5) * tileSize) * scale - 8,
  };
}
