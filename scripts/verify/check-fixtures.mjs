/** Die eingefrorenen Zustände des Szenario-Laufs: Fassung und Form wie das Spiel. */
import { SNAPSHOT_VERSION } from '../../src/state/snapshot-config.js';
import { isSavedShape } from '../../src/state/snapshot.js';
import { fixtureNames, readFixture } from '../../tools/tests/lib/fixture.mjs';
import { check, section } from './expect.mjs';

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
  }
}
