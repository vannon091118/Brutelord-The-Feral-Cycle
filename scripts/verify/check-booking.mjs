/** Die Buchung gegen beide Speicher: der lokale Speicher, den Entwicklung,
 *  Dev-Server und Abnahme fahren, und der D1-Speicher, der ausgeliefert wird.
 *  Dieselbe Suite, dieselben Faelle — sonst prueft die Abnahme die Entwicklung,
 *  und die Auslieferung geht ungeprueft hinaus. */
import { databasePath, openAccounts } from '../server/account-store.mjs';
import { createD1Store } from '../../workers/account-store-d1.mjs';
import { runBookingSuite } from './booking-suite.mjs';
import { fakeD1 } from './fake-d1.mjs';
import { check, section } from './expect.mjs';
import { withTempStore } from './temp-store.mjs';

function ticketRows(id) {
  const db = openAccounts(databasePath());
  try {
    return db.prepare('SELECT COUNT(*) AS n FROM raid_tickets WHERE id = ?').get(id).n;
  } finally {
    db.close();
  }
}

async function checkD1() {
  section('D1: die Buchung gegen die Auslieferung');
  const fake = fakeD1();
  const store = createD1Store({ DB: fake });
  const kennung = fake.zaehle(`SELECT COUNT(*) AS n FROM sqlite_master WHERE name = 'raid_tickets'`).n;
  check('Die echten Migrationen ergeben das Schema der Auslieferung', kennung === 1, `${kennung}`);
  await runBookingSuite({
    store,
    label: 'D1',
    ticketRows: (id) => fake.zaehle('SELECT COUNT(*) AS n FROM raid_tickets WHERE id = ?', id).n,
  });
  check('Die Quittung liegt auch in der D1-Attrappe als Zeile',
    fake.zaehle('SELECT COUNT(*) AS n FROM raid_bookings').n === 1);
}

export async function checkBooking() {
  await withTempStore(async (store) => {
    await runBookingSuite({ store, label: 'lokal', ticketRows });
  });
  await checkD1();
}
