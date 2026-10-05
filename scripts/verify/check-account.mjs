/** Die Konto-Schicht gegen eine eigene Datenbank: fünf Konten, gleiche
 *  Zugangsdaten ergeben denselben Seed, fremde Passwörter werden abgewiesen.
 *  Läuft ohne Browser und rührt die Entwicklungsdatenbank nicht an. Die API
 *  ist async und spricht mit dem Speicher, nicht mit der Datenbank. */
import { login, register } from '../server/account-api.mjs';
import { countAccounts, openAccounts } from '../server/account-store.mjs';
import { ACCOUNT_CONFIG } from '../server/account-config.mjs';
import { checkAccountBrake, withTempDb } from './check-account-brake.mjs';
import { check, section } from './expect.mjs';

const PASSWORD = 'knochenmehl42';
const NAMES = ['trash-1', 'trash-2', 'trash-3', 'trash-4', 'trash-5'];

function checkStoredHash(db) {
  const row = db.prepare('SELECT verifier, salt FROM accounts WHERE name = ?').get(NAMES[0]);
  const salts = db.prepare('SELECT salt FROM accounts').all().map((r) => r.salt);
  section('Konto: das Passwort wird gestreut');
  check('Der gespeicherte Schlüssel ist kein Klartext', row.verifier !== PASSWORD && row.verifier.length === ACCOUNT_CONFIG.keyBytes * 2);
  check('Jedes Konto hat sein eigenes Salz', new Set(salts).size === NAMES.length);
}

async function checkRegister() {
  await withTempDb(async (store) => {
    const db = openAccounts();
    const results = [];
    for (const name of NAMES) results.push(await register(store, { name, password: PASSWORD }));
    section('Konto: anlegen');
    check(`Alle ${NAMES.length} Konten entstehen`, results.every((entry) => entry.status === 201), results.map((e) => e.status).join(','));
    check('Die Datenbank zählt sie', countAccounts(db) === NAMES.length, `${countAccounts(db)}`);
    check('Jeder Name hat seinen eigenen Seed', new Set(results.map((entry) => entry.playerseed)).size === NAMES.length);
    check('Jede PlayerID ist der Seed, verkürzt', results.every((entry) => entry.playerId === `${ACCOUNT_CONFIG.idPrefix}${entry.playerseed.slice(0, 8)}`));
    check('Das Passwort steht nirgends im Konto', results.every((entry) => !JSON.stringify(entry).includes(PASSWORD)));
    checkStoredHash(db);
  });
}

async function checkLogin() {
  await withTempDb(async (store) => {
    await register(store, { name: NAMES[0], password: PASSWORD });
    section('Konto: anmelden');
    const good = await login(store, { name: NAMES[0], password: PASSWORD });
    check('Richtiges Passwort gibt den Seed zurück', good.status === 200 && good.playerseed.length === ACCOUNT_CONFIG.seedHex);
    check('Falsches Passwort wird abgewiesen', (await login(store, { name: NAMES[0], password: 'falschfalsch' })).status === 401);
    check('Unbekannter Name wird abgewiesen', (await login(store, { name: 'gibtsnicht', password: PASSWORD })).status === 401);
    check('Groß- und Kleinschreibung sind derselbe Name', (await login(store, { name: 'TRASH-1', password: PASSWORD })).status === 200);
    check('Doppelte Anmeldung wird abgewiesen', (await register(store, { name: NAMES[0], password: PASSWORD })).status === 409);
    check('Kurzes Passwort wird abgewiesen', (await register(store, { name: 'trash-6', password: 'kurz' })).status === 400);
    check('Kurzer Name wird abgewiesen', (await register(store, { name: 'ab', password: PASSWORD })).status === 400);
  });
}

async function checkSameLoginSameSeed() {
  await withTempDb(async (store) => {
    const first = await register(store, { name: NAMES[0], password: PASSWORD });
    const again = await login(store, { name: NAMES[0], password: PASSWORD });
    section('Konto: derselbe Login, derselbe Seed');
    check('Der Seed überlebt eine Anmeldung', first.playerseed === again.playerseed);
    const zweites = await register(store, { name: 'trash-2', password: PASSWORD });
    check('Ein zweites Konto mit anderem Namen bekommt einen anderen Seed', first.playerseed !== zweites.playerseed);
  });
}

export async function checkAccount() {
  await checkRegister();
  await checkLogin();
  await checkSameLoginSameSeed();
  await checkAccountBrake();
}
