/** Die Sitzung am Rand: der Server vergibt einen Traeger-Token und loest ihn
 *  spaeter gegen die Tabelle auf. Der Token ist kein Spielwert — die Welt
 *  haengt weiter am Spielerseed des Kontos, aber wer jemand ist, entscheidet
 *  jetzt der Server und nicht ein Wert, den der Client mitschickt. */

export function newToken() {
  return crypto.randomUUID();
}

export function bearerOf(header) {
  const wert = typeof header === 'string' ? header.trim() : '';
  return wert.startsWith('Bearer ') ? wert.slice(7).trim() : '';
}

export async function startSession(store, name) {
  const token = newToken();
  await store.putSession(token, name);
  return token;
}

export async function sessionName(store, header) {
  const token = bearerOf(header);
  if (!token) return null;
  const row = await store.getSession(token);
  return row?.name ?? null;
}

export async function endSession(store, token) {
  if (!token) return false;
  return store.deleteSession(token);
}
