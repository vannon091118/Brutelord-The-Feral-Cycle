/**
 * Die Essenz-Ökonomie gegen den echten Reducer: Der Abbau kostet, der Hive
 * presst gedeckelt. Beides über die Aktionen, die auch im Browser laufen.
 */
import { ACTION } from '../../src/domain/actions/action-types.js';
import { ESSENCE_ECONOMY, canPayForMining } from '../../src/domain/economy/essence-economy.js';
import { miningCost } from '../../src/domain/actions/mining.js';
import { gameReducer } from '../../src/state/game-reducer.js';
import { check, section } from './expect.mjs';
import { miningReadyState } from './mining-ready.mjs';

const TICKS_FOR_BUDGET = (ESSENCE_ECONOMY.hiveBudget + 2) * (ESSENCE_ECONOMY.hiveEveryMs / 100);

function press(state, ticks) {
  let next = state;
  for (let index = 0; index < ticks; index += 1) {
    next = gameReducer(next, { type: ACTION.HIVE_TICK, dtMs: 100 });
  }
  return next;
}

export function checkEconomy() {
  section('Essenz-Ökonomie');
  const before = miningReadyState();
  const ordered = gameReducer(before, { type: ACTION.MINING_ORDERED });
  const spent = before.essence - ordered.essence;

  check('Der Abbau kostet genau eine Essenz', spent === miningCost(), `${spent} Essenz`);
  check('Der Abbau kostet, bevor er beginnt', ordered.mining !== null && spent > 0);
  check('Ohne Essenz wird der Abbau verweigert', gameReducer(miningReadyState({ essence: 0 }), { type: ACTION.MINING_ORDERED }).mining === null);
  check('Wird nichts abgebaut, wird auch nichts berechnet', gameReducer(before, { type: ACTION.TILE_SELECTION_CLEARED }).essence === before.essence);
  check('canPayForMining verweigert leere Werte (null)', canPayForMining(null) === false);
  check('canPayForMining verweigert leere Werte (undefined)', canPayForMining(undefined) === false);
  check('canPayForMining verweigert leere Werte (NaN)', canPayForMining(NaN) === false);

  const short = press(before, 30);
  check('Der Hive presst noch nicht vor Ablauf seines Taktes', short.hive.pressed === 0 && short.essence === before.essence);

  const oneTick = press(before, ESSENCE_ECONOMY.hiveEveryMs / 100);
  check('Nach einem Hive-Takt presst er genau eine Essenz', oneTick.hive.pressed === 1, `pressed ${oneTick.hive.pressed}`);

  const full = press(before, TICKS_FOR_BUDGET);
  check('Der Hive presst nie mehr als sein Budget', full.hive.pressed === ESSENCE_ECONOMY.hiveBudget, `pressed ${full.hive.pressed}`);
  check('Der Hive liefert genau sein Budget an Essenz', full.essence - before.essence === ESSENCE_ECONOMY.hiveBudget);

  const over = press(full, TICKS_FOR_BUDGET);
  check('Auch weiteres Warten presst nichts nach', over.essence === full.essence && over.hive.pressed === full.hive.pressed);
}