/** Verwurzelung auf Weltebene: wachsen, ruhen, nur abgebauten Boden beanspruchen. */
import { getTile, neighborIds, replaceTile } from './grid.js';
import { TILE_KIND } from './tile.js';
import { ROOTING_PHASE, advanceRooting, beginRooting, createRooting, isRootingBusy } from './rooting.js';
import { ROOTING_CONFIG } from './rooting-config.js';
import { ACTION } from '../actions/action-types.js';
import { revealAround } from './reveal.js';
import { hintAround } from '../deposits/deposit-hint.js';

export function startRooting(world, tile) {
  if (isRootingBusy(tile.rooting)) return world;
  return {
    ...replaceTile(world, { ...tile, rooting: beginRooting() }),
    rootingWorkIds: [...world.rootingWorkIds, tile.id],
  };
}

function stepTile(world, id, dtMs) {
  const tile = getTile(world, id);
  if (!tile) return { world, spread: false };
  const { rooting, spread } = advanceRooting(tile.rooting, dtMs);
  if (rooting === tile.rooting && !spread) return { world, spread: false };
  return { world: replaceTile(world, { ...tile, rooting }), spread };
}

export function tickRooting(world, dtMs = ROOTING_CONFIG.tickMs) {
  const updates = {};
  const active = [];
  const spreading = [];
  for (const id of world.rootingWorkIds) {
    const tile = getTile(world, id);
    if (!tile) continue;
    const step = advanceRooting(tile.rooting, dtMs);
    if (step.rooting !== tile.rooting) updates[id] = { ...tile, rooting: step.rooting };
    if (step.spread) spreading.push(id);
    else if (isRootingBusy(step.rooting)) active.push(id);
  }
  const tiles = Object.keys(updates).length ? { ...world.tiles, ...updates } : world.tiles;
  const unchanged = tiles === world.tiles && active.length === world.rootingWorkIds.length;
  return {
    world: unchanged ? world : { ...world, tiles, rootingWorkIds: active },
    spreading,
  };
}

export function rootingWorkCount(world) {
  return world.rootingWorkIds.length;
}

export function spreadToNeighbors(world, ids) {
  let next = world;
  const activeIds = new Set(world.rootingWorkIds);
  for (const id of ids) {
    const anchor = getTile(next, id);
    if (!anchor) continue;
    next = revealAround(next, anchor);
    next = hintAround(next, anchor);
    for (const neighborId of neighborIds(next, id)) {
      const neighbor = getTile(next, neighborId);
      if (neighbor && isClaimable(neighbor)) {
        next = replaceTile(next, { ...neighbor, rooting: createRooting(ROOTING_PHASE.GROWING) });
        activeIds.add(neighborId);
      }
    }
  }
  return { ...next, rootingWorkIds: [...activeIds] };
}

function isClaimable(tile) {
  return tile.kind === TILE_KIND.DUNGEON_FLOOR && tile.rooting.phase === ROOTING_PHASE.DARK;
}
