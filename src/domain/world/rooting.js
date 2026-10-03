/** Die vier Phasen eines Feldes: DARK, GROWING, RESTING, CLAIMED. */
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

export function beginRooting() {
  return createRooting(ROOTING_PHASE.GROWING);
}

function phaseConfig(phase, config) {
  return phase === ROOTING_PHASE.GROWING ? config.claimDurationMs : config.cooldownMs;
}

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

export function isRootingBusy(rooting) {
  return rooting.phase === ROOTING_PHASE.GROWING || rooting.phase === ROOTING_PHASE.RESTING;
}

export function rootingCoverage(rooting) {
  if (rooting.phase === ROOTING_PHASE.CLAIMED) return 1;
  if (rooting.phase === ROOTING_PHASE.DARK) return 0;
  return rooting.phase === ROOTING_PHASE.RESTING
    ? 1
    : rooting.progress;
}
