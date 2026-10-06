/** Der Speicher-Vertrag, der Spielstand neben dem Konto, die atomare
 *  Schreibregel und der Waechter der Auslieferungsbindung. Die Buchung des
 *  Raids steht in check-booking.mjs und laeuft dort gegen beide Speicher. */
import { SNAPSHOT_MAX_BYTES } from '../../src/state/snapshot-config.js';
import { SNAPSHOT_WRITE } from '../../src/state/snapshot-rule.js';
import { STORAGE_METHODS, storageProbe, storageViolations } from '../server/storage-interface.mjs';
import { databasePath, openAccounts } from '../server/account-store.mjs';
import { PLACEHOLDER_D1_ID, databaseIdProblems } from '../server/binding-config.mjs';
import { check, section } from './expect.mjs';
import { withTempStore } from './temp-store.mjs';

const NAMES = ['getAccount', 'updateAccount', 'getState', 'putState', 'getSession', 'putSession', 'deleteSession', 'getAttempt', 'putAttempt', 'putTicket', 'getTicket', 'takeTicket', 'getBooking', 'listBookings'];

function rowsFor(token) {
  const db = openAccounts(databasePath());
  try {
    return db.prepare('SELECT COUNT(*) AS n FROM sessions WHERE token = ?').get(token).n;
  } finally {
    db.close();
  }
}

function expireSession(token) {
  const db = openAccounts(databasePath());
  try {
    db.prepare('UPDATE sessions SET expires_at = 1 WHERE token = ?').run(token);
  } finally {
    db.close();
  }
}

function syncStore() {
  const store = { getAccount: () => null };
  for (const name of STORAGE_METHODS) store[name] = async () => null;
  store.getAccount = () => null;
  return store;
}

async function checkContract() {
  section('Speicher: der Vertrag, nicht die Datenbank');
  await withTempStore(async (store) => {
    check('Der lokale Speicher erfuellt den Vertrag', (await storageProbe(store)).join(' ') === '');
    check('Ein unvollstaendiger Speicher wird gemeldet, nicht benutzt',
      storageViolations({ getAccount: async () => null }).length === STORAGE_METHODS.length - 1);
    check('Alle vierzehn Namen stehen im Vertrag', STORAGE_METHODS.join(' ') === NAMES.join(' '));
    check('Ein synchroner Speicher faellt durch — der Vertrag sagt asynchron',
      storageViolations(syncStore()).some((mangel) => mangel.includes('nicht als async')));
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

async function checkSession() {
  section('Speicher: Sitzung und Bremse liegen neben dem Konto');
  await withTempStore(async (store) => {
    check('Ohne Token gibt es keine Sitzung', (await store.getSession('gibtsnicht')) === null);
    await store.putSession('tok-1', 'hal');
    check('Eine Sitzung kommt mit ihrem Namen zurueck', (await store.getSession('tok-1'))?.name === 'hal');
    await store.putSession('tok-2', 'hal');
    check('Zwei Sitzungen desselben Kontos stehen nebeneinander', (await store.getSession('tok-2'))?.name === 'hal');
    check('Ein Widerruf entwertet den Token sofort', (await store.deleteSession('tok-2')) === true);
    check('Danach traegt er keinen Namen mehr', (await store.getSession('tok-2')) === null);
    check('Ein zweiter Widerruf findet nichts mehr', (await store.deleteSession('tok-2')) === false);
    await checkSessionLifetime(store);
    check('Die Bremse startet leer', (await store.getAttempt('k')) === null);
    await store.putAttempt('k', { count: 3, until: 42 });
    check('Ein Bremsstand ueberlebt den Zugriff', (await store.getAttempt('k'))?.count === 3);
    await store.putAttempt('k', { count: 0, until: 0 });
    check('Ein erfolgreicher Aufruf setzt die Bremse zurueck', (await store.getAttempt('k'))?.count === 0);
    await store.putAttempt('abgelaufen', { count: 9, until: 1 });
    await store.putAttempt('frisch', { count: 1, until: Date.now() + 60000 });
    check('Ein Schreibvorgang raeumt abgelaufene Bremsstaende weg', (await store.getAttempt('abgelaufen')) === null);
    check('und laesst den frischen stehen', (await store.getAttempt('frisch'))?.count === 1);
  });
}

async function checkSessionLifetime(store) {
  await store.putSession('tok-alt', 'hal');
  expireSession('tok-alt');
  check('Eine abgelaufene Sitzung traegt keinen Namen mehr', (await store.getSession('tok-alt')) === null);
  await store.putSession('tok-frisch', 'hal');
  check('Ein Schreibvorgang raeumt die abgelaufene Zeile weg', rowsFor('tok-alt') === 0);
  check('und laesst die frische Sitzung stehen', (await store.getSession('tok-frisch'))?.name === 'hal');
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
    await checkLostUpdate(store);
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

async function checkLostUpdate(store) {
  const zehn = { version: 3, revision: 10, world: { depth: 7 } };
  check('Der erste Schreiber mit Revision 10 kommt durch', (await store.putState('still', zehn)) === SNAPSHOT_WRITE.ok);
  check('Der zweite mit derselben Revision nicht mehr',
    (await store.putState('still', { ...zehn, world: { depth: 8 } })) === SNAPSHOT_WRITE.stale);
  check('und liess den ersten Stand stehen', (await store.getState('still'))?.world?.depth === 7);
}

function checkBinding() {
  section('Speicher: die Bindung der Auslieferung');
  check('Der Null-Platzhalter wird abgewiesen', databaseIdProblems(PLACEHOLDER_D1_ID).length === 1);
  check('Eine echte UUID kommt durch', databaseIdProblems('12345678-1234-1234-1234-123456789abc').length === 0);
  check('Ein leerer Wert wird abgewiesen', databaseIdProblems('').length === 1);
}

export async function checkStorage() {
  await checkContract();
  await checkState();
  await checkSession();
  await checkWriteRule();
  checkBinding();
}
