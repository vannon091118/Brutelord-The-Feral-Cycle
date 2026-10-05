/**
 * Der Treffer-Juice: Blockfeder und Kameraruck haengen am Abbau-Tick, nicht an
 * der Uhr und nicht am Ausschnitt. SETTLED wird heute nur geschrieben.
 */
import { readFileSync } from 'node:fs';
import { HIVE_PHASE, canMutate } from '../../src/domain/entities/hive.js';
import { MINING_PHASE } from '../../src/domain/actions/mining.js';
import { ACTION } from '../../src/domain/actions/action-types.js';
import { reduceHive } from '../../src/state/reducers/hive-reducer.js';
import { worldView } from '../../src/world/world-view.js';
import { check, section } from './expect.mjs';

const TILE = '40,40';

function source(path) {
  return readFileSync(path, 'utf8');
}

function checkSettled(game) {
  const settled = reduceHive(game, { type: ACTION.HIVE_MUTATION_SETTLED });
  const mutated = reduceHive(settled, { type: ACTION.HIVE_MUTATION_SETTLED });
  section('Hive: SETTLED ist eine Luecke, kein toter Code');
  check('Die Mutation endet in SETTLED', settled.hive.phase === HIVE_PHASE.SETTLED, settled.hive.phase);
  check('Ein zweites Mal aendert nichts', mutated.hive.phase === HIVE_PHASE.SETTLED);
  check('SETTLED sperrt die Mutation', !canMutate(settled.hive));
}

/** Der Block federt zurueck und die Kamera zuckt — beides muss im Markup stehen. */
function checkWiring() {
  const tile = source('src/world/EarthTile.jsx');
  const world = source('src/world/DungeonWorld.jsx');
  const css = source('src/styles/globals.css');
  section('Treffer-Juice: der Ruck ist verdrahtet');
  check('Der arbeitende Block traegt die Feder', /working\s*\?\s*'dl-anim dl-hit-punch'/.test(tile));
  check('Die Feder folgt dem Schritt', /key=\{working \? `mass-\$\{step\}` : 'mass'\}/.test(tile), 'Key ohne Schritt = Animation startet nur einmal');
  check('Die Kamera traegt den Ruck', world.includes('dl-camera-kick'));
  check('Der Ruck sitzt nicht auf dem viewBox', /viewBox: `\$\{camera\.x\}/.test(world) && !/viewBox:[^,]*kick/.test(world));
  check('Beide Bewegungen sind als Keyframe hinterlegt', css.includes('@keyframes dl-hit-punch') && css.includes('@keyframes dl-camera-kick'));
}

function playing(game, step) {
  return {
    ...game,
    selectedTileId: null,
    highlightedTileId: null,
    mining: { tileId: TILE, workerId: 'dungling-1', tick: step, progress: step / 10, phase: MINING_PHASE.WORKING },
  };
}

export function checkHitJuice(game) {
  const still = worldView({ game });
  const view = worldView({ game: playing(game, 4) });
  section('Treffer-Juice: der Ruck haengt am Tick');
  check('Ein arbeitendes Feld traegt seinen Schritt', view.workingTileId === TILE && view.workingStep === 4, `Feld ${view.workingTileId} Schritt ${view.workingStep}`);
  check('Der Schritt wandert mit dem Takt', worldView({ game: playing(game, 5) }).workingStep === 5);
  check('Ohne Abbau zuckt nichts', still.workingTileId === null && still.workingStep === 0, `Feld ${still.workingTileId} Schritt ${still.workingStep}`);
  check('Der Ruck verschiebt den Ausschnitt nicht', JSON.stringify(view.camera) === JSON.stringify(still.camera), `Kamera ${view.camera.x},${view.camera.y}`);
  check('Die Kamera folgt allein dem gebauten Raum', JSON.stringify(still.camera) === JSON.stringify(worldView({ game: { ...game, mining: null } }).camera));
  checkSettled({ ...game, hive: { ...game.hive, phase: HIVE_PHASE.MUTATING } });
  checkWiring();
}