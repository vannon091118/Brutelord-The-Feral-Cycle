/** Prüft den Zeitplan, die Onboarding-Kette und Dungling-Zustände. */
import { DUNGLING_STATE } from '../../src/domain/entities/dungling.js';
import { ONBOARDING_CONFIG } from '../../src/domain/onboarding/onboarding-config.js';
import { ONBOARDING_ORDER, ONBOARDING_STATE } from '../../src/domain/onboarding/onboarding-state.js';
import { check, section } from './expect.mjs';
import { runSlice } from './run-slice.mjs';

export function checkOnboarding(run) {
  const { state, readyForPlayer, reachedAt, dunglingStates } = run;
  section('Zustandskette des Onboardings');
  check('Alle Onboarding-Schritte durchlaufen', ONBOARDING_ORDER.every((phase) => state.onboarding.trail.includes(phase)));
  check('Endet mit BUILD_MENU_VISIBLE', state.onboarding.state === ONBOARDING_STATE.BUILD_MENU_VISIBLE);
  check('Keine unbekannten Zustände', state.onboarding.trail.every((phase) => ONBOARDING_ORDER.includes(phase)));
  check('Spieler wird zur Auswahl eingeladen', readyForPlayer);

  section('Zeiten und Dungling-Zustände');
  check('Dungling erscheint exakt nach 5 Sekunden', reachedAt.get(ONBOARDING_STATE.DUNGLING_SPAWNING) === ONBOARDING_CONFIG.dunglingSpawnDelayMs);
  check('Mutation verwendet Konfiguration', reachedAt.get(ONBOARDING_STATE.MUTATING) === ONBOARDING_CONFIG.hiveHitDurationMs);
  check('Laufweg verwendet Konfiguration', reachedAt.get(ONBOARDING_STATE.MINING) - reachedAt.get(ONBOARDING_STATE.MOVING_TO_TILE) === ONBOARDING_CONFIG.workerMoveDurationMs);
  check('Abbau verwendet Konfiguration', reachedAt.get(ONBOARDING_STATE.TILE_DESTROYED) - reachedAt.get(ONBOARDING_STATE.MINING) === ONBOARDING_CONFIG.miningDurationMs);
  check('Spawn → Idle → Lauf → Arbeit → Idle', dunglingStates.join('|') === [DUNGLING_STATE.SPAWNING, DUNGLING_STATE.IDLE, DUNGLING_STATE.MOVING, DUNGLING_STATE.WORKING, DUNGLING_STATE.IDLE].join('|'));
  check('Genau ein Erdblock wird hervorgehoben', run.highlightedTileId === run.targetTileId);
}

export function makeOnboardingRun() {
  return runSlice();
}
