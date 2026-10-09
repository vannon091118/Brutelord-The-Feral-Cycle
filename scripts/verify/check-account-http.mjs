/** Die HTTP-Schicht und das Loesch-Werkzeug gegen einen echten Node-Server: ein
 *  Purge im falschen Ordner und eine 413, die nie ankommt, fallen sonst erst im Browser auf. */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { ACCOUNT_CONFIG } from '../server/account-config.mjs';
import { accountApi } from '../server/plugin.mjs';
import { check, section } from './expect.mjs';

const PASSWORD = 'knochenmehl42';
const OWN = `http://127.0.0.1`;
const PURGE = `${process.cwd()}/scripts/server/purge.mjs`;

function tempDir(tag) {
  return mkdtempSync(`${tmpdir()}/${tag}`);
}

/** Dev-Server und Vorschau-Server registrieren dieselbe Middleware. */
function middlewareOf(register) {
  let middle = null;
  accountApi()[register]({ middlewares: { use: (fn) => { middle = fn; } } });
  return middle;
}

/** Der Vorschau-Haken entscheidet, ob es die Route im dist/ ueberhaupt gibt. */
function previewHookReady() {
  const api = accountApi();
  return typeof api.configurePreviewServer === 'function' && api.configurePreviewServer === api.configureServer;
}

