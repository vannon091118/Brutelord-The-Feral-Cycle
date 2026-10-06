/**
 * Was der Spieler bekommt: die Darstellung liest Onboarding- und Dungling-
 * Zustände, der Spielerseed entscheidet die Welt, das Konto trägt den Seed.
 */
import { DUNGLING_STATE } from '../../src/domain/entities/dungling.js';
import { ONBOARDING_ORDER, ONBOARDING_STATE } from '../../src/domain/onboarding/onboarding-state.js';
import { dunglingAnimation } from '../../src/world/dungling/dungling-anim.js';
import { hiveVisualState } from '../../src/world/hive/hive-state.js';
import { check, section } from './expect.mjs';

const DUNGLING_STATES = Object.values(DUNGLING_STATE).filter((state) => state !== DUNGLING_STATE.NONE);
const HIVE = { phase: 'DORMANT' };

function checkDunglingAnimations() {
  section('Darstellung: Dungling-Animation deckt alle Zustände ab');
  const fehlend = DUNGLING_STATES.filter((state) => dunglingAnimation(state).bodyAnimation === 'dl-anim dl-bob' && state !== DUNGLING_STATE.IDLE);
  check('Jeder Dungling-Zustand hat eine eigene Animation', fehlend.length === 0, fehlend.join(', '));
  check('Arbeit wird als Arbeit gezeigt', dunglingAnimation(DUNGLING_STATE.WORKING).working === true);
  check('Laufen wird als Laufen gezeigt', dunglingAnimation(DUNGLING_STATE.MOVING).moving === true);
}

function checkHiveWaiting() {
  section('Darstellung: Hive-Warten folgt dem Onboarding');
  const wartend = ONBOARDING_ORDER.filter((phase) => hiveVisualState({ hive: HIVE, onboardingState: phase }).waiting);
  check('Hive wartet genau im Spawn-Fenster', wartend.join('|') === [ONBOARDING_STATE.WAITING_FOR_DUNGLING, ONBOARDING_STATE.DUNGLING_SPAWNING].join('|'), wartend.join(', '));
  check('Der Klick blitzt nur in HIVE_CLICKED', ONBOARDING_ORDER.filter((phase) => hiveVisualState({ hive: HIVE, onboardingState: phase }).hit).join('|') === ONBOARDING_STATE.HIVE_CLICKED);
}

export function checkWorldViews() {
  checkDunglingAnimations();
  checkHiveWaiting();
}