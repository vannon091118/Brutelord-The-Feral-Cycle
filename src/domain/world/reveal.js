/** Die Sonde des Hive: Sichtbarkeit folgt dem gewachsenen Raum. */
import { REVEAL_RADIUS } from './world-config.js';
import { TILE_VISIBILITY, isVisible, tileId } from './tile.js';
import { getTile, isInsideGrid, replaceTile } from './grid.js';

function wobbleAt(x, y) {
  const hash = Math.imul(x + 7919, 73856093) ^ Math.imul(y + 104729, 19349663);
  return Math.abs(hash) % 2;
}

export function areaIds(world, { x, y }) {
  const outer = REVEAL_RADIUS + 1;
  const ids = [];
  for (let dy = -outer; dy <= outer; dy += 1) {
    for (let dx = -outer; dx <= outer; dx += 1) {
      const reach = Math.max(Math.abs(dx), Math.abs(dy));
      const reached = reach <= REVEAL_RADIUS || (reach === outer && wobbleAt(x + dx, y + dy) === 1);
      if (reached && isInsideGrid(world, x + dx, y + dy)) ids.push(tileId(x + dx, y + dy));
    }
  }
  return ids;
}

function revealed(world, ids) {
  let next = world;
  for (const id of ids) {
    const tile = getTile(next, id);
    if (tile && !isVisible(tile)) next = replaceTile(next, { ...tile, visibility: TILE_VISIBILITY.VISIBLE });
  }
  return next;
}

export function revealWorld(world, anchors) {
  const ids = anchors.flatMap(({ x, y }) => areaIds(world, { x, y }));
  return revealed(world, ids);
}

export function revealAround(world, tile) {
  return revealed(world, areaIds(world, tile));
}