async function withServer(run, options = {}) {
  const middle = middlewareOf(options.register ?? 'configureServer');
  const server = createServer((request, response) => {
    middle(request, response, () => { response.statusCode = 404; response.end('next'); });
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  const dir = options.dir ?? tempDir('/dl-http-');
  process.env.DL_DATA_DIR = dir;
  try {
    return await run(`${OWN}:${server.address().port}`);
  } finally {
    server.close();
    if (!options.dir) rmSync(dir, { recursive: true, force: true });
    delete process.env.DL_DATA_DIR;
  }
}

async function post({ base, path, body, origin }) {
  const headers = { 'Content-Type': 'application/json', ...(origin ? { Origin: origin } : {}) };
  try {
    const response = await fetch(`${base}${path}`, {
      method: 'POST',
      headers,
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
    const text = await response.text();
    let json = {};
    try { json = JSON.parse(text); } catch { json = { roh: text }; }
    return { status: response.status, json, headers: response.headers };
  } catch (error) {
    // Kein Wurf: eine kaputte Verbindung ist ein Befund und kein Absturz des Laufs.
    return { status: 0, json: { error: String(error?.message ?? error) }, headers: new Headers() };
  }
}

async function checkRouten() {
  await withServer(async (base) => {
    const created = await post({ base, path: '/api/register', body: { name: 'http-1', password: PASSWORD } });
    section('Konto: die HTTP-Schicht');
    check('Registrieren liefert 201 und JSON', created.status === 201 && created.json.playerseed, `${created.status}`);
    check('Die Antwort traegt die vier Schranken', ['nosniff', 'DENY', 'no-referrer', 'no-store']
      .every((value) => [...created.headers.entries()].some(([, head]) => head.includes(value))));
    check('GET auf eine POST-Route wird abgewiesen', (await fetch(`${base}/api/login`)).status === 405);
    check('Kaputter JSON gilt als leerer Antrag', (await post({ base, path: '/api/login', body: 'kein json' })).status === 401);
    const fremd = await post({ base, path: '/api/login', body: { name: 'http-1', password: PASSWORD }, origin: 'https://fremd.example' });
    check('Eine fremde Herkunft wird abgewiesen', fremd.status === 403, `${fremd.status}`);
    check('Die eigene Herkunft kommt durch', (await post({ base, path: '/api/login', body: { name: 'http-1', password: PASSWORD }, origin: base })).status === 200);
    check('Eine unbekannte Route bleibt dem Dev-Server', (await fetch(`${base}/nichtda`)).status === 404);
    const tippfehler = await fetch(`${base}/api/gibtsnicht`);
    check('Ein Tippfehler in einer API-Route liefert 404 statt der Seite',
      tippfehler.status === 404 && (tippfehler.headers.get('content-type') ?? '').includes('application/json'), `${tippfehler.status}`);
    check('Ohne Origin-Kopf kommt die Anfrage durch — so entschieden (ARCHITEKTUR.md)',
      (await post({ base, path: '/api/login', body: { name: 'http-1', password: PASSWORD } })).status === 200);
    await post({ base, path: '/api/register', body: { name: '__proto__', password: PASSWORD } });
    check('Ein Name wie __proto__ vergiftet keinen Prototyp', ({}).polluted === undefined && Object.getPrototypeOf({}) === Object.prototype);
  });
}

async function checkAbmelden() {
  await withServer(async (base) => {
    const angelegt = await post({ base, path: '/api/register', body: { name: 'abmelden-1', password: PASSWORD } });
    const kopf = { 'Content-Type': 'application/json', Authorization: `Bearer ${angelegt.json.token}` };
    section('Konto: das Abmelden');
    check('Der Spielstand ist vor dem Abmelden da', (await fetch(`${base}/api/state`, { headers: kopf })).status === 200);
    check('Abmelden liefert 200', (await fetch(`${base}/api/logout`, { method: 'POST', headers: kopf })).status === 200);
    check('Danach gibt es den Spielstand nicht mehr', (await fetch(`${base}/api/state`, { headers: kopf })).status === 401);
  });
}

async function checkBodyLimit() {
  await withServer(async (base) => {
    const gross = 'a'.repeat(ACCOUNT_CONFIG.bodyLimitBytes * 2);
    const limited = await post({ base, path: '/api/register', body: { name: 'gross', password: gross } });
    section('Konto: die Rumpfschranke');
    check('Ein zu grosser Antrag liefert 413 statt zu haengen', limited.status === 413, `${limited.status}`);
    check('Die Antwort danach ist wieder normal',
      (await post({ base, path: '/api/register', body: { name: 'nach-413', password: PASSWORD } })).status === 201);
  });
}

async function checkFehlerleck() {
  const blocker = `${tempDir('/dl-fehler-')}/datei`;
  writeFileSync(blocker, 'kein ordner');
  const original = console.error;
  console.error = () => {};
  process.env.DL_DATA_DIR = `${blocker}/daten`;
  try {
    await withServer(async (base) => {
      const failed = await post({ base, path: '/api/login', body: { name: 'http-1', password: PASSWORD } });
      section('Konto: der Serverfehler');
      check('Ein Datenbankfehler liefert 500', failed.status === 500, `${failed.status}`);
      check('Die Meldung verraet nicht den Grund', !JSON.stringify(failed.json).match(/ENOTDIR|EACCES|node:fs/), failed.json.error);
      check('und ist trotzdem eine Meldung', typeof failed.json.error === 'string' && failed.json.error.length > 0);
    }, { dir: `${blocker}/daten` });
  } finally {
    console.error = original;
    rmSync(blocker, { recursive: true, force: true });
    delete process.env.DL_DATA_DIR;
  }
}

async function checkVorschau() {
  section('Konto: der ausgelieferte Stand');
  check('Der Vorschau-Server haengt an derselben Middleware wie der Dev-Server', previewHookReady());
  if (!previewHookReady()) return;
  await withServer(async (base) => {
    const created = await post({ base, path: '/api/register', body: { name: 'vorschau-1', password: PASSWORD } });
    check('Der Vorschau-Server beantwortet /api/register mit JSON',
      created.status === 201 && Boolean(created.json.playerId), `${created.status}`);
    check('und /api/login ebenso',
      (await post({ base, path: '/api/login', body: { name: 'vorschau-1', password: PASSWORD } })).status === 200);
    check('Was keine Konto-Route ist, bleibt dort der Seite', (await fetch(`${base}/nichtda`)).status === 404);
  }, { register: 'configurePreviewServer' });
}

function purgeExit({ dir, cwd }) {
  try {
    execFileSync(process.execPath, [PURGE], { cwd, stdio: 'pipe', env: { ...process.env, DL_DATA_DIR: dir } });
    return 0;
  } catch (error) {
    return error.status ?? -1;
  }
}

function checkPurgeSchranke() {
  const sandbox = tempDir('/dl-purge-');
  const arbeit = `${sandbox}/arbeit`;
  const eigenes = `${sandbox}/daten`;
  mkdirSync(arbeit, { recursive: true });
  writeFileSync(`${sandbox}/wichtig.txt`, 'nicht loeschen');
  section('Konto: das Loesch-Werkzeug');
  check('Der Elternordner bleibt', purgeExit({ dir: '..', cwd: arbeit }) === 1 && existsSync(`${sandbox}/wichtig.txt`), '');
  check('Die Wurzel bleibt', purgeExit({ dir: '/', cwd: arbeit }) === 1, '');
  check('Der Arbeitsordner bleibt', purgeExit({ dir: '.', cwd: arbeit }) === 1, '');
  check('Der eigene Ordner wird geloescht', purgeExit({ dir: eigenes, cwd: arbeit }) === 0 && !existsSync(eigenes), '');
  rmSync(sandbox, { recursive: true, force: true });
}

export function checkAccountHttp() {
  return checkRouten()
    .then(checkAbmelden)
    .then(checkBodyLimit)
    .then(checkFehlerleck)
    .then(checkVorschau)
    .then(() => checkPurgeSchranke());
}