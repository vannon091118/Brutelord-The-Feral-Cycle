/** Konto-Regeln: eine Quelle für Normalisierung, Schlüssel und Grenzen. */
export const ACCOUNT_CONFIG = Object.freeze({
  dbFile: 'accounts.db',
  nameMin: 3,
  nameMax: 24,
  passwordMin: 8,
  seedHex: 16,
  idPrefix: 'p-',
  saltBytes: 16,
  keyBytes: 32,
  scrypt: Object.freeze({ N: 16384, r: 8, p: 1 }),
});

export function normalizeName(name) {
  return String(name ?? '').trim().toLowerCase();
}

export function accountProblem({ name, password }) {
  const clean = normalizeName(name);
  if (clean.length < ACCOUNT_CONFIG.nameMin || clean.length > ACCOUNT_CONFIG.nameMax) {
    return `Der Name braucht ${ACCOUNT_CONFIG.nameMin} bis ${ACCOUNT_CONFIG.nameMax} Zeichen.`;
  }
  if (!/^[a-z0-9._-]+$/.test(clean)) return 'Der Name kennt nur Buchstaben, Zahlen, Punkt, Strich und Unterstrich.';
  if (String(password ?? '').length < ACCOUNT_CONFIG.passwordMin) {
    return `Das Passwort braucht mindestens ${ACCOUNT_CONFIG.passwordMin} Zeichen.`;
  }
  return null;
}
