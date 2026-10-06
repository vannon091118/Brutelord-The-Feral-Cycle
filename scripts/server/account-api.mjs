/** Die drei Befehle der Konto-API, async gegen den Speicher und nicht gegen die
 *  Datenbank. Anmelden und Registrieren geben einen Traeger-Token aus: die
 *  Antwort nennt weiter Name, PlayerID und Seed, aber wer jemand ist, entscheidet
 *  der Token. Das Abmelden entwertet ihn, und danach traegt er keinen Namen
 *  mehr. Die Bremse zaehlt im Speicher des Kontos, nicht im Prozess. */
import { accountProblem, normalizeName } from './account-config.mjs';
import { decoyMatches, makeAccount, newPlayerId, passwordMatches } from './account-rules.mjs';
import { lockedUntil, nextEntry, throttleKey } from './account-throttle.mjs';
import { endSession, startSession } from './account-session.mjs';

const LOCKED = 'Zu viele Versuche. Warte einen Moment.';
const WRONG = 'Name oder Passwort stimmt nicht.';
const TAKEN = 'Dieser Name ist schon vergeben.';

function publicOf(account, token) {
  return { playerId: account.player_id, playerseed: account.playerseed, name: account.name, token };
}

async function gesperrt(store, key, now) {
  return lockedUntil(await store.getAttempt(key), now) > now;
}

async function zaehleFehlversuch(store, key, now) {
  await store.putAttempt(key, nextEntry(await store.getAttempt(key), now));
  return { status: 401, error: WRONG };
}

export async function register(store, { body = {}, remote = '' } = {}) {
  const now = Date.now();
  const problem = accountProblem(body);
  if (problem) return { status: 400, error: problem };
  const clean = normalizeName(body.name);
  const key = throttleKey({ name: clean, remote });
  if (await gesperrt(store, key, now)) return { status: 429, error: LOCKED };
  if (await store.getAccount(clean)) return { ...(await zaehleFehlversuch(store, key, now)), status: 409, error: TAKEN };
  const made = makeAccount({ name: clean, password: body.password });
  await store.putAttempt(key, { count: 0, until: 0 });
  const gespeichert = await store.updateAccount(clean, { ...made, name: clean, player_id: newPlayerId() });
  return { status: 201, ...publicOf(gespeichert, await startSession(store, clean)) };
}

export async function login(store, { body = {}, remote = '' } = {}) {
  const now = Date.now();
  const clean = normalizeName(body.name);
  const key = throttleKey({ name: clean, remote });
  if (await gesperrt(store, key, now)) return { status: 429, error: LOCKED };
  const account = await store.getAccount(clean);
  const whole = !accountProblem({ name: clean, password: body.password });
  const matches = account && whole
    ? passwordMatches({ password: body.password, salt: account.salt, verifier: account.verifier })
    : decoyMatches(String(body.password ?? ''));
  if (!account || !whole || !matches) return zaehleFehlversuch(store, key, now);
  await store.putAttempt(key, { count: 0, until: 0 });
  return { status: 200, ...publicOf(account, await startSession(store, clean)) };
}

export async function logout(store, { token = '' } = {}) {
  await endSession(store, token);
  return { status: 200, ok: true };
}