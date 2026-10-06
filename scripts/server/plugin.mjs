/** Das Konto-Backend haengt sich in den Vite-Server — im Dev-Server und, weil
 *  `dist/` sonst am Konto-Tor scheitert, auch im Vorschau-Server. Der Transport
 *  liest Route, Rumpfschranke und Traeger-Token aus `account-http.mjs`. */
import { POLICY, SECURITY_HEADERS, parseBody, routeOf, sameOrigin } from './account-http.mjs';
import { createLocalStore } from './account-store-local.mjs';
import { bearerOf, sessionName } from './account-session.mjs';

function readBody(request, limit) {
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
      if (size > limit) {
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
  const route = routeOf(new URL(request.url, 'http://127.0.0.1').pathname, request.method);
  if (!route) return false;
  if (route.refuse) return refuse(response, route.refuse);
  if (!sameOrigin({ origin: request.headers.origin, host: request.headers.host })) {
    return refuse(response, POLICY.origin);
  }
  const { entry } = route;
  const store = createLocalStore();
  let body;
  if (entry.limit > 0) {
    const raw = await readBody(request, entry.limit);
    if (raw === null) {
      response.setHeader('Connection', 'close');
      refuse(response, POLICY.tooLarge);
      response.on('finish', () => request.destroy());
      return true;
    }
    body = parseBody(raw);
  }
  const account = entry.auth ? await sessionName(store, request.headers.authorization) : null;
  if (entry.auth && !account) return refuse(response, POLICY.session);
  const result = await entry.run(store, { body, remote: request.socket.remoteAddress ?? '', account, token: bearerOf(request.headers.authorization) });
  const { error, ...rest } = result;
  send(response, result.status, error ? { error, ...rest } : rest);
  return true;
}

function install(server) {
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
