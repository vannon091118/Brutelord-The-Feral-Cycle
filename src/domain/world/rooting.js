/**
 * Die Verwurzelung eines einzelnen Feldes — reine Rechnung, kein Zustand der
 * Welt. Ein Feld durchläuft vier Phasen:
 *
 *   DARK → GROWING → RESTING → CLAIMED
 *
 * `GROWING` ist das Einnehmen: die Farbe des Hive fadet ins Feld, zehn
 * Sekunden lang. `RESTING` ist die Ruhe danach. Erst wenn sie vorbei ist,
 * stoßen die Tentakel in die Nachbarfelder — deshalb `spread`.
 */
import { ROOTING_CONFIG } from './rooting-config.js';

export const ROOTING_PHASE = Object.freeze({
  DARK: 'DARK',
  GROWING: 'GROWING',
  RESTING: 'RESTING',
  CLAIMED: 'CLAIMED',
});

export function createRooting(phase = ROOTING_PHASE.DARK) {
  return { phase, progress: 0 };
}

/** Ein abgebautes Block beginnt sofort zu wachsen. */
export function beginRooting() {
  return createRooting(ROOTING_PHASE.GROWING);
}

function phaseConfig(phase, config) {
  return phase === ROOTING_PHASE.GROWING ? config.claimDurationMs : config.cooldownMs;
}

/**
 * Ein Takt Zeit vergeht. Rückgabe: der neue Zustand und die Antwort, ob in
 * diesem Takt die Nachbarfelder gestoßen werden dürfen.
 */
export function advanceRooting(rooting, dtMs, config = ROOTING_CONFIG) {
  if (rooting.phase !== ROOTING_PHASE.GROWING && rooting.phase !== ROOTING_PHASE.RESTING) {
    return { rooting, spread: false };
  }

  const progress = Math.min(1, rooting.progress + dtMs / phaseConfig(rooting.phase, config));
  if (progress < 1) return { rooting: { ...rooting, progress }, spread: false };

  const finished = rooting.phase === ROOTING_PHASE.RESTING;
  return {
    rooting: createRooting(finished ? ROOTING_PHASE.CLAIMED : ROOTING_PHASE.RESTING),
    spread: finished,
  };
}

/** Arbeit für die Uhr: irgendwo wächst oder ruht noch etwas. */
export function isRootingBusy(rooting) {
  return rooting.phase === ROOTING_PHASE.GROWING || rooting.phase === ROOTING_PHASE.RESTING;
}

/** Wie weit ist das Feld sichtbar eingenommen? 0 bis 1. */
export function rootingCoverage(rooting) {
  if (rooting.phase === ROOTING_PHASE.CLAIMED) return 1;
  if (rooting.phase === ROOTING_PHASE.DARK) return 0;
  return rooting.phase === ROOTING_PHASE.RESTING
    ? 1
    : rooting.progress;
}