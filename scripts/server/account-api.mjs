/** Die zwei Befehle der Konto-API. Reine Logik, damit npm run verify sie ohne
 *  Browser und ohne Entwicklungsdatenbank prüfen kann. */
import { accountProblem, normalizeName } from './account-config.mjs';
import { makeAccount, passwordMatches, playerIdOf } from './account-rules.mjs';
import { findAccount, insertAccount } from './account-store.mjs';

function publicOf(account) {
  return { playerId: account.player_id ?? account.playerId, playerseed: account.playerseed, name: account.name };
}

export function register(db, { name, password }) {
  const problem = accountProblem({ name, password });
  if (problem) return { status: 400, error: problem };
  const clean = normalizeName(name);
  if (findAccount(db, clean)) return { status: 409, error: 'Dieser Name ist schon vergeben.' };
  const made = makeAccount({ name: clean, password });
  return { status: 201, ...publicOf(insertAccount(db, { ...made, name: clean, playerId: playerIdOf(made.playerseed) })) };
}

export function login(db, { name, password }) {
  const account = findAccount(db, normalizeName(name));
  if (!account) return { status: 401, error: 'Name oder Passwort stimmt nicht.' };
  if (!passwordMatches({ password, salt: account.salt, verifier: account.verifier })) {
    return { status: 401, error: 'Name oder Passwort stimmt nicht.' };
  }
  return { status: 200, ...publicOf(account) };
}
