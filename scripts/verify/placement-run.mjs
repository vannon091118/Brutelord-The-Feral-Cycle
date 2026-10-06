/**
 * Der Bauplatz als Frage der Domaene: wo ein Bau dieser Groesse stehen darf,
 * und wenn nirgends, warum nicht. Gefragt wird das ganze Raster; das
 * Sichtfenster tritt daneben als Gegenprobe an.
 */
import { BUILDING_DEFS, BUILDING_TYPE } from '../../src/domain/buildings/building-config.js';
import { placementReport } from '../../src/domain/buildings/building.js';
import { canMineTile, mineTile } from '../../src/domain/actions/mining.js';
import { allTiles, applyTiles, createWorld, getTile, neighborIds } from '../../src/domain/world/grid.js';
import { createEarthTile, createFloorTile, isBuildable, tileId } from '../../src/domain/world/tile.js';
import { createInitialGameState } from '../../src/state/game-state.js';
import { worldView } from '../../src/world/world-view.js';

const LORD = BUILDING_TYPE.BRUTE_LORD;
const EXTRACTOR = BUILDING_TYPE.ESSENCE_EXTRACTOR;
const RAND = 3;

function report(world, type) {
  return placementReport({ world, buildings: [], type });
}

function cornerWorld() {
  const world = createWorld();
  const ecke = { x: world.width - RAND, y: world.height - RAND };
  const updates = {};
  for (let y = ecke.y; y < ecke.y + 2; y += 1) {
    for (let x = ecke.x; x < ecke.x + 2; x += 1) updates[tileId(x, y)] = createFloorTile(x, y);
  }
  return applyTiles(world, updates);
}

function floorlessWorld() {
  const world = createWorld();
  const updates = {};
  for (const tile of allTiles(world)) {
    if (isBuildable(tile)) updates[tile.id] = createEarthTile(tile.x, tile.y);
  }
  return applyTiles(world, updates);
}

function pairThatFits(world, type) {
  for (const first of allTiles(world)) {
    if (!canMineTile(world, first.id)) continue;
    const einmal = mineTile(world, first);
    for (const id of neighborIds(world, first.id)) {
      const second = getTile(world, id);
      if (!second || !canMineTile(einmal, id)) continue;
      const zweimal = mineTile(einmal, second);
      const treffer = report(zweimal, type);
      if (treffer.spots.length > 0) return { mines: [first.id, id], anchor: treffer.spots[0].id, world: zweimal };
    }
  }
  return null;
}

function oneMineIsEnough(world, type) {
  return allTiles(world).some((tile) => canMineTile(world, tile.id) && report(mineTile(world, tile), type).spots.length > 0);
}

function spotsInView(world, type) {
  const game = { ...createInitialGameState(), world, buildChoice: type };
  return worldView({ game }).buildSpots.length;
}

export function placementRun() {
  const start = createWorld();
  const corner = cornerWorld();
  const floorless = floorlessWorld();
  const lord = report(start, LORD);
  const klein = report(start, EXTRACTOR);
  const fern = report(corner, LORD);
  const ohne = report(floorless, LORD);
  const paar = pairThatFits(start, LORD);
  return {
    start: {
      frei: lord.free,
      spots: lord.spots.length,
      reason: lord.reason,
      one: klein.spots.length,
      inView: spotsInView(start, EXTRACTOR),
    },
    corner: { spots: fern.spots.length, anchor: fern.spots[0]?.id ?? null, inView: spotsInView(corner, LORD) },
    floorless: { frei: ohne.free, reason: ohne.reason },
    pair: paar && {
      mines: paar.mines,
      anchor: paar.anchor,
      state: { ...createInitialGameState(), world: paar.world, essence: BUILDING_DEFS[LORD].cost },
    },
    oneIsEnough: oneMineIsEnough(start, LORD),
  };
}
