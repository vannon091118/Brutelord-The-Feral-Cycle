/** Die eingefrorenen Zustände des Szenario-Laufs: Fassung und Form wie das Spiel. */
import { ACTION } from '../../src/domain/actions/action-types.js';
import { JOB_CONFIG } from '../../src/domain/labour/job-config.js';
import { SNAPSHOT_VERSION } from '../../src/state/snapshot-config.js';
import { isSavedShape } from '../../src/state/snapshot.js';
import { gameReducer } from '../../src/state/game-reducer.js';
import { fixtureNames, readFixture } from '../../tools/tests/lib/fixture.mjs';
import { check, section } from './expect.mjs';

const TICKS = 5;

/** Ein Stand, der die Formpruefung besteht, aber den Takt nicht ueberlebt, ist
 *  beim naechsten Zug tot — die Formpruefung allein sieht das nicht. */
function tickThrough(state) {
  let current = state;
  for (let index = 0; index < TICKS; index += 1) {
    current = gameReducer(current, { type: ACTION.WORK_TICK, dtMs: JOB_CONFIG.tickMs });
  }
  return current;
}

function survives(fixture) {
  try {
    return tickThrough(fixture.state).dunglings.every((worker) => Array.isArray(worker.orders));
  } catch {
    return false;
  }
}

export function checkFixtures() {
  section('Zustände: eingefroren, in der Fassung des Spiels');
  const names = fixtureNames();
  check('Es gibt eingefrorene Zustände', names.length > 0, `${names.length} Stück`);
  for (const name of names) {
    const fixture = readFixture(name);
    check(
      `Zustand ${name} traegt die Spielstand-Fassung ${SNAPSHOT_VERSION}`,
      fixture.version === SNAPSHOT_VERSION,
      `Fassung ${fixture.version}`,
    );
    check(
      `Zustand ${name} besteht die Formpruefung des Spiels`,
      isSavedShape(fixture.state),
      `Tiefe ${fixture.state.world?.depth}`,
    );
    check(`Zustand ${name} uebersteht ${TICKS} Takte`, survives(fixture));
  }
}
