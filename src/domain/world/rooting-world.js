/** Verwurzelung auf Weltebene: wachsen, ruhen, nur abgebauten Boden beanspruchen. */
import { allTiles, getTile, neighborIds, replaceTile } from './grid.js';
import { TILE_KIND } from './tile.js';
import { ROOTING_PHASE, advanceRooting, beginRooting, createRooting, isRootingBusy } from './rooting.js';
import { ROOTING_CONFIG } from './rooting-config.js';
import { revealAround } from './reveal.js';

export function startRooting(world, tile) {
  return replaceTile(world, { ...tile, rooting: beginRooting() });
}

function stepTile(world, id, dtMs) {
  const tile = getTile(world, id);
  if (!tile) return { world, spread: false };
  const { rooting, spread } = advanceRooting(tile.rooting, dtMs);
  if (rooting === tile.rooting && !spread) return { world, spread: false };
  return { world: replaceTile(world, { ...tile, rooting }), spread };
}

export function tickRooting(world, dtMs = ROOTING_CONFIG.tickMs) {
  let next = world;
  const spreading = [];
  for (const tile of allTiles(world)) {
    const step = stepTile(next, tile.id, dtMs);
    next = step.world;
    if (step.spread) spreading.push(tile.id);
  }
  return { world: next, spreading };
}

export function spreadToNeighbors(world, ids) {
  let next = world;
  for (const id of ids) {
    const anchor = getTile(next, id);
    if (!anchor) continue;
    next = revealAround(next, anchor);
    for (const neighborId of neighborIds(next, id)) {
      const neighbor = getTile(next, neighborId);
      if (neighbor && isClaimable(neighbor)) {
        next = replaceTile(next, { ...neighbor, rooting: createRooting(ROOTING_PHASE.GROWING) });
      }
    }
  }
  return next;
}

function isClaimable(tile) {
  return tile.kind === TILE_KIND.DUNGEON_FLOOR && tile.rooting.phase === ROOTING_PHASE.DARK;
}

export function worldHasRootingWork(world) {
  return allTiles(world).some((tile) => isRootingBusy(tile.rooting));
}
