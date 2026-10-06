/** Der Worker: derselbe Konto-Befehl, ein anderer Transport. Er spricht Fetch
 *  statt node:http und haelt D1 statt SQLite — die Regeln kommen aus
 *  `scripts/server/account-http.mjs`, damit Dev-Server und Auslieferung nicht
 *  zwei Wortlaute fuer dieselbe Absage fuehren. Was keine Konto-Route ist,
 *  geht an die Assets aus `dist/`. Der Entwurf: Docs/BACKEND-PLAN.md. */
import { createD1Store } from './account-store-d1.mjs';
import { ACCOUNT_CONFIG } from '../scripts/server/account-config.mjs';
import { API_ROUTES, POLICY, SECURITY_HEADERS, parseBody, sameOrigin } from '../scripts/server/account-http.mjs';

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...SECURITY_HEADERS },
  });
}

function refuse(absage) {
  return json({ error: absage.error }, absage.status);
}

/** `null` heisst: zu gross nach Bytes — dieselbe Schranke wie im Dev-Server. */
async function readBody(request) {
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > ACCOUNT_CONFIG.bodyLimitBytes) return null;
  return new TextDecoder().decode(bytes);
}

/** Die Konto-Antwort in Fetch-Sprache. `null` heisst: nicht meine Route — dann
 *  gibt der Aufrufer sie an die Assets weiter. Der Speicher wird erst geoeffnet,
 *  wenn Weg, Methode und Herkunft stimmen. */
export async function answerAccountRequest(request, openStore) {
  const route = API_ROUTES[new URL(request.url).pathname];
  if (!route) return null;
  if (request.method !== 'POST') return refuse(POLICY.method);
  const origin = request.headers.get('origin');
  if (!sameOrigin({ origin, host: request.headers.get('host') })) return refuse(POLICY.origin);
  const raw = await readBody(request);
  if (raw === null) return refuse(POLICY.tooLarge);
  const body = parseBody(raw);
  const remote = request.headers.get('cf-connecting-ip') ?? '';
  try {
    const result = await route(openStore(), { name: body.name, password: body.password, remote });
    const { error, ...rest } = result;
    return json(error ? { error } : rest, result.status);
  } catch (error) {
    console.error('[konto-worker]', error);
    return refuse(POLICY.server);
  }
}

export default {
  async fetch(request, env) {
    const answer = await answerAccountRequest(request, () => createD1Store(env));
    return answer ?? env.ASSETS.fetch(request);
  },
};
