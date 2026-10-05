/** Der Wirt: EIN Browser für alle, über seinen Websocket erreichbar. */
import { createServer } from 'node:http';
import { rmSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { HOST_FILE, HOST_IDLE_MS, HOST_PORT } from './lib/config.mjs';

const HEADLESS = process.env.DL_HOST_HEADLESS === '1';
let server = null;
let lastUse = Date.now();

/** Ein Browser**Server**, kein Browser: nur so hat er eine Adresse. */
async function launch() {
  const options = { headless: HEADLESS };
  try {
    server = await chromium.launchServer({ ...options, channel: 'chrome' });
  } catch {
    server = await chromium.launchServer(options);
  }
  // Stirbt der Browser-Driver, stirbt der Wirt mit: er lügt sonst.
  server.on('close', () => {
    rmSync(HOST_FILE, { force: true });
    process.exit(0);
  });
  lastUse = Date.now();
  return server;
}

const status = () => ({ ws: server.wsEndpoint(), headless: HEADLESS, pid: process.pid, idleMs: Date.now() - lastUse });

function answer(response, code, payload) {
  response.writeHead(code, { 'content-type': 'application/json' });
  response.end(JSON.stringify(payload));
}

function shutDown() {
  rmSync(HOST_FILE, { force: true });
  return server?.close().finally(() => process.exit(0));
}

const control = createServer((request, response) => {
  const mode = request.url === '/mode';
  if (request.method === 'POST' && mode) {
    if (HEADLESS === (request.headers['x-headless'] === '1')) return answer(response, 200, status());
    return server.close().then(launch).then(() => answer(response, 200, status()));
  }
  if (request.method === 'POST' && request.url === '/bye') return answer(response, 200, shutDown());
  lastUse = Date.now();
  return server ? answer(response, 200, status()) : answer(response, 503, { error: 'kein Browser' });
});

// Ein Wirt pro Port: wer ihn hält, ist der Wirt.
control.on('error', (error) => {
  if (error.code === 'EADDRINUSE') return process.exit(0);
  console.error('[wirt] Port nicht erreichbar:', error.message);
  process.exit(1);
});

control.listen(HOST_PORT, '127.0.0.1', async () => {
  try {
    await launch();
    writeFileSync(HOST_FILE, JSON.stringify({ ...status(), port: HOST_PORT }));
    console.log(`[wirt] Port ${HOST_PORT}, ${HEADLESS ? 'unsichtbar' : 'sichtbar'}, Pid ${process.pid}`);
  } catch (error) {
    console.error('[wirt] startet nicht:', error.message);
    process.exit(1);
  }
});

setInterval(() => {
  if (Date.now() - lastUse > HOST_IDLE_MS) shutDown();
}, 30_000).unref();