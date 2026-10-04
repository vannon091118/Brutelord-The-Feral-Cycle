/** Das Konto-Backend haengt sich in den Vite-Dev-Server: ein zweiter Befehl,
 *  kein zweiter Prozess. Begründung der Schranken in ARCHITEKTUR.md. */
import { login, register } from './account-api.mjs';
import { ACCOUNT_CONFIG } from './account-config.mjs';
import { openAccounts } from './account-store.mjs';

const ROUTES = {
  '/api/register': register,
  '/api/login': login,
};

const SECURITY_HEADERS = Object.freeze({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-store',
});

/** `null` heisst: zu gross nach Bytes oder abgebrochen — der Aufrufer antwortet 413. */
function readBody(request) {
  return new Promise((resolve) => {
    const chunks = [];
    let size = 0;
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > ACCOUNT_CONFIG.bodyLimitBytes) {
        finish(null);
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => finish(Buffer.concat(chunks).toString('utf8')));
    request.on('error', () => finish(null));
  });
}

function send(response, status, payload) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) response.setHeader(name, value);
  response.end(JSON.stringify(payload));
}

function sameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.host;
  } catch {
    return false;
  }
}

function parseBody(raw) {
  try {
    return JSON.parse(raw || '{}') ?? {};
  } catch {
    return {};
  }
}

async function handle(request, response) {
  const route = ROUTES[new URL(request.url, 'http://127.0.0.1').pathname];
  if (!route) return false;
  if (request.method !== 'POST') {
    send(response, 405, { error: 'Nur POST.' });
    return true;
  }
  if (!sameOrigin(request)) {
    send(response, 403, { error: 'Fremde Herkunft.' });
    return true;
  }
  const raw = await readBody(request);
  if (raw === null) {
    response.setHeader('Connection', 'close');
    send(response, 413, { error: 'Anfrage zu gross.' });
    response.on('finish', () => request.destroy());
    return true;
  }
  const body = parseBody(raw);
  const remote = request.socket.remoteAddress ?? '';
  const result = route(openAccounts(), { name: body.name, password: body.password, remote });
  const { error, ...rest } = result;
  send(response, result.status, error ? { error } : rest);
  return true;
}

export function accountApi() {
  return {
    name: 'dungeon-lord-accounts',
    configureServer(server) {
      // Pro Anfrage geoeffnet, nicht einmal beim Start: sonst haelt ein laufender
      // Server eine Datei offen, die npm run purge gerade geloescht hat.
      server.middlewares.use(async (request, response, next) => {
        try {
          if (!(await handle(request, response))) next();
        } catch (error) {
          console.error('[konto-api]', error);
          send(response, 500, { error: 'Der Server hat einen Fehler.' });
        }
      });
    },
  };
}