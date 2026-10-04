/** Unzulässige Befehle bleiben wirkungslos — gegen den echten Reducer. */
import { ACTION } from '../../src/domain/actions/action-types.js';
import { HIVE_PHASE } from '../../src/domain/entities/hive.js';
import { createInitialGameState } from '../../src/state/game-state.js';
import { gameReducer } from '../../src/state/game-reducer.js';
import { check, section } from './expect.mjs';

export function checkGuard() {
  const initial = createInitialGameState();
  section('Unzulässige Befehle bleiben wirkungslos');
  const afterFarClick = gameReducer(initial, { type: ACTION.TILE_SELECTED, tileId: '0,0' });
  check('Weit entfernte Erde nicht auswählbar', afterFarClick === initial);
  const afterOrder = gameReducer(initial, { type: ACTION.MINING_ORDERED });
  check('Abbau ohne Auswahl startet nicht', afterOrder === initial);
  const afterEarlySpawn = gameReducer(initial, { type: ACTION.DUNGLING_SPAWNED });
  check('Vorzeitiger Spawn wird abgewiesen', afterEarlySpawn === initial);
  const afterClick = gameReducer(initial, { type: ACTION.HIVE_CLICKED });
  check('Hive-Klick startet genau eine Mutation', afterClick.hive.phase === HIVE_PHASE.MUTATING);
  check('Zweiter Hive-Klick wird ignoriert', gameReducer(afterClick, { type: ACTION.HIVE_CLICKED }) === afterClick);
}
