/** Die Regeln der Konto-API an genau einer Stelle: Routen, Koepfe, Absagen und
 *  das Lesen des Rumpfs. Jede Route nennt ihre Methode, ihre Rumpfschranke und
 *  ob sie eine Sitzung braucht — `/api/state` und `/api/raid` entscheiden ueber
 *  den Traeger-Token, nicht ueber einen Wert aus dem Rumpf. */
import { ACCOUNT_CONFIG } from './account-config.mjs';
import { login, register } from './account-api.mjs';
import { putState, readState } from './state-http.mjs';
import { validateSubmission } from './raid-http.mjs';
import { SNAPSHOT_MAX_BYTES } from '../../src/state/snapshot-config.js';

const SMALL = ACCOUNT_CONFIG.bodyLimitBytes;
const STATE = SNAPSHOT_MAX_BYTES + 1024;
const RAID = 65536;

export const API_ROUTES = Object.freeze({
  '/api/register': Object.freeze({ POST: Object.freeze({ run: register, limit: SMALL, auth: false }) }),
  '/api/login': Object.freeze({ POST: Object.freeze({ run: login, limit: SMALL, auth: false }) }),
  '/api/state': Object.freeze({
    GET: Object.freeze({ run: readState, limit: 0, auth: true }),
    POST: Object.freeze({ run: putState, limit: STATE, auth: true }),
  }),
  '/api/raid': Object.freeze({ POST: Object.freeze({ run: validateSubmission, limit: RAID, auth: true }) }),
});

export const SECURITY_HEADERS = Object.freeze({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-store',
});

/** Status und Text jeder Absage, damit zwei Transporte nicht zwei Wortlaute fuehren. */
export const POLICY = Object.freeze({
  method: { status: 405, error: 'Diese Methode ist hier nicht erlaubt.' },
  origin: { status: 403, error: 'Fremde Herkunft.' },
  tooLarge: { status: 413, error: 'Anfrage zu gross.' },
  server: { status: 500, error: 'Der Server hat einen Fehler.' },
  session: { status: 401, error: 'Nicht angemeldet.' },
});

export function routeOf(pathname, method) {
  const route = API_ROUTES[pathname];
  if (!route) return null;
  return route[method] ? { entry: route[method] } : { refuse: POLICY.method };
}

export function sameOrigin({ origin, host }) {
  if (!origin) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function parseBody(raw) {
  try {
    return JSON.parse(raw || '{}') ?? {};
  } catch {
    return {};
  }
}
