/** Das Konto-Umfeld des Raids: echte Requests gegen den echten lokalen
 *  Speicher, dazu der Envelope in der Form, die der Server annimmt. Dieselbe
 *  Bauart wie in check-account-worker.mjs — ein Transport, ein Speicher. */
import { answerAccountRequest } from '../../workers/index.mjs';
import { createLocalStore } from '../server/account-store-local.mjs';
import { SNAPSHOT_VERSION } from '../../src/state/snapshot-config.js';

const BASE = 'http://127.0.0.1';

export const PASSWORD = 'knochenmehl42';

export function request({ path, method = 'POST', body, token, origin }) {
  const headers = { 'Content-Type': 'application/json' };
  if (origin) headers.Origin = origin;
  if (token) headers.Authorization = `Bearer ${token}`;
  return new Request(`${BASE}${path}`, {
    method,
    headers,
    ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body ?? {}) } : {}),
  });
}

export function ask(options) {
  return answerAccountRequest(request(options), () => createLocalStore());
}

export async function payloadOf(response) {
  if (!response) return { status: 0, json: {} };
  return { status: response.status, json: await response.json().catch(() => ({})) };
}

export function envelope({ seed = 4242, revision = 1, essence = 0, dunglings = [] }) {
  return {
    version: SNAPSHOT_VERSION,
    seed: 'a'.repeat(16),
    revision,
    state: {
      essence,
      dunglings,
      buildings: [],
      popups: [],
      onboarding: { state: 'ERDE', trail: [] },
      world: { width: 64, height: 64, tiles: {}, deposits: {}, seed, depth: 0, hiveOrigin: { x: 0, y: 0 } },
    },
  };
}
