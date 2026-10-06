/** Der Spielstand ueber HTTP: lesen und schreiben mit denselben Schranken wie
 *  der Client. Der Server versteht den Zustand nicht (B8) — er prueft Fassung
 *  und Groesse und schreibt atomar. Die Identitaet kommt aus der Sitzung und
 *  nicht aus dem Rumpf: der Rumpf traegt den Stand, das Token traegt, wessen
 *  Stand es ist. */
import { SNAPSHOT_VERSION } from '../../src/state/snapshot-config.js';
import { SNAPSHOT_WRITE } from '../../src/state/snapshot-rule.js';
import { isSavedShape } from '../../src/state/snapshot.js';

export const NO_STATE = 'Kein gueltiger Spielstand.';
export const NO_ACCOUNT = 'Kein Konto.';
export const STALE_STATE = 'Veralteter Spielstand.';

export function isEnvelope(body) {
  return body?.version === SNAPSHOT_VERSION && isSavedShape(body?.state);
}

export async function readState(store, { account }) {
  return { status: 200, envelope: await store.getState(account) };
}

export async function putState(store, { account, body }) {
  if (!isEnvelope(body)) return { status: 400, error: NO_STATE };
  const entscheidung = await store.putState(account, body);
  if (entscheidung === SNAPSHOT_WRITE.ok) return { status: 200, ok: true };
  if (entscheidung === SNAPSHOT_WRITE.tooLarge) return { status: 413, error: 'Anfrage zu gross.' };
  if (entscheidung === 'kein konto') return { status: 404, error: NO_ACCOUNT };
  return { status: 409, error: STALE_STATE };
}
