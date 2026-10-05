/** Die zwei Befehle der Konto-API. Reine Logik, damit npm run verify sie ohne
 *  Browser und ohne Entwicklungsdatenbank prüfen kann. Der erste Parameter ist
 *  ein Speicher aus `storage-interface.mjs` und keine Datenbank: deshalb ist
 *  jeder Aufruf asynchron, und derselbe Code liefe auch gegen D1. */
import { accountProblem, normalizeName } from './account-config.mjs';
import { decoyMatches, makeAccount, passwordMatches, playerIdOf } from './account-rules.mjs';
import { isLocked, noteFailure, noteSuccess, throttleKey } from './account-throttle.mjs';

const LOCKED = 'Zu viele Versuche. Warte einen Moment.';
const WRONG = 'Name oder Passwort stimmt nicht.';
const TAKEN = 'Dieser Name ist schon vergeben.';

function publicOf(account) {
  return { playerId: account.player_id ?? account.playerId, playerseed: account.playerseed, name: account.name };
}

function refused(key) {
  noteFailure(key);
  return { status: 401, error: WRONG };
}

export async function register(store, { name, password, remote = '' } = {}) {
  const problem = accountProblem({ name, password });
  if (problem) return { status: 400, error: problem };
  const clean = normalizeName(name);
  const key = throttleKey({ name: clean, remote });
  if (isLocked(key)) return { status: 429, error: LOCKED };
  if (await store.getAccount(clean)) {
    noteFailure(key);
    return { status: 409, error: TAKEN };
  }
  const made = makeAccount({ name: clean, password });
  noteSuccess(key);
  const gespeichert = await store.updateAccount(clean, { ...made, name: clean, player_id: playerIdOf(made.playerseed) });
  return { status: 201, ...publicOf(gespeichert) };
}

export async function login(store, { name, password, remote = '' } = {}) {
  const clean = normalizeName(name);
  const key = throttleKey({ name: clean, remote });
  if (isLocked(key)) return { status: 429, error: LOCKED };
  const account = await store.getAccount(clean);
  const whole = !accountProblem({ name: clean, password });
  const matches = account && whole
    ? passwordMatches({ password, salt: account.salt, verifier: account.verifier })
    : decoyMatches(String(password ?? ''));
  if (!account || !whole || !matches) return refused(key);
  noteSuccess(key);
  return { status: 200, ...publicOf(account) };
}
