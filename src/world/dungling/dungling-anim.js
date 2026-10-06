// @doc: docs/daten/dungling/dungling-anim.md#dungling-anim
import { DUNGLING_STATE } from '../../domain/entities/dungling.js';

const BODY_ANIMATIONS = {
  [DUNGLING_STATE.SPAWNING]: 'dl-anim dl-emerge',
  [DUNGLING_STATE.IDLE]: 'dl-anim dl-bob',
  [DUNGLING_STATE.MOVING]: 'dl-anim dl-walk',
  [DUNGLING_STATE.WORKING]: 'dl-anim dl-work',
};

export const CREATURE_STATE = Object.freeze({
  REST: 'rest',
  MOVE: 'move',
  ACTIVE: 'active',
  MUTED: 'muted',
});

const MOODS = Object.freeze({
  [DUNGLING_STATE.SPAWNING]: CREATURE_STATE.REST,
  [DUNGLING_STATE.IDLE]: CREATURE_STATE.REST,
  [DUNGLING_STATE.MOVING]: CREATURE_STATE.MOVE,
  [DUNGLING_STATE.WORKING]: CREATURE_STATE.ACTIVE,
});

export function dunglingAnimation(state) {
  return {
    bodyAnimation: BODY_ANIMATIONS[state] ?? 'dl-anim dl-bob',
    working: state === DUNGLING_STATE.WORKING,
    moving: state === DUNGLING_STATE.MOVING,
    mood: MOODS[state] ?? CREATURE_STATE.REST,
  };
}

export function creatureClasses({ mood = CREATURE_STATE.REST, mutant = false, muted = false } = {}) {
  const parts = ['dl-creature', `dl-creature--${muted ? CREATURE_STATE.MUTED : mood}`];
  if (mutant) parts.push('dl-creature--mutant');
  return parts.join(' ');
}
