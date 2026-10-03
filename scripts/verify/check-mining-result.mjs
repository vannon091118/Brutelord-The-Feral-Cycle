/** Ergebnis des Abbaus: nutzbarer Boden, exakt ein Feld, Bau-HUD. */
import { DUNGLING_STATE } from '../../src/domain/entities/dungling.js';
import { ONBOARDING_CONFIG } from '../../src/domain/onboarding/onboarding-config.js';
import { ONBOARDING_STATE } from '../../src/domain/onboarding/onboarding-state.js';
import { checkMinedTile } from './check-mined-tile.mjs';
import { check, section } from './expect.mjs';
import { checkNextMine } from './check-next-mine.mjs';

function checkHudAndWorker(state) {
  check('Baumenü erst nach freiem Boden', state.buildMenuVisible && state.onboarding.state === ONBOARDING_STATE.BUILD_MENU_VISIBLE);
  check('Dungling wartet auf neuem Boden', state.dungling.state === DUNGLING_STATE.IDLE && state.dungling.tile.x === 3 && state.dungling.tile.y === 4);
}

export function checkMiningResult(run) {
  section('Freier Boden und Grid-Ausbau');
  checkMinedTile(run.state, run.targetTileId);
  checkHudAndWorker(run.state);
  check('Grid-Aufbau folgt der konfigurierten Pause', run.reachedAt.get(ONBOARDING_STATE.BUILD_MENU_VISIBLE) - run.reachedAt.get(ONBOARDING_STATE.TILE_DESTROYED) === ONBOARDING_CONFIG.tileDestructionMs + ONBOARDING_CONFIG.gridExpansionMs);
  checkNextMine(run.state);
}
