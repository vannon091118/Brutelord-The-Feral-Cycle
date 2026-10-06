/** Der Worker: derselbe Konto-Befehl, ein anderer Transport. Er spricht Fetch
 *  statt node:http und haelt D1 statt SQLite — die Regeln kommen aus
 *  `scripts/server/account-http.mjs`, damit Dev-Server und Auslieferung nicht
 *  zwei Wortlaute fuer dieselbe Absage fuehren. Was keine Konto-Route ist,
 *  geht an die Assets aus `dist/`. Der Entwurf: Docs/BACKEND-PLAN.md. */
import { createD1Store } from './account-store-d1.mjs';
import { POLICY, SECURITY_HEADERS, parseBody, routeOf, sameOrigin } from '../scripts/server/account-http.mjs';
import { sessionName } from '../scripts/server/account-session.mjs';

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
async function readBody(request, limit) {
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > limit) return null;
  return new TextDecoder().decode(bytes);
}

/** Die Konto-Antwort in Fetch-Sprache. `null` heisst: nicht meine Route — dann
 *  gibt der Aufrufer sie an die Assets weiter. Der Speicher wird erst geoeffnet,
 *  wenn Weg, Methode und Herkunft stimmen. */
export async function answerAccountRequest(request, openStore) {
  const route = routeOf(new URL(request.url).pathname, request.method);
  if (!route) return null;
  if (route.refuse) return refuse(route.refuse);
  const origin = request.headers.get('origin');
  if (!sameOrigin({ origin, host: request.headers.get('host') })) return refuse(POLICY.origin);
  const { entry } = route;
  const store = openStore();
  let body;
  if (entry.limit > 0) {
    const raw = await readBody(request, entry.limit);
    if (raw === null) return refuse(POLICY.tooLarge);
    body = parseBody(raw);
  }
  const account = entry.auth ? await sessionName(store, request.headers.get('authorization')) : null;
  if (entry.auth && !account) return refuse(POLICY.session);
  try {
    const result = await entry.run(store, { body, remote: request.headers.get('cf-connecting-ip') ?? '', account });
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
