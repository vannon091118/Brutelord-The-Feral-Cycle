/** Die Regeln der Konto-API an genau einer Stelle: Routen, Koepfe, Absagen und
 *  das Lesen des Rumpfs. Der Vite-Server und der Worker lesen hier — warum zwei
 *  Transporte: Docs/BACKEND-PLAN.md. */
import { login, register } from './account-api.mjs';

export const API_ROUTES = Object.freeze({
  '/api/register': register,
  '/api/login': login,
});

export const SECURITY_HEADERS = Object.freeze({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-store',
});

/** Status und Text jeder Absage, damit zwei Transporte nicht zwei Wortlaute fuehren. */
export const POLICY = Object.freeze({
  method: { status: 405, error: 'Nur POST.' },
  origin: { status: 403, error: 'Fremde Herkunft.' },
  tooLarge: { status: 413, error: 'Anfrage zu gross.' },
  server: { status: 500, error: 'Der Server hat einen Fehler.' },
});

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
