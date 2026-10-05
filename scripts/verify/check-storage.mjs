/** Der Speicher-Vertrag und der Spielstand neben dem Konto. Die Rechnung des
 *  Raids steht in check-raid-cap.mjs. */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { storageProbe, storageViolations } from '../server/storage-interface.mjs';
import { createLocalStore } from '../server/account-store-local.mjs';
import { check, section } from './expect.mjs';

/** Eine eigene Datei je Lauf; `:memory:` waere nutzlos, weil jede Anfrage neu
 *  oeffnet. Das `await` ist Pflicht: ohne es raeumt der `finally` zu frueh auf. */
async function withTempStore(run) {
  const dir = mkdtempSync(tmpdir() + '/dl-speicher-');
  process.env.DL_DATA_DIR = dir;
  try {
    return await run(createLocalStore());
  } finally {
    rmSync(dir, { recursive: true, force: true });
    delete process.env.DL_DATA_DIR;
  }
}

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

export async function checkStorage() {
  await checkContract();
  await checkState();
}
