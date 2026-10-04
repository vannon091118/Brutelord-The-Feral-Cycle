/** Die Sitzung: Name, PlayerID und Seed. Das ist Identität, kein Spielstand —
 *  der Hive-Fortschritt bleibt weiter beim Reload verloren. */
const KEY = 'dl.session';

export function readSession() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.playerseed ? parsed : null;
  } catch {
    return null;
  }
}

export function writeSession(session) {
  window.localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(KEY);
}
