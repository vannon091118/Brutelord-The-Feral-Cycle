// @doc: docs/daten/dungling/dungling-anim.md#dungling-anim
import { DUNGLING_STATE } from '../../domain/entities/dungling.js';

const BODY_ANIMATIONS = {
  [DUNGLING_STATE.SPAWNING]: 'dl-anim dl-emerge',
  [DUNGLING_STATE.IDLE]: 'dl-anim dl-bob',
  [DUNGLING_STATE.MOVING]: 'dl-anim dl-walk',
  [DUNGLING_STATE.WORKING]: 'dl-anim dl-work',
};

export function dunglingAnimation(state) {
  return {
    bodyAnimation: BODY_ANIMATIONS[state] ?? 'dl-anim dl-bob',
    working: state === DUNGLING_STATE.WORKING,
    moving: state === DUNGLING_STATE.MOVING,
  };
}
