// @doc: docs/daten/world/reveal.md#reveal
import { REVEAL_GUARANTEED, REVEAL_RADIUS } from './world-config.js';
import { TILE_VISIBILITY, isVisible, tileId } from './tile.js';
import { applyTiles, getTile, isInsideGrid, neighborIds } from './grid.js';

function wobbleAt(x, y, seed) {
  let h = Math.imul(x + 7919, 73856093) ^ Math.imul(y + 104729, 19349663) ^ Math.imul(seed + 1013904223, 2246822519);
  h = Math.imul(h ^ (h >>> 15), 2654435761);
  h ^= h >>> 12;
  return ((h >>> 8) & 255) / 256;
}

function areaIds(world, { x, y }) {
  const outer = REVEAL_RADIUS + 1;
  const ids = [];
  for (let dy = -outer; dy <= outer; dy += 1) {
    for (let dx = -outer; dx <= outer; dx += 1) {
      const reach = Math.max(Math.abs(dx), Math.abs(dy));
      const reached = reach <= REVEAL_GUARANTEED || (reach <= outer && wobbleAt(x + dx, y + dy, world.seed) >= 0.5);
      if (reached && isInsideGrid(world, x + dx, y + dy)) ids.push(tileId(x + dx, y + dy));
    }
  }
  return ids;
}

function closureIds(world) {
  const { width, height, tiles } = world;
  const offen = new Uint8Array(width * height);
  for (let index = 0; index < tiles.length; index += 1) offen[index] = tiles[index] && isVisible(tiles[index]) ? 1 : 0;
  const ids = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      if (offen[index]) continue;
      const n = (y > 0 ? offen[index - width] : 0) + (x + 1 < width ? offen[index + 1] : 0)
        + (y + 1 < height ? offen[index + width] : 0) + (x > 0 ? offen[index - 1] : 0);
      if (n >= 3) ids.push(tileId(x, y));
    }
  }
  return ids;
}

function closeHoles(world) {
  let current = world;
  for (;;) {
    const updates = {};
    for (const id of closureIds(current)) {
      const tile = getTile(current, id);
      if (tile) updates[id] = { ...tile, visibility: TILE_VISIBILITY.VISIBLE };
    }
    if (Object.keys(updates).length === 0) return current;
    current = applyTiles(current, updates);
  }
}

function attached(world, updates) {
  const ids = Object.keys(updates);
  const kept = new Set(ids.filter((id) => neighborIds(world, id).some((side) => isVisible(getTile(world, side)))));
  const queue = [...kept];
  while (queue.length > 0) {
    for (const id of neighborIds(world, queue.pop())) {
      if (updates[id] && !kept.has(id)) {
        kept.add(id);
        queue.push(id);
      }
    }
  }
  const grown = {};
  for (const id of ids) if (kept.has(id)) grown[id] = updates[id];
  return grown;
}

function revealed(world, ids) {
  const updates = {};
  let changed = 0;
  for (const id of ids) {
    const tile = getTile(world, id);
    if (!tile || isVisible(tile)) continue;
    updates[id] = { ...tile, visibility: TILE_VISIBILITY.VISIBLE };
    changed += 1;
  }
  if (changed === 0) return world;
  return closeHoles(applyTiles(world, attached(world, updates)));
}

export function revealWorld(world, anchors) {
  const ids = anchors.flatMap(({ x, y }) => areaIds(world, { x, y }));
  return revealed(world, ids);
}

export function revealAround(world, tile) {
  return revealed(world, areaIds(world, tile));
}
