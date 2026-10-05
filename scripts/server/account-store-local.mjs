/** Der lokale Speicher: `node:sqlite` in Promises gekleidet. Dieselbe Datei laeuft
 *  in Entwicklung, Dev-Server und Abnahme. Das async macht die Signatur
 *  vergleichbar, nicht die Arbeit nebenlaeufig — B6 in Docs/BACKEND-PLAN.md. */
import { findAccount, insertAccount, openAccounts, readState, writeState } from './account-store.mjs';
import { ACCOUNT_COLUMNS } from './storage-contract.mjs';

/** Nur Spalten der Tabelle sind erlaubt: ein Schluessel wandert sonst in den
 *  SQL-Text, und ein Patch ist Angreiferinhalt. */
function knownFields(patch) {
  return ACCOUNT_COLUMNS.filter((feld) => patch[feld] !== undefined);
}

function withDb(file, run) {
  const db = openAccounts(file);
  try {
    return run(db);
  } finally {
    db.close();
  }
}

function insertIfNew(db, patch) {
  if (!knownFields(patch).includes('name') || patch.verifier === undefined) return;
  insertAccount(db, {
    name: patch.name,
    playerId: patch.player_id,
    playerseed: patch.playerseed,
    verifier: patch.verifier,
    salt: patch.salt,
  });
}

function applyPatch(db, accountId, patch) {
  const aenderbar = knownFields(patch).filter((feld) => feld !== 'name');
  if (!aenderbar.length) return;
  db.prepare(`UPDATE accounts SET ${aenderbar.map((f) => `${f} = ?`).join(', ')} WHERE name = ?`)
    .run(...aenderbar.map((feld) => patch[feld]), accountId);
}

export function createLocalStore({ file } = {}) {
  return {
    async getAccount(accountId) {
      return withDb(file, (db) => findAccount(db, accountId));
    },
    async updateAccount(accountId, patch = {}) {
      return withDb(file, (db) => {
        insertIfNew(db, patch);
        applyPatch(db, accountId, patch);
        return findAccount(db, accountId);
      });
    },
    async getState(accountId) {
      return withDb(file, (db) => readState(db, accountId));
    },
    async putState(accountId, packed) {
      return withDb(file, (db) => writeState(db, accountId, packed) > 0);
    },
  };
}
