/** Der Speicher-Vertrag, der Spielstand neben dem Konto und die Schreibregel.
 *  Die Rechnung des Raids steht in check-raid-cap.mjs. */
import { SNAPSHOT_MAX_BYTES } from '../../src/state/snapshot-config.js';
import { SNAPSHOT_WRITE } from '../../src/state/snapshot-rule.js';
import { storageProbe, storageViolations } from '../server/storage-interface.mjs';
import { check, section } from './expect.mjs';
import { withTempStore } from './temp-store.mjs';

async function checkContract() {
  section('Speicher: der Vertrag, nicht die Datenbank');
  await withTempStore(async (store) => {
    check('Der lokale Speicher erfuellt den Vertrag', (await storageProbe(store)).join(' ') === '');
    check('Ein unvollstaendiger Speicher wird gemeldet, nicht benutzt',
      storageViolations({ getAccount: async () => null }).length === 3);
    check('Ein synchroner Speicher faellt durch — der Vertrag sagt asynchron',
      storageViolations({
        getAccount: () => null,
        updateAccount: async () => null,
        getState: async () => null,
        putState: async () => null,
      }).some((mangel) => mangel.includes('nicht als async')));
  });
}

async function checkState() {
  section('Speicher: der Spielstand liegt neben dem Konto');
  await withTempStore(async (store) => {
    const angelegt = await store.updateAccount('hal', {
      name: 'hal',
      player_id: 'p-1',
      playerseed: 'a'.repeat(16),
      verifier: 'v',
      salt: 's',
    });
    check('Ein Konto laesst sich anlegen und wieder lesen', angelegt?.name === 'hal');
    check('Der Spielstand ist vorher keiner', (await store.getState('hal')) === null);
    await store.putState('hal', { version: 2, world: { depth: 3 } });
    check('Der Spielstand kommt in dem wieder heraus, was hineinging',
      (await store.getState('hal'))?.world?.depth === 3);
    await store.putState('hal', { version: 2, world: { depth: 4 } });
    check('Ein zweiter Speichervorgang ueberschreibt den ersten',
      (await store.getState('hal'))?.world?.depth === 4);
    check('Ein unbekannter Name liefert null, nicht einen Fehler', (await store.getAccount('niemand')) === null);
  });
}

async function checkWriteRule() {
  section('Speicher: die Schreibregel des Spielstands');
  await withTempStore(async (store) => {
    await store.updateAccount('still', {
      name: 'still',
      player_id: 'p-2',
      playerseed: 'b'.repeat(16),
      verifier: 'v',
      salt: 's',
    });
    check('Ein Stand ohne Revision wird angenommen',
      (await store.putState('still', { version: 3, world: { depth: 1 } })) === SNAPSHOT_WRITE.ok);
    check('Ein revisionierter Stand kommt durch',
      (await store.putState('still', { version: 3, revision: 4, world: { depth: 2 } })) === SNAPSHOT_WRITE.ok);
    check('Danach ueberschreibt keine Schreibung ohne Revision mehr',
      (await store.putState('still', { version: 3, world: { depth: 9 } })) === SNAPSHOT_WRITE.stale);
    check('Die abgewiesene Schreibung liess den Stand stehen',
      (await store.getState('still'))?.world?.depth === 2);
    check('Die gleiche Revision ist veraltet',
      (await store.putState('still', { version: 3, revision: 4, world: { depth: 3 } })) === SNAPSHOT_WRITE.stale);
    check('Eine hoehere Revision kommt durch',
      (await store.putState('still', { version: 3, revision: 5, world: { depth: 3 } })) === SNAPSHOT_WRITE.ok);
    await checkWriteLimit(store);
  });
}

async function checkWriteLimit(store) {
  const zuGross = { version: 3, revision: 6, blob: 'a'.repeat(SNAPSHOT_MAX_BYTES) };
  check('Eine Nutzlast ueber der Obergrenze wird abgewiesen',
    (await store.putState('still', zuGross)) === SNAPSHOT_WRITE.tooLarge);
  check('auch sie liess den letzten Stand stehen',
    (await store.getState('still'))?.world?.depth === 3);
  check('Ein unbekanntes Konto meldet sich als solches',
    (await store.putState('niemand', { version: 3, revision: 1 })) === 'kein konto');
}

export async function checkStorage() {
  await checkContract();
  await checkState();
  await checkWriteRule();
}
