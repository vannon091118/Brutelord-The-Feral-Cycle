/** Die Sitzung: Name, PlayerID und Seed. Das ist Identität, kein Spielstand —
 *  der Hive-Fortschritt bleibt weiter beim Reload verloren. */
const KEY = 'dl.session';
const SEED = /^[0-9a-f]{16}$/;

function text(value) {
  return typeof value === 'string' ? value : '';
}

/** Der Seed entscheidet die Welt, also muss er der sein, den der Server
 *  vergeben hat — 16 Hex-Zeichen, sonst ist es fremder Zustand im Speicher. */
function isSeed(value) {
  return typeof value === 'string' && SEED.test(value);
}

export function readSession() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? 'null');
    if (!isSeed(parsed?.playerseed)) return null;
    return { name: text(parsed.name), playerId: text(parsed.playerId), playerseed: parsed.playerseed };
  } catch {
    return null;
  }
}

export function writeSession(session) {
  if (!isSeed(session?.playerseed)) return;
  const clean = { name: text(session.name), playerId: text(session.playerId), playerseed: session.playerseed };
  window.localStorage.setItem(KEY, JSON.stringify(clean));
}

export function clearSession() {
  window.localStorage.removeItem(KEY);
}