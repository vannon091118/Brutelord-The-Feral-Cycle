// @doc: docs/daten/ui/menu-position.md#menu-position
import { parseTileId } from '../domain/world/tile.js';
import { clamp } from '../domain/world/world-config.js';

export const MENU_BOX = Object.freeze({ width: 158, height: 142, gap: 8, edge: 6 });

export function menuAnchorFor({ tileId, camera, scale, tileSize, menu = MENU_BOX }) {
  const { x, y } = parseTileId(tileId);
  return {
    left: ((x + 0.5) * tileSize - camera.x) * scale,
    top: ((y + 0.5) * tileSize - camera.y) * scale - menu.gap,
  };
}

export function menuPositionFor({ anchor, bounds, menu = MENU_BOX }) {
  const half = menu.width / 2;
  const flipped = anchor.top - menu.height < menu.edge;
  return {
    left: clamp(anchor.left, half + menu.edge, bounds.width - half - menu.edge),
    top: clamp(
      flipped ? anchor.top + menu.gap * 2 + menu.height : anchor.top,
      menu.height + menu.edge,
      bounds.height - menu.edge,
    ),
    flipped,
  };
}
