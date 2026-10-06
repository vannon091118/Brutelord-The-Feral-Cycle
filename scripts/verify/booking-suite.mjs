/** Die Buchung des Raids, einmal geschrieben und gegen jeden Speicher gefahren:
 *  der lokale Speicher und der D1-Speicher erfuellen denselben Vertrag, also
 *  muessen sie dieselben Faelle bestehen. `ticketRows` kommt von aussen, weil
 *  die Aufraeumpruefung die Tabelle sehen muss, nicht nur den Vertrag. */
import { SNAPSHOT_MAX_BYTES } from '../../src/state/snapshot-config.js';
import { SNAPSHOT_WRITE } from '../../src/state/snapshot-rule.js';
import { check, section } from './expect.mjs';

const KONTO = { name: 'raider', player_id: 'p-3', playerseed: 'c'.repeat(16), verifier: 'v', salt: 's' };
const FREMD = { name: 'fremd', player_id: 'p-4', playerseed: 'd'.repeat(16), verifier: 'v', salt: 's' };
const BEUTE = { defender: 'burg', essence: 30, bloodstone: 3 };

function ticket(id, frist, defender = 'burg') {
  return { account: 'raider', defender, ticket: { id, defender }, expiresAt: frist };
}

async function suiteEingang({ store, frist }) {
  check('Ein unbekanntes Ticket gibt es nicht', (await store.getTicket('t-1')) === null);
  await store.putTicket('t-1', ticket('t-1', frist));
  const zeile = await store.getTicket('t-1');
  check('Das Ticket kommt mit seinem Konto und Rumpf zurueck',
    zeile?.account === 'raider' && zeile?.ticket?.defender === 'burg');
  check('Ohne Buchung gibt es keine Quittung', (await store.getBooking('t-1')) === null);
  check('Ein fremdes Konto verbraucht das Ticket nicht',
    (await store.takeTicket({ accountId: 'fremd', id: 't-1' })) === 'kein ticket');
  check('und das Ticket steht danach noch da', (await store.getTicket('t-1')) !== null);
  check('Ein Konto, das es nicht gibt, meldet sich als solches',
    (await store.takeTicket({ accountId: 'niemand', id: 't-1' })) === 'kein konto');
}

async function suiteBuchung({ store }) {
  check('Die Buchung schreibt den Spielstand',
    (await store.takeTicket({
      accountId: 'raider',
      id: 't-1',
      packed: { version: 3, revision: 2, world: { depth: 9 } },
      booking: BEUTE,
    })) === SNAPSHOT_WRITE.ok);
  check('und verbraucht dabei das Ticket', (await store.getTicket('t-1')) === null);
  check('Der gebuchte Stand steht danach da', (await store.getState('raider'))?.world?.depth === 9);
  const quittung = await store.getBooking('t-1');
  check('Die Quittung nennt Angreifer, Verteidiger und Beute',
    quittung?.account === 'raider' && quittung?.defender === 'burg' &&
      quittung?.essence === BEUTE.essence && quittung?.bloodstone === BEUTE.bloodstone,
    JSON.stringify(quittung));
  check('Die Quittung traegt die Revision, die die Buchung geschrieben hat', quittung?.revision === 2);
  check('Ein zweiter Verbrauch findet kein Ticket mehr',
    (await store.takeTicket({ accountId: 'raider', id: 't-1' })) === 'kein ticket');
}

async function suiteWiederholung({ store, frist }) {
  await store.putTicket('t-2', ticket('t-2', frist));
  check('Eine veraltete Revision wird abgewiesen',
    (await store.takeTicket({
      accountId: 'raider',
      id: 't-2',
      packed: { version: 3, revision: 1, world: { depth: 1 } },
      booking: { defender: 'burg', essence: 9, bloodstone: 1 },
    })) === SNAPSHOT_WRITE.stale);
  check('Die abgewiesene Buchung liess die Ticketzeile stehen', (await store.getTicket('t-2'))?.ticket?.id === 't-2');
  check('und den Spielstand unberuehrt', (await store.getState('raider'))?.world?.depth === 9);
  check('und keine Quittung entstehen', (await store.getBooking('t-2')) === null);
  check('Dasselbe Ticket mit hoeherer Revision kommt durch',
    (await store.takeTicket({ accountId: 'raider', id: 't-2', packed: { version: 3, revision: 3, world: { depth: 10 } } })) === SNAPSHOT_WRITE.ok);
  check('und ist danach verbraucht', (await store.getTicket('t-2')) === null);
}

async function suiteGrenzen({ store, frist, ticketRows }) {
  await store.putTicket('t-3', ticket('t-3', frist));
  check('Ein Lauf ohne Beute verbraucht die Zeile ohne Buchung',
    (await store.takeTicket({ accountId: 'raider', id: 't-3' })) === SNAPSHOT_WRITE.ok);
  check('und ohne Quittung', (await store.getBooking('t-3')) === null);
  check('und ohne den Stand anzufassen', (await store.getState('raider'))?.world?.depth === 10);
  await store.putTicket('t-4', ticket('t-4', frist));
  check('Eine zu grosse Buchung wird abgewiesen, bevor sie schreibt',
    (await store.takeTicket({
      accountId: 'raider',
      id: 't-4',
      packed: { version: 3, revision: 4, blob: 'a'.repeat(SNAPSHOT_MAX_BYTES) },
      booking: { defender: 'burg', essence: 1, bloodstone: 0 },
    })) === SNAPSHOT_WRITE.tooLarge);
  check('und laesst das Ticket stehen', (await store.getTicket('t-4')) !== null);
  check('und schreibt keine Quittung', (await store.getBooking('t-4')) === null);
  await store.putTicket('t-5', ticket('t-5', 1));
  check('Ein abgelaufenes Ticket wird nicht mehr gelesen', (await store.getTicket('t-5')) === null);
  check('und laesst sich auch nicht buchen',
    (await store.takeTicket({ accountId: 'raider', id: 't-5', packed: { version: 3, revision: 5, world: { depth: 11 } } })) === 'kein ticket');
  await store.putTicket('t-6', ticket('t-6', frist));
  check('Ein Schreibvorgang raeumt die abgelaufene Zeile weg', ticketRows('t-5') === 0);
}

async function suiteListe({ store }) {
  const liste = await store.listBookings('raider');
  check('Die Liste der Ueberfaelle kennt nur die eigenen', liste.length === 1, `${liste.length}`);
  check('und nennt Beute und Revision',
    liste[0]?.defender === 'burg' && liste[0]?.essence === BEUTE.essence && liste[0]?.bloodstone === BEUTE.bloodstone);
  check('Ein Konto ohne Ueberfaelle bekommt eine leere Liste', (await store.listBookings('fremd')).length === 0);
}

export async function runBookingSuite({ store, label, ticketRows }) {
  section(`Speicher (${label}): die Ticketzeile, die Buchung und die Quittung`);
  const frist = Date.now() + 60000;
  await store.updateAccount('raider', KONTO);
  await store.updateAccount('fremd', FREMD);
  await suiteEingang({ store, frist });
  await suiteBuchung({ store });
  await suiteWiederholung({ store, frist });
  await suiteGrenzen({ store, frist, ticketRows });
  await suiteListe({ store });
}
