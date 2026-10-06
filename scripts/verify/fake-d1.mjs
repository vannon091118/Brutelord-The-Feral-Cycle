/** Die D1-Bindung als Attrappe ueber `node:sqlite`: dieselben Aufrufe wie im
 *  Worker (`prepare`, `bind`, `first`, `run`, `all`, `batch`) und die echten
 *  Migrationen aus `workers/d1/` als Schema. Ehrliche Grenze: sie beweist die
 *  Entscheidungslogik und die Vertraeglichkeit der Anweisungen, nicht die
 *  Isolation und das Nebenlaeufigkeitsverhalten der echten D1. */
import { readdirSync, readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const MIGRATIONEN = fileURLToPath(new URL('../../workers/d1/', import.meta.url));

function schemaAnweisungen() {
  return readdirSync(MIGRATIONEN)
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .map((name) => readFileSync(`${MIGRATIONEN}${name}`, 'utf8'));
}

function gebunden(db, sql, args) {
  return {
    async first() {
      return db.prepare(sql).get(...args) ?? null;
    },
    async run() {
      return { success: true, meta: { changes: db.prepare(sql).run(...args).changes } };
    },
    async all() {
      return { success: true, results: db.prepare(sql).all(...args) };
    },
  };
}

async function transaktion(db, statements) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const results = [];
    for (const statement of statements) results.push(await statement.run());
    db.exec('COMMIT');
    return results;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function fakeD1() {
  const db = new DatabaseSync(':memory:');
  for (const sql of schemaAnweisungen()) db.exec(sql);
  return {
    prepare(sql) {
      return {
        bind(...args) {
          return gebunden(db, sql, args);
        },
      };
    },
    batch: (statements) => transaktion(db, statements),
    async exec(sql) {
      db.exec(sql);
      return { count: 0, duration: 0 };
    },
    zaehle(sql, ...args) {
      return db.prepare(sql).get(...args);
    },
  };
}
