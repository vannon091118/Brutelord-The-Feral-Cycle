/** Das Tor zur Tiefe: Der Leiterschacht ist ein Bauobjekt. Ohne ihn gibt es
 *  keinen Raid und keine zweite Etage; steht er, ist die erste Etage frei, und
 *  jede weitere kostet Blutstein. */
import { ACTION } from '../../src/domain/actions/action-types.js';
import { BUILDING_STATE, BUILDING_TYPE } from '../../src/domain/buildings/building-config.js';
import { createCycle, descendOpen, ladderOpen } from '../../src/domain/economy/resource-cycle.js';
import { createWorld } from '../../src/domain/world/grid.js';
import { reduceFloor } from '../../src/state/reducers/floor-reducer.js';
import { check, section } from './expect.mjs';

const SEED = 'a1b2c3d4';

function schacht(state = BUILDING_STATE.READY) {
  return [{ id: 'building-1', type: BUILDING_TYPE.LADDER_SHAFT, state, tileIds: ['30,30'], workers: [] }];
}

function basisState(buildings = []) {
  return {
    world: createWorld({ playerseed: SEED }),
    playerseed: SEED,
    essence: 0,
    economy: createCycle(),
    buildings,
    mining: null,
    expansion: null,
    lastDestroyedTileId: null,
    selectedTileId: null,
    highlightedTileId: null,
    usableTileCount: 12,
  };
}

function checkTor() {
  section('Leiterschacht: das Tor zur Tiefe');
  check('Ohne Schacht ist die Leiter zu', !ladderOpen([]));
  check('Ein Bauplatz oeffnet nichts', !ladderOpen(schacht(BUILDING_STATE.SITE)));
  check('Ein fertiger Schacht oeffnet die Leiter', ladderOpen(schacht()));
  check('Ohne Schacht ist kein Abstieg offen', !descendOpen({ depth: 0, cycle: createCycle(), buildings: [] }));
  check('Mit Schacht ist die erste Etage frei', descendOpen({ depth: 0, cycle: createCycle(), buildings: schacht() }));
}

function checkAbstieg() {
  section('Leiterschacht: erst schenkt er die Etage, dann kostet sie');
  const ohne = reduceFloor(basisState([]), { type: ACTION.FLOOR_DESCEND });
  check('Ohne Schacht bewegt der Abstieg nichts', ohne.world.depth === 0, `Etage ${ohne.world.depth}`);
  const mit = reduceFloor(basisState(schacht()), { type: ACTION.FLOOR_DESCEND });
  check('Mit Schacht geht der Abstieg in die zweite Etage', mit.world.depth === 1, `Etage ${mit.world.depth}`);
  const leer = basisState(schacht());
  const tief = { ...leer, world: { ...leer.world, depth: 8 } };
  const zu = reduceFloor(tief, { type: ACTION.FLOOR_DESCEND });
  check('An der tiefsten freien Etage ohne Blutstein bleibt es stehen', zu.world.depth === 8, `Etage ${zu.world.depth}`);
}

export function checkLadderShaft() {
  checkTor();
  checkAbstieg();
}
