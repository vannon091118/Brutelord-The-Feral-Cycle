/** Der lokale Speicher: `node:sqlite` in Promises gekleidet. Dieselbe Datei laeuft
 *  in Entwicklung, Dev-Server und Abnahme. Das async macht die Signatur
 *  vergleichbar, nicht die Arbeit nebenlaeufig — B6 in Docs/BACKEND-PLAN.md. */
import { deleteSession, findAccount, insertAccount, openAccounts, readAttempt, readBooking, readBookings, readSession, readState, readTicket, takeTicket, writeAttempt, writeSession, writeState, writeTicket } from './account-store.mjs';
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

function accountMethods(file) {
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
      return withDb(file, (db) => writeState(db, accountId, packed));
    },
  };
}

function ticketMethods(file) {
  return {
    async putTicket(id, row) {
      return withDb(file, (db) => writeTicket(db, id, row));
    },
    async getTicket(id) {
      return withDb(file, (db) => readTicket(db, id));
    },
    async takeTicket({ accountId, id, packed = null, booking = null }) {
      return withDb(file, (db) => takeTicket(db, { account: accountId, id, packed, booking }));
    },
    async getBooking(id) {
      return withDb(file, (db) => readBooking(db, id));
    },
    async listBookings(accountId) {
      return withDb(file, (db) => readBookings(db, accountId));
    },
  };
}

function sessionMethods(file) {
  return {
    async getSession(token) {
      return withDb(file, (db) => readSession(db, token));
    },
    async putSession(token, name) {
      return withDb(file, (db) => writeSession(db, token, name));
    },
    async deleteSession(token) {
      return withDb(file, (db) => deleteSession(db, token));
    },
    async getAttempt(key) {
      return withDb(file, (db) => readAttempt(db, key));
    },
    async putAttempt(key, entry) {
      return withDb(file, (db) => writeAttempt(db, key, entry));
    },
  };
}

export function createLocalStore({ file } = {}) {
  return { ...accountMethods(file), ...ticketMethods(file), ...sessionMethods(file) };
}
