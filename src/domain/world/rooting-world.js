/** Verwurzelung auf Weltebene: wachsen, ruhen, nur abgebauten Boden beanspruchen. */
import { applyTiles, getTile, neighborIds, replaceTile } from './grid.js';
import { TILE_KIND } from './tile.js';
import { ROOTING_PHASE, advanceRooting, beginRooting, createRooting, isRootingBusy } from './rooting.js';
import { ROOTING_CONFIG } from './rooting-config.js';
import { revealAround } from './reveal.js';
import { hintAround } from '../deposits/deposit-hint.js';

export function startRooting(world, tile) {
  if (isRootingBusy(tile.rooting)) return world;
  return {
    ...replaceTile(world, { ...tile, rooting: beginRooting() }),
    rootingWorkIds: [...world.rootingWorkIds, tile.id],
  };
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
  const next = applyTiles(world, updates);
  const unchanged = next === world && active.length === world.rootingWorkIds.length;
  return {
    world: unchanged ? world : { ...next, rootingWorkIds: active },
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
    const claims = claimsOf(next, id);
    for (const claimedId of Object.keys(claims)) activeIds.add(claimedId);
    next = applyTiles(next, claims);
  }
  return { ...next, rootingWorkIds: [...activeIds] };
}

function claimsOf(world, id) {
  const updates = {};
  for (const neighborId of neighborIds(world, id)) {
    const neighbor = getTile(world, neighborId);
    if (neighbor && isClaimable(neighbor)) {
      updates[neighborId] = { ...neighbor, rooting: createRooting(ROOTING_PHASE.GROWING) };
    }
  }
  return updates;
}

function isClaimable(tile) {
  return tile.kind === TILE_KIND.DUNGEON_FLOOR && tile.rooting.phase === ROOTING_PHASE.DARK;
}
