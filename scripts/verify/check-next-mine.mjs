/** Beweist, dass der gleiche Befehlspfad weitere angrenzende Erde abbaut. */
import { ACTION } from '../../src/domain/actions/action-types.js';
import { ONBOARDING_CONFIG } from '../../src/domain/onboarding/onboarding-config.js';
import { ONBOARDING_STATE } from '../../src/domain/onboarding/onboarding-state.js';
import { tileId } from '../../src/domain/world/tile.js';
import { gameReducer } from '../../src/state/game-reducer.js';
import { check } from './expect.mjs';
import { VirtualClock } from './virtual-clock.mjs';

/** Das Folgefeld liegt direkt unter dem ersten abgebauten Block. */
const NEXT_TILE = tileId(ONBOARDING_CONFIG.firstEarthBlock.x, ONBOARDING_CONFIG.firstEarthBlock.y + 1);

export function checkNextMine(state) {
  const distant = gameReducer(state, { type: ACTION.TILE_SELECTED, tileId: '0,0' });
  check('Entfernte Erde bleibt gesperrt', distant === state);
  const selected = gameReducer(state, { type: ACTION.TILE_SELECTED, tileId: NEXT_TILE });
  check('Angrenzende Erde ist auswählbar', selected.selectedTileId === NEXT_TILE);
  const ordered = gameReducer(selected, { type: ACTION.MINING_ORDERED });
  check('Folgeabbau nutzt denselben Befehlspfad', ordered.onboarding.state === ONBOARDING_STATE.MOVING_TO_TILE);
  const clock = new VirtualClock();
  clock.state = ordered;
  clock.schedule();
  clock.run();
  check('Folgeabbau gewinnt exakt ein Feld', clock.state.usableTileCount === state.usableTileCount + 1);
}
