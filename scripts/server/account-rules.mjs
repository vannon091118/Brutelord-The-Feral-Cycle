/** Schlüssel aus einem Passwort: scrypt einmal, zwei Ausgaben daraus. Das
 *  Passwort selbst verlässt diese Datei nie, und der Seed ist so aus denselben
 *  Zugangsdaten abgeleitet, dass derselbe Login dieselbe Welt liefert. */
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { ACCOUNT_CONFIG } from './account-config.mjs';

/** Ein Aufruf scrypt, 64 Byte: 32 für den Vergleich, 32 für den Spielerseed. */
function derive(password, salt) {
  const both = scryptSync(password, salt, ACCOUNT_CONFIG.keyBytes * 2, ACCOUNT_CONFIG.scrypt);
  return { verifier: both.subarray(0, ACCOUNT_CONFIG.keyBytes), seed: both.subarray(ACCOUNT_CONFIG.keyBytes) };
}

export function newSalt() {
  return randomBytes(ACCOUNT_CONFIG.saltBytes).toString('hex');
}

export function makeAccount({ name, password }) {
  const salt = newSalt();
  const { verifier, seed } = derive(password, salt);
  return {
    salt,
    verifier: verifier.toString('hex'),
    playerseed: seed.toString('hex').slice(0, ACCOUNT_CONFIG.seedHex),
  };
}

export function passwordMatches({ password, salt, verifier }) {
  const stored = Buffer.from(verifier, 'hex');
  const fresh = derive(password, salt).verifier;
  return stored.length === fresh.length && timingSafeEqual(stored, fresh);
}

/** Die PlayerID ist der Seed, verkürzt und markiert — keine zweite Identität. */
export function playerIdOf(playerseed) {
  return `${ACCOUNT_CONFIG.idPrefix}${String(playerseed).slice(0, 8)}`;
}
