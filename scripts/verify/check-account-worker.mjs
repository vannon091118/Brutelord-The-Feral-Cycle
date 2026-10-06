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
      world: { width: 64, height: 64, tiles: {}, deposits: {}, seed: 1, depth: 0, hiveOrigin: { x: 0, y: 0 } },
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
  check('Ein Rumpf mit Fassung, aber ohne Stand wird abgewiesen',
    (await ask({ path: '/api/state', body: { version: SNAPSHOT_VERSION }, token })).status === 400);
  const streit = await payloadOf(await ask({ path: '/api/state', body: envelope, token }));
  check('Ein veralteter Stand wird abgewiesen', streit.status === 409);
  check('Die Absage nennt die Revision des Servers', streit.json.revision === 1);
  check('Ein fremdes Token traegt keinen Namen',
    (await ask({ path: '/api/state', method: 'GET', token: 'gibtsnicht' })).status === 401);
  await checkRaidTuer(token);
  check('Abmelden entwertet den Traeger-Token', (await ask({ path: '/api/logout', token })).status === 200);
  check('Nach dem Abmelden gibt es den Spielstand nicht mehr',
    (await ask({ path: '/api/state', method: 'GET', token })).status === 401);
}

async function checkRaidTuer(token) {
  check('Der Raid ohne Token bleibt zu', (await ask({ path: '/api/raid', body: {} })).status === 401);
  check('Der Raid mit Token und kaputtem Log faellt in der Domaene durch',
    (await ask({ path: '/api/raid', body: {}, token })).status === 422);
  check('Auch ein kaputter Aktionsrumpf liefert 422 statt 500',
    (await ask({ path: '/api/raid', body: { ticket: {}, claimed: {}, actions: null }, token })).status === 422);
  check('Ein unbekannter Schritt wird ebenso abgewiesen',
    (await ask({ path: '/api/raid', body: { ticket: { snapshotSeed: 1, entry: { x: 8, y: 8 }, heroes: [] }, claimed: {}, actions: [{ type: 'NOPE' }] }, token })).status === 422);
}

function fakeBindung() {
  const statement = { bind: () => statement, run: async () => ({ meta: { changes: 0 } }), first: async () => null };
  return { DB: { prepare: () => statement, batch: async () => [] } };
}

/** Der D1-Speicher laeuft in diesem Baum nicht; sein Vertrag ist trotzdem
 *  pruefbar. Ohne diese Zeile faellt ein vergessener Name erst ausgeliefert auf. */
function checkVertrag() {
  section('D1: derselbe Vertrag wie der lokale Speicher');
  const d1 = createD1Store(fakeBindung());
  const lokal = createLocalStore();
  check('Beide Speicher tragen dieselben Methoden',
    Object.keys(d1).sort().join(' ') === Object.keys(lokal).sort().join(' '), Object.keys(d1).sort().join(' '));
  check('Jede Methode des D1-Speichers ist async',
    Object.values(d1).every((methode) => methode.constructor.name === 'AsyncFunction'));
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
  const angekuendigt = {
    url: `${BASE}/api/register`,
    method: 'POST',
    headers: new Headers({ 'content-length': String(ACCOUNT_CONFIG.bodyLimitBytes * 4) }),
    arrayBuffer: () => { throw new Error('Rumpf wurde gelesen'); },
  };
  check('Ein angekuendigt zu grosser Rumpf wird abgewiesen, ohne ihn zu lesen',
    (await answerAccountRequest(angekuendigt, () => createLocalStore())).status === 413);
}

export async function checkAccountWorker() {
  await withTempStore(async () => {
    await checkRegistrierung();
    await checkSitzungUndSpielstand();
    await checkAbweisungen();
    checkVertrag();
  });
}
