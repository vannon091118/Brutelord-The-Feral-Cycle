/** D1 am Rand. Gegenueber `account-store-local.mjs` ist nur die Datenbank
 *  anders — dieselben vier Methoden, dieselbe Schreibweise. Wer die zwei
 *  vergleicht, sieht genau die Stellen, an denen eine Datenbank ihre eigene
 *  Sprache spricht: vorbereitete Saetze, `.bind()`, und ein Handle, das
 *  wirklich existieren muss.
 *
 *  Achtung fuer spaeter: D1 hat kein `ALTER TABLE ... IF NOT EXISTS`. Das
 *  Schema gehoert als Migration in `d1/` neben diese Datei, nicht in einen
 *  Aufruf beim Start — ein Schema, das bei jedem Kaltstart mitlaeuft, ist ein
 *  Schema, das im Streitfall genau einmal laeuft. */
import { ACCOUNT_COLUMNS } from '../scripts/server/storage-contract.mjs';

const SELECT = `SELECT ${ACCOUNT_COLUMNS.join(', ')} FROM accounts WHERE name = ?`;

export function createD1Store(env) {
  const db = env?.DB;
  if (!db?.prepare) throw new Error('D1-Bindung DB fehlt.');
  return {
    async getAccount(accountId) {
      return (await db.prepare(SELECT).bind(accountId).first()) ?? null;
    },

    async updateAccount(accountId, patch = {}) {
      const felder = Object.keys(patch).filter((key) => ACCOUNT_COLUMNS.includes(key));
      if (felder.length) {
        const werte = felder.map((feld) => patch[feld]);
        await db.prepare(`UPDATE accounts SET ${felder.map((f) => `${f} = ?`).join(', ')} WHERE name = ?`)
          .bind(...werte, accountId)
          .run();
      }
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
      const res = await db.prepare('UPDATE accounts SET state = ? WHERE name = ?')
        .bind(JSON.stringify(packed), accountId)
        .run();
      return (res?.meta?.changes ?? 0) > 0;
    },
  };
}
