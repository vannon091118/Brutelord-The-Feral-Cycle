/** Ergebnis des Abbaus: nutzbarer Boden, exakt ein Feld, Bau-HUD. */
import { DUNGLING_STATE } from '../../src/domain/entities/dungling.js';
import { ONBOARDING_CONFIG } from '../../src/domain/onboarding/onboarding-config.js';
import { ONBOARDING_STATE } from '../../src/domain/onboarding/onboarding-state.js';
import { checkMinedTile } from './check-mined-tile.mjs';
import { check, section } from './expect.mjs';
import { checkNextMine } from './check-next-mine.mjs';

function checkHudAndWorker(state) {
  const target = ONBOARDING_CONFIG.firstEarthBlock;
  check('Baumenü erst nach freiem Boden', state.buildMenuVisible && state.onboarding.state === ONBOARDING_STATE.BUILD_MENU_VISIBLE);
  check(
    'Dungling wartet auf neuem Boden',
    state.dunglings[0].state === DUNGLING_STATE.IDLE &&
      state.dunglings[0].tile.x === target.x &&
      state.dunglings[0].tile.y === target.y,
  );
}

export function checkMiningResult(run) {
  section('Freier Boden und Grid-Ausbau');
  checkMinedTile(run.state, run.targetTileId, run.earthBefore);
  checkHudAndWorker(run.state);
  check('Grid-Aufbau folgt der konfigurierten Pause', run.reachedAt.get(ONBOARDING_STATE.BUILD_MENU_VISIBLE) - run.reachedAt.get(ONBOARDING_STATE.TILE_DESTROYED) === ONBOARDING_CONFIG.tileDestructionMs + ONBOARDING_CONFIG.gridExpansionMs);
  checkNextMine(run.state);
}
