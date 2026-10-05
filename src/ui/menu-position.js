// @doc: docs/daten/ui/menu-position.md#menu-position
import { parseTileId } from '../domain/world/tile.js';

export function menuPositionFor({ tileId, camera, scale, tileSize }) {
  const { x, y } = parseTileId(tileId);
  return {
    left: ((x + 0.5) * tileSize - camera.x) * scale,
    top: ((y + 0.5) * tileSize - camera.y) * scale - 8,
  };
}