/** Die Vertikalitaet im Spiel: eine Ebene ist eine Funktion aus Spielerseed und
 *  Tiefe. Tiefe 0 ist die Startwelt, der Sprung ersetzt das Gestein und laesst die
 *  Kolonie stehen, ein Sprung ohne Ziel bewegt gar nichts. */
import { DEEPEST_FLOOR, canDescend, createFloorWorld, floorSeed, isFloorTarget } from '../../src/domain/world/floor.js';
import { ACTION } from '../../src/domain/actions/action-types.js';
import { createInitialGameState } from '../../src/state/game-state.js';
import { gameReducer } from '../../src/state/game-reducer.js';
import { isSavedShape, packState, unpackState } from '../../src/state/snapshot.js';
import { SAMPLE_SEEDS, istAndereWelt, istStartwelt, mitSchacht, nutzbarerRaum, seedsOfTiefen } from './floor-sample.js';
import { check, section } from './expect.mjs';

/** Ein Stand, wie ihn die Fassung vor den Etagen geschrieben hat: Tiefe fehlt. */
function altesFormat(state) {
  const { depth, ...ohne } = state.world;
  return { ...state, world: ohne };
}

function checkSeeds() {
  section('Etagen: der Seed ist eine Funktion aus Spielerseed und Tiefe');
  check('Tiefe 0 ist die Startwelt', SAMPLE_SEEDS.every(istStartwelt));
  check('Die Welt unten enthaelt nicht die Welt oben', SAMPLE_SEEDS.every(istAndereWelt));
  const alle = seedsOfTiefen();
  check('Jede Tiefe hat einen eigenen Seed', new Set(alle).size === alle.length, `${alle.length} Seeds, ${new Set(alle).size} verschieden`);
  check('Gleicher Seed, gleiche Tiefe, gleiche Welt', floorSeed('a1b2c3d4', 3) === floorSeed('a1b2c3d4', 3));
  check('Die Tiefe wandert in die Welt hinein', createFloorWorld('a1b2c3d4', 4).depth === 4);
}

function checkSprung() {
  section('Etagensprung: das Gestein ist neu, die Kolonie bleibt');
  const start = mitSchacht(createInitialGameState('a1b2c3d4'));
  const tief = gameReducer(start, { type: ACTION.FLOOR_DESCEND });

  check('Der Sprung geht nach unten', tief.world.depth === start.world.depth + 1, `Tiefe ${tief.world.depth}`);
  check('Die Welt ist eine andere', tief.world.seed !== start.world.seed, `Seed ${tief.world.seed}`);
  check('Der Spielerseed bleibt eine Eingabe', tief.playerseed === start.playerseed);
  check('Essenz und Dunglinge ueberleben den Sprung', tief.essence === start.essence && tief.dunglings.length === start.dunglings.length);
  check('Der Abbau der alten Etage wird verworfen', tief.mining === null);
  check('Der Raum wird neu gezaehlt', tief.usableTileCount === nutzbarerRaum(tief.world), `Raum ${tief.usableTileCount}`);
  check('Ein zweiter Sprung geht weiter, nicht zurueck', gameReducer(tief, { type: ACTION.FLOOR_DESCEND }).world.depth === 2);
}

function checkFailClosed() {
  section('Fail closed: ein Sprung ohne Ziel bewegt nichts');
  const start = mitSchacht(createInitialGameState('a1b2c3d4'));
  check('Die tiefste Etage hat keine untere mehr', !canDescend(DEEPEST_FLOOR));
  check('Eine negative Tiefe kann nicht absteigen', !canDescend(-1));
  check('Text ist keine Tiefe', !canDescend('1'));
  check('Ohne Zahl kann nicht abgestiegen werden', !canDescend(undefined));
  check('Ein Sprung in die Hoehe ist kein Sprung', !isFloorTarget(0, -1) && !isFloorTarget(3, 3));
  check('Eine fremde Aktion aendert nichts', gameReducer(start, { type: 'ETWAS_ANDERES' }) === start);

  let amEnde = start;
  for (let schritt = 0; schritt < DEEPEST_FLOOR + 5; schritt += 1) amEnde = gameReducer(amEnde, { type: ACTION.FLOOR_DESCEND });
  check('Der Sprung endet an der Grenze', amEnde.world.depth === DEEPEST_FLOOR, `Tiefe ${amEnde.world.depth}`);
  check('An der Grenze passiert nichts mehr', gameReducer(amEnde, { type: ACTION.FLOOR_DESCEND }) === amEnde);
}

function checkSpeichern() {
  section('Speichern: die Tiefe reist mit');
  const tief = gameReducer(mitSchacht(createInitialGameState('a1b2c3d4')), { type: ACTION.FLOOR_DESCEND });
  const gepackt = packState(tief);
  check('Die Tiefe ueberlebt das Speichern', unpackState(gepackt).world.depth === 1);
  check('Der Etagen-Raster kommt identisch zurueck', JSON.stringify(unpackState(gepackt).world.tiles) === JSON.stringify(tief.world.tiles));
  check('Eine frische Etage weicht nicht vom Seed ab', Object.keys(gepackt.world.tiles).length === 0);
  check('Ein Stand mit Tiefe wird angenommen', isSavedShape(gepackt));
  check('Ein Spielstand aus der Zeit ohne Etagen fliegt raus', !isSavedShape(altesFormat(gepackt)), 'sonst laedt ein alter Stand eine Ebene ohne Tiefe');
}

export function checkVerticality() {
  checkSeeds();
  checkSprung();
  checkFailClosed();
  checkSpeichern();
}
