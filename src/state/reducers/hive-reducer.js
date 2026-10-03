/**
 * Hive-Domäne: Klick, Mutation, Ruhe. Ein Befehl ändert hier genau eine Sache —
 * es gibt keine Event-Kette, die weitere Befehle auslöst.
 */
import { HIVE_PHASE, canMutate, settleHive, startMutation } from '../../domain/entities/hive.js';
import { ONBOARDING_STATE, enterOnboarding } from '../../domain/onboarding/onboarding-state.js';
import { ACTION } from '../../domain/actions/action-types.js';

export function reduceHive(state, action) {
  switch (action.type) {
    case ACTION.HIVE_CLICKED:
      return clicked(state);
    case ACTION.HIVE_MUTATION_STARTED:
      return mutating(state);
    case ACTION.HIVE_MUTATION_SETTLED:
      return settled(state);
    default:
      return state;
  }
}

function clicked(state) {
  if (!canMutate(state.hive)) return state;
  return {
    ...state,
    hive: startMutation(state.hive),
    onboarding: enterOnboarding(state.onboarding, ONBOARDING_STATE.HIVE_CLICKED),
  };
}

function mutating(state) {
  if (state.onboarding.state !== ONBOARDING_STATE.HIVE_CLICKED) return state;
  return {
    ...state,
    onboarding: enterOnboarding(state.onboarding, ONBOARDING_STATE.MUTATING),
  };
}

function settled(state) {
  if (state.hive.phase !== HIVE_PHASE.MUTATING) return state;
  return {
    ...state,
    hive: settleHive(state.hive),
    onboarding: enterOnboarding(state.onboarding, ONBOARDING_STATE.WAITING_FOR_DUNGLING),
  };
}
