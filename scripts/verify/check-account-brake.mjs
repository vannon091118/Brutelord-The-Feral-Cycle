/** Die Bremse, das Bremsfenster und die Grenzwerte. Die Bremse zaehlt im Speicher
 *  des Kontos, nicht im Prozess — deshalb faehrt der Lauf zwei frische Datenbanken,
 *  und eine belegt, dass ein Neustart die Tuer wieder oeffnet. */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { login, register } from '../server/account-api.mjs';
import { ACCOUNT_CONFIG } from '../server/account-config.mjs';
import { createLocalStore } from '../server/account-store-local.mjs';
import { lockedUntil, nextEntry, throttleKey } from '../server/account-throttle.mjs';
import { check, section } from './expect.mjs';

const PASSWORD = 'knochenmehl42';
const { attempts, windowMs } = ACCOUNT_CONFIG.throttle;

export async function withTempDb(run) {
  const dir = mkdtempSync(tmpdir() + '/dl-bremse-');
  process.env.DL_DATA_DIR = dir;
  try {
    return await run(createLocalStore(), dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
    delete process.env.DL_DATA_DIR;
  }
}

async function checkBrake() {
  await withTempDb(async (store) => {
    await register(store, { body: { name: 'bremse-1', password: PASSWORD } });
    const tries = [];
    for (let i = 0; i < attempts; i += 1) tries.push((await login(store, { body: { name: 'bremse-1', password: 'falschfalsch' } })).status);
    const blocked = await login(store, { body: { name: 'bremse-1', password: PASSWORD } });
    section('Konto: die Bremse');
    check(`Nach ${attempts} Fehlversuchen ist 401 die Antwort`, tries.every((status) => status === 401), tries.join(','));
    check('Auch das richtige Passwort kommt dann nicht mehr durch', blocked.status === 429, `${blocked.status}`);
    check('Ein anderer Name von derselben Herkunft bleibt frei', (await login(store, { body: { name: 'bremse-2', password: PASSWORD } })).status === 401);
  });
  await withTempDb(async (store) => {
    await register(store, { body: { name: 'bremse-1', password: PASSWORD } });
    check('Eine frische Datenbank faengt mit offener Tuer an', (await login(store, { body: { name: 'bremse-1', password: PASSWORD } })).status === 200);
  });
}

function checkWindow() {
  const now = 1_000_000;
  let entry = null;
  for (let hit = 1; hit < attempts; hit += 1) entry = nextEntry(entry, now);
  section('Konto: das Bremsfenster');
  check(`${attempts - 1} Fehlversuche sperren noch nicht`, lockedUntil(entry, now) === 0, '');
  entry = nextEntry(entry, now);
  check(`Der ${attempts}. Fehlversuch sperrt bis zum Fensterende`, lockedUntil(entry, now) === entry.until, '');
  check('Nach dem Fenster ist die Tuer wieder offen', lockedUntil(entry, now + windowMs + 1) === 0, '');
  check('Ein fremder Name hat eine eigene Bremse', throttleKey({ name: 'a', remote: '1' }) !== throttleKey({ name: 'b', remote: '1' }));
  check('Eine fremde Herkunft auch', throttleKey({ name: 'a', remote: '1' }) !== throttleKey({ name: 'a', remote: '2' }));
}

async function checkLimits() {
  await withTempDb(async (store) => {
    const tooLong = 'a'.repeat(ACCOUNT_CONFIG.passwordMax + 1);
    section('Konto: die Grenzen');
    check('Ein Passwort ueber der Obergrenze wird abgewiesen', (await register(store, { body: { name: 'lang-1', password: tooLong } })).status === 400);
    check('Und beim Anmelden genauso', (await login(store, { body: { name: 'lang-1', password: tooLong } })).status === 401);
    check('Der unbekannte Name kostet trotzdem den scrypt-Lauf', (await login(store, { body: { name: 'gibtsnicht', password: PASSWORD } })).status === 401);
    check('Ein gueltiges Konto wird danach angelegt', (await register(store, { body: { name: 'lang-1', password: PASSWORD } })).status === 201);
    check('Erst der zweite Versuch stoesst auf den vergebenen Namen', (await register(store, { body: { name: 'lang-1', password: PASSWORD } })).status === 409);
  });
}

export async function checkAccountBrake() {
  await checkBrake();
  checkWindow();
  await checkLimits();
}
