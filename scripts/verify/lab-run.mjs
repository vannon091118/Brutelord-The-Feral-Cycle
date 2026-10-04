/** Kolonien für die Laborprüfungen: bekannter Stein, offener Bauplatz, Mutant. */
import { BUILDING_STATE, BUILDING_TYPE } from '../../src/domain/buildings/building-config.js';
import { createBuildingSite } from '../../src/domain/buildings/building.js';
import { createDungling } from '../../src/domain/entities/dungling.js';
import { createLab, placeStone } from '../../src/domain/brutelord/lab-state.js';
import { createStone } from '../../src/domain/brutelord/stone-roll.js';
import { STONE_SLOT } from '../../src/domain/brutelord/stone-config.js';
import { createInitialGameState } from '../../src/state/game-state.js';

const ANCHOR = Object.freeze({ x: 4, y: 4 });
const LORD_ANCHOR = Object.freeze({ x: 20, y: 20 });

function readyBuilding(id, type, anchor) {
  const site = createBuildingSite({ id, type, anchor });
  return { ...site, state: BUILDING_STATE.READY, delivered: site.required };
}

function openSite(anchor) {
  return createBuildingSite({ id: 'building-3', type: BUILDING_TYPE.SWARM_HOST, anchor });
}

/** Ein Stein mit genau diesem Trait, in den Kopf verbaut. */
export function stoneWith(trait) {
  for (let seed = 1; seed < 4000; seed += 1) {
    const stone = createStone({ seed });
    if (stone.trait === trait) return placeStone({ ...createLab(), stones: [stone] }, stone.seed, STONE_SLOT.HEAD).stones[0];
  }
  throw new Error(`Kein Seed liefert den Trait ${trait}.`);
}

export function labState() {
  const game = createInitialGameState();
  return {
    ...game,
    essence: 40,
    buildings: [
      readyBuilding('building-1', BUILDING_TYPE.BRUTE_LORD, LORD_ANCHOR),
      readyBuilding('building-2', BUILDING_TYPE.ESSENCE_EXTRACTOR, { x: 12, y: 4 }),
    ],
    dunglings: [createDungling({ tile: ANCHOR, id: 'dungling-1' })],
    lab: createLab(),
  };
}

export function deliveryTo(anchor) {
  const base = labState();
  return { ...base, buildings: [...base.buildings, openSite(anchor)] };
}

/** Ein Zustand mit verbauten Steinen, ohne sie schon zu fusionieren. */
export function withStones(traits, anchor = null) {
  const base = anchor ? deliveryTo(anchor) : labState();
  const stones = traits.map(stoneWith);
  return { ...base, lab: { ...base.lab, stones, open: true } };
}

/** Ein Dungling mit genau einem Stein; ohne Trait bleibt er der Basisbau. */
export function mutantWorker(id, tile, trait) {
  return { ...createDungling({ tile, id }), stones: trait ? [stoneWith(trait)] : [] };
}