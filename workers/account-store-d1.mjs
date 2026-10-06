/** D1 am Rand. Gegenueber `account-store-local.mjs` ist nur die Datenbank
 *  anders — dieselben vier Methoden, dieselben Helfernamen, dieselbe
 *  Schreibweise. Wer die zwei vergleicht, sieht genau die Stellen, an denen
 *  eine Datenbank ihre eigene Sprache spricht: vorbereitete Saetze, `.bind()`,
 *  und ein Handle, das wirklich existieren muss.
 *
 *  Achtung: D1 hat kein `ALTER TABLE ... IF NOT EXISTS`. Das Schema liegt
 *  deshalb als Migration in `d1/0001-accounts.sql` — ein Schema, das bei jedem
 *  Kaltstart mitlaeuft, ist ein Schema, das im Streitfall genau einmal laeuft. */
import { ACCOUNT_COLUMNS } from '../scripts/server/storage-contract.mjs';
import { SNAPSHOT_WRITE } from '../src/state/snapshot-rule.js';
import { stateWriteDecision } from '../scripts/server/state-write.mjs';

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
      const entscheidung = stateWriteDecision(packed, await this.getState(accountId));
      if (entscheidung !== SNAPSHOT_WRITE.ok) return entscheidung;
      const res = await db.prepare('UPDATE accounts SET state = ? WHERE name = ?')
        .bind(JSON.stringify(packed), accountId)
        .run();
      return (res?.meta?.changes ?? 0) > 0 ? SNAPSHOT_WRITE.ok : 'kein konto';
    },
  };
}
