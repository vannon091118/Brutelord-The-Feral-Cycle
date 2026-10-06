/** Die Leiter bei 47,47 ist der Eingang der Etage: sie steht in jeder Etage an
 *  denselben Koordinaten, sie traegt keinen Vorrat, und sie liegt unter
 *  Gestein — wer hinunter will, graebt sie frei. */
import { LADDER_TILE } from '../../src/domain/world/world-config.js';
import { createWorld, getTile } from '../../src/domain/world/grid.js';
import { createFloorWorld, DEEPEST_FLOOR } from '../../src/domain/world/floor.js';
import { FLOOR_ORIGIN, TILE_KIND, isEarth, isUsable, tileId } from '../../src/domain/world/tile.js';
import { mineTile } from '../../src/domain/actions/mining.js';
import { check, section } from './expect.mjs';

const SEED = 'a1b2c3d4';
const LEITER = tileId(LADDER_TILE.x, LADDER_TILE.y);

function etagen() {
  const liste = [];
  for (let depth = 0; depth <= DEEPEST_FLOOR; depth += 1) liste.push({ depth, world: createFloorWorld(SEED, depth) });
  return liste;
}

function checkEingang() {
  section('Leiter: der Eingang steht in jeder Etage');
  const alle = etagen();
  check('Die Leiter steht auf den Koordinaten der Config',
    alle.every(({ world }) => world.entrance.x === LADDER_TILE.x && world.entrance.y === LADDER_TILE.y), LEITER);
  check('Jede Etage traegt die Leiter an derselben Stelle',
    alle.every(({ world }) => tileId(world.entrance.x, world.entrance.y) === LEITER));
  check('Auf der Leiter liegt in keiner Etage ein Vorrat',
    alle.every(({ world }) => getTile(world, LEITER).depositId === undefined), `Etage ${alle.length - 1}`);
  check('Der Eingang liegt unter Gestein und wird nicht geschenkt',
    alle.every(({ world }) => isEarth(getTile(world, LEITER)) && !isUsable(getTile(world, LEITER))), LEITER);
}

function checkGraben() {
  section('Leiter: der Eingang wird gegraben und fuehrt hinunter');
  const flach = createFloorWorld(SEED, 0);
  const offen = mineTile(flach, getTile(flach, LEITER));
  const stelle = getTile(offen, LEITER);
  check('Ein gegrabener Eingang ist begehbarer Boden', isUsable(stelle) && stelle.kind === TILE_KIND.DUNGEON_FLOOR);
  check('Der gegrabene Eingang traegt keinen Vorrat', stelle.depositId === undefined);
  check('Der gegrabene Eingang ist ein gegrabenes Feld', stelle.floorOrigin === FLOOR_ORIGIN.MINED);
  check('Das Graben der Leiter laesst die uebrigen Felder stehen',
    getTile(offen, tileId(LEITER.split(',')[0] - 1, LEITER.split(',')[1])).kind === TILE_KIND.EARTH);
}

function checkStartwelt() {
  section('Leiter: die erste Etage bleibt, wie sie war');
  const start = createWorld({ playerseed: SEED });
  const etage = createFloorWorld(SEED, 0);
  check('Die erste Etage ist dieselbe Welt wie ohne Tiefe',
    start.seed === etage.seed && JSON.stringify(start.deposits) === JSON.stringify(etage.deposits));
  check('Die Leiter liegt auch dort unter Gestein', isEarth(getTile(start, LEITER)));
}

export function checkLadder() {
  checkEingang();
  checkGraben();
  checkStartwelt();
}
