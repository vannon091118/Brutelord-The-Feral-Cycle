/** Der Worker-Ast: dieselbe Konto-Tuer, aber Fetch statt node:http, gegen den
 *  echten lokalen Speicher. D1 laeuft in diesem Baum nicht, der Transport schon,
 *  samt der zwei Wege, die eine Sitzung verlangen: Spielstand und Raid. */
import { ACCOUNT_CONFIG } from '../server/account-config.mjs';
import { createLocalStore } from '../server/account-store-local.mjs';
import { createD1Store } from '../../workers/account-store-d1.mjs';
import { answerAccountRequest } from '../../workers/index.mjs';
import { SNAPSHOT_VERSION } from '../../src/state/snapshot-config.js';
import { check, section } from './expect.mjs';
import { withTempStore } from './temp-store.mjs';

const PASSWORD = 'knochenmehl42';
const BASE = 'http://127.0.0.1';

function request({ path, method = 'POST', body, origin, token }) {
  const headers = { 'Content-Type': 'application/json' };
  if (origin) headers.Origin = origin;
  if (token) headers.Authorization = `Bearer ${token}`;
  return new Request(`${BASE}${path}`, {
    method,
    headers,
    ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body ?? {}) } : {}),
  });
}

function ask(options) {
  return answerAccountRequest(request(options), () => createLocalStore());
}

async function payloadOf(response) {
  if (!response) return { status: 0, json: {} };
  return { status: response.status, json: await response.json().catch(() => ({})) };
}

function spielstand(revision = 1) {
  return {
    version: SNAPSHOT_VERSION,
    seed: 'a'.repeat(16),
    revision,
    state: {
      essence: 0,
      dunglings: [],
      buildings: [],
      popups: [],
      onboarding: { state: 'ERDE', trail: [] },
      world: { tiles: {}, deposits: {}, seed: 1, depth: 0, hiveOrigin: { x: 0 } },
    },
  };
}

async function checkRegistrierung() {
  section('Konto im Worker: dieselbe Tuer, ein anderer Transport');
  const anlegen = await ask({ path: '/api/register', body: { name: 'worker-1', password: PASSWORD } });
  const angelegt = await payloadOf(anlegen);
  check('Registrieren liefert 201 und JSON', angelegt.status === 201 && Boolean(angelegt.json.playerseed), `${angelegt.status}`);
  check('Die Antwort ist als JSON ausgezeichnet und nicht cachebar',
    (anlegen.headers.get('content-type') ?? '').includes('application/json') && anlegen.headers.get('cache-control') === 'no-store');
  check('Die Anmeldung traegt einen Traeger-Token', typeof angelegt.json.token === 'string' && angelegt.json.token.length >= 16);
  check('Ein zweiter Anlauf auf denselben Namen liefert 409', (await ask({
    path: '/api/register',
    body: { name: 'worker-1', password: PASSWORD },
  })).status === 409);
  const login = await payloadOf(await ask({
    path: '/api/login',
    body: { name: 'worker-1', password: PASSWORD },
  }));
  check('Anmelden liefert 200 mit demselben Spielerseed', login.json.playerseed === angelegt.json.playerseed);
  check('Ein falsches Passwort liefert 401 mit Text', (await payloadOf(await ask({
    path: '/api/login',
    body: { name: 'worker-1', password: 'falsch-falsch' },
  }))).json.error?.startsWith('Name oder Passwort'));
}

async function checkSitzungUndSpielstand() {
  section('Konto im Worker: Sitzung, Spielstand und Raid');
  const angelegt = await payloadOf(await ask({ path: '/api/register', body: { name: 'worker-spiel', password: PASSWORD } }));
  const token = angelegt.json.token;
  check('Ohne Token gibt es den Spielstand nicht', (await ask({ path: '/api/state', method: 'GET' })).status === 401);
  check('Mit Token ist der Spielstand zuerst leer',
    (await payloadOf(await ask({ path: '/api/state', method: 'GET', token }))).json.envelope === null);
  const envelope = spielstand();
  check('Ein gueltiger Spielstand wird geschrieben', (await ask({ path: '/api/state', body: envelope, token })).status === 200);
  check('Und kommt danach zurueck',
    (await payloadOf(await ask({ path: '/api/state', method: 'GET', token }))).json.envelope?.revision === 1);
  check('Ein Rumpf ohne Fassung wird abgewiesen', (await ask({ path: '/api/state', body: { hallo: true }, token })).status === 400);
  check('Ein veralteter Stand wird abgewiesen', (await ask({ path: '/api/state', body: envelope, token })).status === 409);
  check('Ein fremdes Token traegt keinen Namen',
    (await ask({ path: '/api/state', method: 'GET', token: 'gibtsnicht' })).status === 401);
  check('Der Raid ohne Token bleibt zu', (await ask({ path: '/api/raid', body: {} })).status === 401);
  check('Der Raid mit Token und kaputtem Log faellt in der Domaene durch',
    (await ask({ path: '/api/raid', body: {}, token })).status === 422);
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

export async function checkAccountWorker() {
  await withTempStore(async () => {
    await checkRegistrierung();
    await checkSitzungUndSpielstand();
    await checkAbweisungen();
  });
}
