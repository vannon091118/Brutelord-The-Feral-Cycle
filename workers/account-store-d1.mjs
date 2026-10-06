/** D1 am Rand. Gegenueber `account-store-local.mjs` ist nur die Datenbank
 *  anders — dieselben acht Methoden, dieselben Helfernamen, dieselbe
 *  Schreibweise. Der Spielstand wird auch hier atomar geschrieben: die
 *  Revision reist in der Bedingung der `UPDATE` mit, statt vorher gelesen zu
 *  werden. Sitzung und Bremse liegen als eigene Tabellen in der Migration
 *  0002, weil zwei Worker keinen gemeinsamen Prozessspeicher haben.
 *
 *  Achtung: D1 hat kein `ALTER TABLE ... IF NOT EXISTS`. Schema und Nachzug
 *  liegen deshalb als Migration in `d1/` — ein Schema, das bei jedem Kaltstart
 *  mitlaeufe, ist ein Schema, das im Streitfall genau einmal laeuft. */
import { ACCOUNT_COLUMNS } from '../scripts/server/storage-contract.mjs';
import { SNAPSHOT_WRITE } from '../src/state/snapshot-rule.js';
import { stateWriteArgs, stateWritePlan } from '../scripts/server/state-write.mjs';

const SELECT = `SELECT ${ACCOUNT_COLUMNS.join(', ')} FROM accounts WHERE name = ?`;
const INSERT = `INSERT INTO accounts (name, player_id, playerseed, verifier, salt) VALUES (?, ?, ?, ?, ?)`;

/** Nur Spalten der Tabelle sind erlaubt: ein Schluessel wandert sonst in den
 *  SQL-Text, und ein Patch ist Angreiferinhalt. */
function knownFields(patch) {
  return ACCOUNT_COLUMNS.filter((feld) => patch[feld] !== undefined);
}

/** Ohne diesen Schritt bliebe das erste Konto leer: `register()` schreibt ein
 *  neues Konto ueber `updateAccount()`, und ein `UPDATE` auf eine Zeile, die es
 *  noch nicht gibt, aendert null Zeilen. */
async function insertIfNew(db, patch) {
  if (!knownFields(patch).includes('name') || patch.verifier === undefined) return;
  await db.prepare(INSERT).bind(patch.name, patch.player_id, patch.playerseed, patch.verifier, patch.salt).run();
}

async function applyPatch(db, accountId, patch) {
  const aenderbar = knownFields(patch).filter((feld) => feld !== 'name');
  if (!aenderbar.length) return;
  await db.prepare(`UPDATE accounts SET ${aenderbar.map((f) => `${f} = ?`).join(', ')} WHERE name = ?`)
    .bind(...aenderbar.map((feld) => patch[feld]), accountId)
    .run();
}

async function writePacked(db, accountId, packed) {
  const plan = stateWritePlan(packed);
  if (plan.decision !== SNAPSHOT_WRITE.ok) return plan.decision;
  const { sql, args } = stateWriteArgs(packed, accountId, plan.revision);
  const res = await db.prepare(sql).bind(...args).run();
  if ((res?.meta?.changes ?? 0) > 0) return SNAPSHOT_WRITE.ok;
  const row = await db.prepare('SELECT name FROM accounts WHERE name = ?').bind(accountId).first();
  return row ? SNAPSHOT_WRITE.stale : 'kein konto';
}

export function createD1Store(env) {
  const db = env?.DB;
  if (!db?.prepare) throw new Error('D1-Bindung DB fehlt.');
  return {
    async getAccount(accountId) {
      return (await db.prepare(SELECT).bind(accountId).first()) ?? null;
    },

    async updateAccount(accountId, patch = {}) {
      if (!(await this.getAccount(accountId))) await insertIfNew(db, patch);
      await applyPatch(db, accountId, patch);
      return this.getAccount(accountId);
    },

    async getState(accountId) {
      const row = await db.prepare('SELECT state FROM accounts WHERE name = ?').bind(accountId).first();
      if (!row?.state) return null;
      try {
        return JSON.parse(row.state);
      } catch {
        return null;
      }
    },

    async putState(accountId, packed) {
      return writePacked(db, accountId, packed);
    },

    async getSession(token) {
      const row = await db.prepare('SELECT name FROM sessions WHERE token = ?').bind(token).first();
      return row?.name ? { name: row.name } : null;
    },

    async putSession(token, name) {
      await db.prepare('INSERT INTO sessions (token, name, created_at) VALUES (?, ?, ?) ON CONFLICT(token) DO UPDATE SET name = excluded.name')
        .bind(token, name, Date.now()).run();
      return { name };
    },

    async getAttempt(key) {
      return (await db.prepare('SELECT count, until FROM login_attempts WHERE key = ?').bind(key).first()) ?? null;
    },

    async putAttempt(key, entry) {
      await db.prepare('INSERT INTO login_attempts (key, count, until) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET count = excluded.count, until = excluded.until')
        .bind(key, entry.count, entry.until).run();
      return entry;
    },
  };
}
