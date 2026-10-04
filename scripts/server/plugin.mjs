/** Das Konto-Backend hängt sich in den Vite-Dev-Server: ein zweiter Befehl,
 *  kein zweiter Prozess. POST /api/register und POST /api/login, sonst nichts. */
import { login, register } from './account-api.mjs';
import { openAccounts } from './account-store.mjs';

const ROUTES = {
  '/api/register': register,
  '/api/login': login,
};

const LIMIT = 4096;

function readBody(request) {
  return new Promise((resolve) => {
    let raw = '';
    request.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > LIMIT) request.destroy();
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

function send(response, status, payload) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

async function handle(request, response) {
  const route = ROUTES[new URL(request.url, 'http://127.0.0.1').pathname];
  if (!route) return false;
  if (request.method !== 'POST') {
    send(response, 405, { error: 'Nur POST.' });
    return true;
  }
  const body = await readBody(request);
  const result = route(openAccounts(), { name: body.name, password: body.password });
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
          send(response, 500, { error: String(error?.message ?? error) });
        }
      });
    },
  };
}
