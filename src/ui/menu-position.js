/**
 * Bildschirmposition eines Tiles innerhalb der Bühne. Die Welt ist skaliert
 * und Ausschnitt, Menüs sind DOM und bleiben in echter Größe — deshalb wird
 * hier der Versatz des Kamerafensters herausgerechnet.
 */
import { parseTileId } from '../domain/world/tile.js';

export function menuPositionFor({ tileId, camera, scale, tileSize }) {
  const { x, y } = parseTileId(tileId);
  return {
    left: ((x + 0.5) * tileSize - camera.x) * scale,
    top: ((y + 0.5) * tileSize - camera.y) * scale - 8,
  };
}