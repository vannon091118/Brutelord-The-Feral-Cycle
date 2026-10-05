// @doc: docs/daten/account/session.md#session
export const SESSION_KEY = 'dl.session';
const SEED = /^[0-9a-f]{16}$/;

function text(value) {
  return typeof value === 'string' ? value : '';
}

function isSeed(value) {
  return typeof value === 'string' && SEED.test(value);
}

export function readSession() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SESSION_KEY) ?? 'null');
    if (!isSeed(parsed?.playerseed)) return null;
    return { name: text(parsed.name), playerId: text(parsed.playerId), playerseed: parsed.playerseed };
  } catch {
    return null;
  }
}

export function writeSession(session) {
  if (!isSeed(session?.playerseed)) return;
  const clean = { name: text(session.name), playerId: text(session.playerId), playerseed: session.playerseed };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(clean));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}