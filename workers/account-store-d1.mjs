/** D1 am Rand. Gegenueber `account-store-local.mjs` ist nur die Datenbank
 *  anders — dieselben vierzehn Methoden, dieselben Helfernamen, dieselbe
 *  Schreibweise. Der Spielstand wird auch hier atomar geschrieben: die
 *  Revision reist in der Bedingung der `UPDATE` mit, statt vorher gelesen zu
 *  werden. Sitzung und Bremse liegen als eigene Tabellen in der Migration
 *  0002, weil zwei Worker keinen gemeinsamen Prozessspeicher haben.
 *
 *  Achtung: D1 hat kein `ALTER TABLE ... IF NOT EXISTS`. Schema und Nachzug
 *  liegen deshalb als Migration in `d1/` — ein Schema, das bei jedem Kaltstart
 *  mitlaeufe, ist ein Schema, das im Streitfall genau einmal laeuft. */
import { ACCOUNT_CONFIG } from '../scripts/server/account-config.mjs';
import { ACCOUNT_COLUMNS, STORAGE_DECISION } from '../scripts/server/storage-contract.mjs';
import { SNAPSHOT_WRITE } from '../src/state/snapshot-rule.js';
import { stateWriteStatement, ticketSteps } from '../scripts/server/state-write.mjs';

const SELECT = `SELECT ${ACCOUNT_COLUMNS.join(', ')} FROM accounts WHERE name = ?`;
const INSERT = `INSERT INTO accounts (name, player_id, playerseed, verifier, salt) VALUES (?, ?, ?, ?, ?)`;
const INSERT_TICKET = 'INSERT INTO raid_tickets (id, account, defender, ticket, expires_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET account = excluded.account, defender = excluded.defender, ticket = excluded.ticket, expires_at = excluded.expires_at';
const SELECT_TICKET = 'SELECT account, ticket FROM raid_tickets WHERE id = ? AND expires_at > ?';
const SELECT_BOOKING = 'SELECT id, account, defender, essence, bloodstone, revision, booked_at FROM raid_bookings WHERE id = ?';
const SELECT_BOOKINGS = 'SELECT id, defender, essence, bloodstone, revision, booked_at FROM raid_bookings WHERE account = ? ORDER BY booked_at DESC, rowid DESC LIMIT 20';

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
  const plan = stateWriteStatement(packed, accountId);
  if (plan.decision) return plan.decision;
  const res = await db.prepare(plan.sql).bind(...plan.args).run();
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

    /** Die Buchung faehrt alle Anweisungen als eine Transaktion: `batch` fasst
     *  sie zusammen, und Quittung und Loeschung haengen an der Revision, die die
     *  erste gerade geschrieben hat — eine abgewiesene Buchung laesst die Zeile
     *  stehen und die Quittung aus. */
    async takeTicket({ accountId, id, packed = null, booking = null }) {
      const plan = ticketSteps({ packed, accountId, ticketId: id, booking });
      if (plan.decision) return plan.decision;
      const steps = [plan.write, plan.quittung, plan.take].filter(Boolean).map((schritt) => db.prepare(schritt.sql).bind(...schritt.args));
      const results = await db.batch(steps);
      const written = plan.write ? (results[0].meta?.changes ?? 0) > 0 : true;
      const quittiert = plan.quittung ? (results[plan.write ? 1 : 0].meta?.changes ?? 0) > 0 : true;
      if (written && quittiert && (results.at(-1).meta?.changes ?? 0) > 0) return SNAPSHOT_WRITE.ok;
      if (!(await this.getAccount(accountId))) return STORAGE_DECISION.noAccount;
      const zeile = await this.getTicket(id);
      return zeile?.account === accountId ? SNAPSHOT_WRITE.stale : STORAGE_DECISION.noTicket;
    },

    async getBooking(id) {
      return (await db.prepare(SELECT_BOOKING).bind(id).first()) ?? null;
    },

    async listBookings(accountId) {
      const answer = await db.prepare(SELECT_BOOKINGS).bind(accountId).all();
      return answer?.results ?? [];
    },

    async putTicket(id, row) {
      await db.prepare('DELETE FROM raid_tickets WHERE expires_at <= ?').bind(Date.now()).run();
      await db.prepare('DELETE FROM raid_tickets WHERE account = ? AND defender = ? AND id != ?').bind(row.account, row.defender, id).run();
      await db.prepare(INSERT_TICKET).bind(id, row.account, row.defender, JSON.stringify(row.ticket), row.expiresAt).run();
      return { id };
    },

    async getTicket(id) {
      const row = await db.prepare(SELECT_TICKET).bind(id, Date.now()).first();
      if (!row) return null;
      try {
        return { account: row.account, ticket: JSON.parse(row.ticket) };
      } catch {
        return null;
      }
    },

    async getSession(token) {
      const row = await db.prepare('SELECT name FROM sessions WHERE token = ? AND expires_at > ?').bind(token, Date.now()).first();
      return row?.name ? { name: row.name } : null;
    },

    async putSession(token, name) {
      const now = Date.now();
      await db.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(now).run();
      await db.prepare('INSERT INTO sessions (token, name, created_at, expires_at) VALUES (?, ?, ?, ?) ON CONFLICT(token) DO UPDATE SET name = excluded.name, created_at = excluded.created_at, expires_at = excluded.expires_at')
        .bind(token, name, now, now + ACCOUNT_CONFIG.sessionTtlMs).run();
      return { name };
    },

    async deleteSession(token) {
      const res = await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
      return (res?.meta?.changes ?? 0) > 0;
    },

    async getAttempt(key) {
      return (await db.prepare('SELECT count, until FROM login_attempts WHERE key = ?').bind(key).first()) ?? null;
    },

    async putAttempt(key, entry) {
      await db.prepare('DELETE FROM login_attempts WHERE until < ?').bind(Date.now()).run();
      await db.prepare('INSERT INTO login_attempts (key, count, until) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET count = excluded.count, until = excluded.until')
        .bind(key, entry.count, entry.until).run();
      return entry;
    },
  };
}
