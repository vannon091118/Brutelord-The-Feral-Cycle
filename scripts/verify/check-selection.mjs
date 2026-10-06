/** Der Auswahlweg als eigener Pfad: welche Kachel sich waehlen laesst, wann das
 *  Menue aufgeht, wohin der Phasenzeiger danach faellt und wie die Oberflaeche
 *  ihn ausloest. Fuer die Verdrahtung wird der Quelltext gelesen — Node klickt
 *  nicht, und der Build sieht einen toten Handler nicht. */
import { readFileSync } from 'node:fs';
import { ACTION } from '../../src/domain/actions/action-types.js';
import { MINING_PHASE } from '../../src/domain/actions/mining.js';
import { ONBOARDING_STATE } from '../../src/domain/onboarding/onboarding-state.js';
import { createInitialGameState } from '../../src/state/game-state.js';
import { gameReducer } from '../../src/state/game-reducer.js';
import { check, section } from './expect.mjs';

const KETTE = [
  ACTION.HIVE_CLICKED,
  ACTION.HIVE_MUTATION_STARTED,
  ACTION.HIVE_MUTATION_SETTLED,
  ACTION.DUNGLING_SPAWNED,
  ACTION.DUNGLING_EMERGED,
  ACTION.DUNGLING_READY,
];

function bisAuswahl() {
  let state = createInitialGameState('a1b2c3d4');
  for (const type of KETTE) state = gameReducer(state, { type });
  return state;
}

function mitBauMenu(base) {
  return {
    ...base,
    buildMenuVisible: true,
    onboarding: {
      state: ONBOARDING_STATE.BUILD_MENU_VISIBLE,
      trail: [...base.onboarding.trail, ONBOARDING_STATE.BUILD_MENU_VISIBLE],
    },
  };
}

function auswahlWeg() {
  section('Auswahl: welche Kachel, welches Menue, welche Phase');
  const initial = createInitialGameState('a1b2c3d4');
  const base = bisAuswahl();
  check('Der Auswahlstart ist erreicht', base.onboarding.state === ONBOARDING_STATE.TILE_SELECTION && Boolean(base.highlightedTileId), base.onboarding.state);
  check('Vor der Auswahlphase aendert Waehlen nichts', gameReducer(initial, { type: ACTION.TILE_SELECTED, tileId: '31,33' }) === initial);
  const gewaehlt = gameReducer(base, { type: ACTION.TILE_SELECTED, tileId: base.highlightedTileId });
  check('Eine erreichbare Kachel oeffnet das Aktionsmenue', gewaehlt.onboarding.state === ONBOARDING_STATE.ACTION_MENU && gewaehlt.selectedTileId === base.highlightedTileId);
  check('Ein Waehlen laesst kein Bauwerk ausgewaehlt', gewaehlt.selectedBuildingId === null);
  check('Ohne Kachel-ID aendert nichts', gameReducer(base, { type: ACTION.TILE_SELECTED, tileId: null }) === base);
  check('Eine unbekannte Kachel aendert nichts', gameReducer(base, { type: ACTION.TILE_SELECTED, tileId: '9999,9999' }) === base);
  check('Eine Kachel ohne Frontier aendert nichts', gameReducer(base, { type: ACTION.TILE_SELECTED, tileId: '0,0' }) === base);
  check('Ohne Auswahl aendert das Leeren nichts', gameReducer(base, { type: ACTION.TILE_SELECTION_CLEARED }) === base);
  check('Nach der Auswahl faellt der Zeiger zurueck', gameReducer(gewaehlt, { type: ACTION.TILE_SELECTION_CLEARED }).onboarding.state === ONBOARDING_STATE.TILE_SELECTION);
}

function menuPhase() {
  section('Auswahl: das Menue ist eine Phase, kein Fortschritt');
  const base = mitBauMenu(bisAuswahl());
  const gewaehlt = gameReducer(base, { type: ACTION.TILE_SELECTED, tileId: base.highlightedTileId });
  check('Nach dem Bau-Menue oeffnet die Auswahl wieder das Aktionsmenue', gewaehlt.onboarding.state === ONBOARDING_STATE.ACTION_MENU, gewaehlt.onboarding.state);
  check('Das Leeren bringt den Bau-Zustand zurueck', gameReducer(gewaehlt, { type: ACTION.TILE_SELECTION_CLEARED }).onboarding.state === ONBOARDING_STATE.BUILD_MENU_VISIBLE);
  const imAbbau = { ...base, mining: { tileId: base.highlightedTileId, phase: MINING_PHASE.WORKING } };
  check('Waehrend eines Abbaus laesst sich nichts waehlen', gameReducer(imAbbau, { type: ACTION.TILE_SELECTED, tileId: base.highlightedTileId }) === imAbbau);
}

function verdrahtung() {
  section('Auswahl: die Wege in der Oberflaeche');
  const menu = readFileSync('src/ui/TileActionMenu.jsx', 'utf8');
  const stage = readFileSync('src/ui/GameStage.jsx', 'utf8');
  const world = readFileSync('src/world/DungeonWorld.jsx', 'utf8');
  check('Escape schliesst das Aktionsmenue', menu.includes("event.key === 'Escape'") && menu.includes('useEscapeKey'));
  check('Das Menue traegt Abbau und Schliessen', stage.includes('onMine={actions.orderMining}') && stage.includes('onClose={actions.clearSelection}'));
  check('Ein Klick auf den Hintergrund verwirft die Auswahl', world.includes('onBackgroundClick={actions.clearSelection}'));
}

export function checkSelection() {
  auswahlWeg();
  menuPhase();
  verdrahtung();
}
