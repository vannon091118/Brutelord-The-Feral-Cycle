/**
 * Die Verwurzelung auf Weltebene. Was der Hive abbaut, nimmt er ein: erst
 * färbt sich das Feld, dann ruht es, und danach stoßen die Tentakel in die
 * Nachbarfelder.
 *
 * Beansprucht wird dabei ausschließlich abgebauter Boden. Unberührte Erde
 * gehört dem Hive nicht — sie wird von der Sonde nur sichtbar gemacht, nie
 * eingenommen.
 */
import { allTiles, getTile, neighborIds, replaceTile } from './grid.js';
import { TILE_KIND } from './tile.js';
import { ROOTING_PHASE, advanceRooting, beginRooting, createRooting, isRootingBusy } from './rooting.js';
import { ROOTING_CONFIG } from './rooting-config.js';
import { revealAround } from './reveal.js';

/** Ein einzelnes Feld beginnt zu wachsen. */
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

/** Ein Takt für die ganze Welt. */
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

/**
 * Die Tentakel stoßen in die Nachbarfelder. Sichtbar wird dabei der Raum um
 * das beanspruchte Feld; eingenommen wird nur, was schon abgebaut ist.
 */
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

/** Eingenommen wird nur abgebauter Boden, der noch nichts vom Hive weiß. */
function isClaimable(tile) {
  return tile.kind === TILE_KIND.DUNGEON_FLOOR && tile.rooting.phase === ROOTING_PHASE.DARK;
}

/** Gibt es noch Felder, die wachsen oder ruhen? Steuert die Sim-Uhr. */
export function worldHasRootingWork(world) {
  return allTiles(world).some((tile) => isRootingBusy(tile.rooting));
}