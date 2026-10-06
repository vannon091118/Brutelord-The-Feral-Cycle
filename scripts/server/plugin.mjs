/** Das Konto-Backend haengt sich in den Vite-Server: ein zweiter Befehl, kein
 *  zweiter Prozess — im Dev-Server und, weil `dist/` sonst am Konto-Tor
 *  scheitert, auch im Vorschau-Server. Begruendung in Docs/ARCHITEKTUR.md. */
import { ACCOUNT_CONFIG } from './account-config.mjs';
import { API_ROUTES, POLICY, SECURITY_HEADERS, parseBody, sameOrigin } from './account-http.mjs';
import { createLocalStore } from './account-store-local.mjs';

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

function refuse(response, absage) {
  send(response, absage.status, { error: absage.error });
  return true;
}

async function handle(request, response) {
  const route = API_ROUTES[new URL(request.url, 'http://127.0.0.1').pathname];
  if (!route) return false;
  if (request.method !== 'POST') return refuse(response, POLICY.method);
  if (!sameOrigin({ origin: request.headers.origin, host: request.headers.host })) {
    return refuse(response, POLICY.origin);
  }
  const raw = await readBody(request);
  if (raw === null) {
    response.setHeader('Connection', 'close');
    refuse(response, POLICY.tooLarge);
    response.on('finish', () => request.destroy());
    return true;
  }
  const body = parseBody(raw);
  const remote = request.socket.remoteAddress ?? '';
  const result = await route(createLocalStore(), { name: body.name, password: body.password, remote });
  const { error, ...rest } = result;
  send(response, result.status, error ? { error } : rest);
  return true;
}

function install(server) {
  // Pro Anfrage geoeffnet: sonst haelt der Server eine Datei offen, die npm run purge gerade geloescht hat.
  server.middlewares.use(async (request, response, next) => {
    try {
      if (!(await handle(request, response))) next();
    } catch (error) {
      console.error('[konto-api]', error);
      refuse(response, POLICY.server);
    }
  });
}

export function accountApi() {
  return {
    name: 'brutalord-the-feral-cycle-accounts',
    configureServer: install,
    configurePreviewServer: install,
  };
}
