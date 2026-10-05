/** Die Bremse, der Attrappenpfad und die Grenzwerte: genau die drei Stellen,
 *  an denen eine Konto-API sonst still aufquillt. Ohne Browser, mit eigener
 *  Datenbank und zurückgesetzter Bremse, damit der Lauf reproduzierbar ist. */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { login, register } from '../server/account-api.mjs';
import { ACCOUNT_CONFIG } from '../server/account-config.mjs';
import { createLocalStore } from '../server/account-store-local.mjs';
import { isLocked, noteFailure, resetThrottle, throttleKey } from '../server/account-throttle.mjs';
import { check, section } from './expect.mjs';

const PASSWORD = 'knochenmehl42';
const { attempts, windowMs } = ACCOUNT_CONFIG.throttle;

export const TEMP_DB = 'test.db';

/** Ein Speicher auf einer eigenen Datei. Die API kennt nur den Speicher; wer
 *  nachsehen will, ruft `openAccounts()` — beide gehen ueber `DL_DATA_DIR`. */
export async function withTempDb(run) {
  const dir = mkdtempSync(tmpdir() + '/dl-bremse-');
  process.env.DL_DATA_DIR = dir;
  resetThrottle();
  try {
    return await run(createLocalStore(), dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
    resetThrottle();
    delete process.env.DL_DATA_DIR;
  }
}

async function checkBrake() {
  await withTempDb(async (store) => {
    await register(store, { name: 'bremse-1', password: PASSWORD });
    const tries = [];
    for (let i = 0; i < attempts; i += 1) tries.push((await login(store, { name: 'bremse-1', password: 'falschfalsch' })).status);
    const blocked = await login(store, { name: 'bremse-1', password: PASSWORD });
    section('Konto: die Bremse');
    check(`Nach ${attempts} Fehlversuchen ist 401 die Antwort`, tries.every((status) => status === 401), tries.join(','));
    check('Auch das richtige Passwort kommt dann nicht mehr durch', blocked.status === 429, `${blocked.status}`);
    check('Ein anderer Name von derselben Herkunft bleibt frei', (await login(store, { name: 'bremse-2', password: PASSWORD })).status === 401);
    resetThrottle();
    check('Nach dem Zuruecksetzen geht es wieder', (await login(store, { name: 'bremse-1', password: PASSWORD })).status === 200);
  });
}

function checkWindow() {
  const key = throttleKey({ name: 'fenster', remote: '127.0.0.1' });
  const now = 1_000_000;
  for (let hit = 1; hit < attempts; hit += 1) noteFailure(key, now);
  section('Konto: das Bremsfenster');
  check(`${attempts - 1} Fehlversuche sperren noch nicht`, !isLocked(key, now), '');
  noteFailure(key, now);
  check(`Der ${attempts}. Fehlversuch sperrt bis zum Fensterende`, isLocked(key, now), '');
  check('Nach dem Fenster ist die Tür wieder offen', !isLocked(key, now + windowMs + 1), '');
  check('Ein fremder Name hat eine eigene Bremse', !isLocked(throttleKey({ name: 'anders', remote: '127.0.0.1' }), now));
  check('Eine fremde Herkunft auch', !isLocked(throttleKey({ name: 'fenster', remote: '10.0.0.1' }), now));
}

async function checkLimits() {
  await withTempDb(async (store) => {
    const tooLong = 'a'.repeat(ACCOUNT_CONFIG.passwordMax + 1);
    section('Konto: die Grenzen');
    check('Ein Passwort ueber der Obergrenze wird abgewiesen', (await register(store, { name: 'lang-1', password: tooLong })).status === 400);
    check('Und beim Anmelden genauso', (await login(store, { name: 'lang-1', password: tooLong })).status === 401);
    check('Der unbekannte Name kostet trotzdem den scrypt-Lauf', (await login(store, { name: 'gibtsnicht', password: PASSWORD })).status === 401);
    check('Ein gueltiges Konto wird danach angelegt', (await register(store, { name: 'lang-1', password: PASSWORD })).status === 201);
    check('Erst der zweite Versuch stoesst auf den vergebenen Namen', (await register(store, { name: 'lang-1', password: PASSWORD })).status === 409);
  });
}

export async function checkAccountBrake() {
  await checkBrake();
  checkWindow();
  await checkLimits();
}