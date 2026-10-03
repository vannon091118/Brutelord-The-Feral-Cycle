/** Beweist, dass der gleiche Befehlspfad weitere angrenzende Erde abbaut. */
import { ACTION } from '../../src/domain/actions/action-types.js';
import { ONBOARDING_STATE } from '../../src/domain/onboarding/onboarding-state.js';
import { gameReducer } from '../../src/state/game-reducer.js';
import { check } from './expect.mjs';
import { VirtualClock } from './virtual-clock.mjs';

export function checkNextMine(state) {
  const distant = gameReducer(state, { type: ACTION.TILE_SELECTED, tileId: '0,0' });
  check('Entfernte Erde bleibt gesperrt', distant === state);
  const selected = gameReducer(state, { type: ACTION.TILE_SELECTED, tileId: '2,5' });
  check('Angrenzende Erde ist auswählbar', selected.selectedTileId === '2,5');
  const ordered = gameReducer(selected, { type: ACTION.MINING_ORDERED });
  check('Folgeabbau nutzt denselben Befehlspfad', ordered.onboarding.state === ONBOARDING_STATE.MOVING_TO_TILE);
  const clock = new VirtualClock();
  clock.state = ordered;
  clock.schedule();
  clock.run();
  check('Folgeabbau gewinnt exakt ein Feld', clock.state.usableTileCount === 3);
}
