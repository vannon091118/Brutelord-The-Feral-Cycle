/** Der Worker-Ast: dieselbe Konto-Tuer, aber Fetch statt node:http. Geprueft
 *  wird der Weg der Auslieferung gegen den echten lokalen Speicher — D1 laeuft
 *  in diesem Baum nicht, der Transport schon. */
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { ACCOUNT_CONFIG } from '../server/account-config.mjs';
import { createLocalStore } from '../server/account-store-local.mjs';
import { createD1Store } from '../../workers/account-store-d1.mjs';
import { answerAccountRequest } from '../../workers/index.mjs';
import { check, section } from './expect.mjs';

const PASSWORD = 'knochenmehl42';
const BASE = 'http://127.0.0.1';

function request({ path, method = 'POST', body, origin }) {
  const headers = { 'Content-Type': 'application/json' };
  if (origin) headers.Origin = origin;
  return new Request(`${BASE}${path}`, {
    method,
    headers,
    ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body ?? {}) } : {}),
  });
}

/** Pro Anfrage geoeffnet, wie im Dev-Server — nicht einmal fuer den ganzen Lauf. */
function ask(options) {
  return answerAccountRequest(request(options), () => createLocalStore());
}

async function payloadOf(response) {
  if (!response) return { status: 0, json: {} };
  return { status: response.status, json: await response.json().catch(() => ({})) };
}

async function checkRegistrierung() {
  section('Konto im Worker: dieselbe Tuer, ein anderer Transport');
  const anlegen = await ask({ path: '/api/register', body: { name: 'worker-1', password: PASSWORD } });
  const angelegt = await payloadOf(anlegen);
  check('Registrieren liefert 201 und JSON', angelegt.status === 201 && Boolean(angelegt.json.playerseed), `${angelegt.status}`);
  check('Die Antwort ist als JSON ausgezeichnet und nicht cachebar',
    (anlegen.headers.get('content-type') ?? '').includes('application/json') && anlegen.headers.get('cache-control') === 'no-store');
  check('Ein zweiter Anlauf auf denselben Namen liefert 409', (await ask({
    path: '/api/register',
    body: { name: 'worker-1', password: PASSWORD },
  })).status === 409);
  check('Anmelden liefert 200 mit demselben Spielerseed', (await payloadOf(await ask({
    path: '/api/login',
    body: { name: 'worker-1', password: PASSWORD },
  }))).json.playerseed === angelegt.json.playerseed);
  check('Ein falsches Passwort liefert 401 mit Text', (await payloadOf(await ask({
    path: '/api/login',
    body: { name: 'worker-1', password: 'falsch-falsch' },
  }))).json.error?.startsWith('Name oder Passwort'));
}

async function checkAbweisungen() {
  check('Ein GET auf eine POST-Route wird abgewiesen', (await ask({ path: '/api/login', method: 'GET' })).status === 405);
  check('Eine fremde Herkunft wird abgewiesen',
    (await ask({ path: '/api/login', body: { name: 'worker-1', password: PASSWORD }, origin: 'https://fremd.example' })).status === 403);
  const gross = 'a'.repeat(ACCOUNT_CONFIG.bodyLimitBytes * 2);
  check('Ein zu grosser Rumpf liefert 413 statt zu rechnen',
    (await ask({ path: '/api/register', body: { name: 'worker-gross', password: gross } })).status === 413);
  check('Eine unbekannte Route gehoert nicht dem Worker', (await ask({ path: '/nichtda' })) === null);
  check('Ohne D1-Bindung faellt der Produktions-Speicher laut auf',
    (() => { try { createD1Store({}); return false; } catch (error) { return error.message.includes('DB fehlt'); } })());
}

async function withTempStore(run) {
  const dir = mkdtempSync(`${tmpdir()}/dl-worker-`);
  process.env.DL_DATA_DIR = dir;
  try {
    return await run();
  } finally {
    rmSync(dir, { recursive: true, force: true });
    delete process.env.DL_DATA_DIR;
  }
}

export async function checkAccountWorker() {
  await withTempStore(async () => {
    await checkRegistrierung();
    await checkAbweisungen();
  });
}
