/**
 * Der Bauplatz: wo ein Bau dieser Groesse stehen darf und wenn nirgends, warum
 * nicht. Das ist eine Regel der Domaene und keine der Darstellung: die Ansicht
 * zeigt nur, was sie bekommt, und das Baumenue nennt den Grund.
 */
import { readFileSync } from 'node:fs';
import { ACTION } from '../../src/domain/actions/action-types.js';
import {
  BUILDING_DEFS,
  BUILDING_TYPE,
  PLACEMENT_REASON,
} from '../../src/domain/buildings/building-config.js';
import { countFloorTiles, createWorld } from '../../src/domain/world/grid.js';
import { gameReducer } from '../../src/state/game-reducer.js';
import { placementRun } from './placement-run.mjs';
import { check, section } from './expect.mjs';

const LORD = BUILDING_TYPE.BRUTE_LORD;
const DEF = BUILDING_DEFS[LORD];

function checkStart(run) {
  section('Bauplatz: der Startraum traegt keinen 2x2');
  check('Der freie Boden ist der Burrow-Ring', run.start.frei === countFloorTiles(createWorld()), `${run.start.frei} Felder`);
  check('Jedes freie Feld ist ein 1x1-Bauplatz', run.start.one === run.start.frei);
  check('Kein 2x2 passt in den Startraum', run.start.spots === 0);
  check('Die Absage nennt den Grund statt zu schweigen', run.start.reason === PLACEMENT_REASON.NO_SPACE, String(run.start.reason));
  check('Eine einzelne Kachel schafft noch keinen 2x2', run.oneIsEnough === false);
}

function checkRaster(run) {
  section('Bauplatz: die Frage gilt dem Raster, nicht dem Fenster');
  check('Ein 2x2 in der fernen Ecke wird gefunden', run.corner.spots === 1, `${run.corner.spots} Plaetze, ${run.corner.anchor}`);
  check('Das Sichtfenster zeigt diesen Platz nicht', run.corner.inView === 0);
  check('Das Fenster zeigt, was die Domaene findet', run.start.inView === run.start.one, `${run.start.inView} von ${run.start.one}`);
}

function checkGruende(run) {
  section('Bauplatz: zwei Absagen sind zwei verschiedene Gruende');
  check('Ohne freien Boden heisst der Grund NO_FLOOR', run.floorless.reason === PLACEMENT_REASON.NO_FLOOR && run.floorless.frei === 0, String(run.floorless.reason));
  check('Mit freiem Boden, aber ohne Flaeche, heisst er NO_SPACE', run.start.reason !== run.floorless.reason);
}

function checkBau(run) {
  section('Bauplatz: zwei Abbaue in der Ecke machen den Brutlord baubar');
  const paar = run.pair;
  const offen = check('Zwei Felder nebeneinander oeffnen den 2x2', paar?.mines.length === 2, paar ? paar.mines.join(' | ') : 'kein Paar gefunden');
  if (!offen) return;
  const gewaehlt = gameReducer(paar.state, { type: ACTION.BUILD_CHOSEN, buildingType: LORD });
  const gebaut = gameReducer(gewaehlt, { type: ACTION.BUILDING_PLACED, tileId: paar.anchor });
  check('Der Reducer baut den Brutlord auf dem gefundenen Platz', gebaut.buildings.length === 1, `${gebaut.buildings.length} Bauwerke`);
  check('Der Bauplatz traegt genau die Grundflaeche', gebaut.buildings[0]?.tileIds.length === DEF.width * DEF.height);
}

function checkVerdrahtung() {
  section('Bauplatz: die Regel liegt in der Domaene');
  const layer = readFileSync('src/world/buildings/BuildingLayer.jsx', 'utf8');
  const menu = readFileSync('src/ui/BuildMenu.jsx', 'utf8');
  const hud = readFileSync('src/ui/GameHud.jsx', 'utf8');
  check('Die Ansicht prueft keinen Bauplatz mehr', !layer.includes('canPlaceBuilding') && layer.includes('view.buildSpots'));
  check('Das Baumenue nennt den Grund aus der Domaene', menu.includes('PLACEMENT_REASON') && menu.includes('placement.reason'));
  check('Das HUD holt den Bauplatz aus dem Selektor', hud.includes('selectPlacement'));
}

export function checkPlacement() {
  const run = placementRun();
  checkStart(run);
  checkRaster(run);
  checkGruende(run);
  checkBau(run);
  checkVerdrahtung();
}
