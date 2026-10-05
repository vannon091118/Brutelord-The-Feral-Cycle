// @doc: docs/daten/hive/hive-state.md#hive-state
import { HIVE_PHASE } from '../../domain/entities/hive.js';
import { ONBOARDING_STATE } from '../../domain/onboarding/onboarding-state.js';

const ACTIONS = [ONBOARDING_STATE.WAITING_FOR_DUNGLING, ONBOARDING_STATE.DUNGLING_SPAWNING];

export function hiveVisualState({ hive, onboardingState }) {
  const mutating = hive.phase === HIVE_PHASE.MUTATING;
  const hit = onboardingState === ONBOARDING_STATE.HIVE_CLICKED;
  const waiting = ACTIONS.includes(onboardingState);
  return {
    mutating,
    hit,
    waiting,
    bodyAnimation: mutating
      ? 'dl-anim dl-hive-mutate'
      : hit
        ? 'dl-anim dl-hive-hit'
        : 'dl-anim dl-breathe',
  };
}
