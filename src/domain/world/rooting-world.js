/**
 * Die Verwurzelung auf Weltebene. Was der Hive abbaut, nimmt er ein: erst
 * färbt sich das Feld, dann ruht es, und danach stoßen die Tentakel in alle
 * benachbarten Felder. Diese Wege legen die Wurzeln frei, die den Raum
 * sondieren — deshalb wird dabei auch sichtbar, was sie erreichen.
 */
import { allTiles, getTile, neighborIds, replaceTile } from './grid.js';
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

/** Die Tentakel stoßen in alle Nachbarfelder, die noch nicht beansprucht sind. */
export function spreadToNeighbors(world, ids) {
  let next = world;
  for (const id of ids) {
    const anchor = getTile(next, id);
    if (!anchor) continue;
    next = revealAround(next, anchor);
    for (const neighborId of neighborIds(next, id)) {
      const neighbor = getTile(next, neighborId);
      if (neighbor && neighbor.rooting.phase === ROOTING_PHASE.DARK) {
        next = replaceTile(next, { ...neighbor, rooting: createRooting(ROOTING_PHASE.GROWING) });
      }
    }
  }
  return next;
}

/** Gibt es noch Felder, die wachsen oder ruhen? Steuert die Sim-Uhr. */
export function worldHasRootingWork(world) {
  return allTiles(world).some((tile) => isRootingBusy(tile.rooting));
}