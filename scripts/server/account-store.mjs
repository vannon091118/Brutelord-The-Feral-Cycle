/** Die Konten, die Sitzung und die Bremse liegen in SQLite; derselbe Code
 *  laeuft auch gegen D1. Der Spielstand wird atomar geschrieben — die Revision
 *  steht als Spalte da und wird in der Bedingung der Anweisung geprueft. */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { ACCOUNT_CONFIG } from './account-config.mjs';
import { SNAPSHOT_WRITE } from '../../src/state/snapshot-rule.js';
import { stateWriteStatement } from './state-write.mjs';

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS accounts (
    name       TEXT PRIMARY KEY,
    player_id  TEXT NOT NULL,
    playerseed TEXT NOT NULL,
    verifier   TEXT NOT NULL,
    salt       TEXT NOT NULL
  );
`;

const SIDE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    created_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS login_attempts (
    key   TEXT PRIMARY KEY,
    count INTEGER NOT NULL,
    until INTEGER NOT NULL
  );
`;

function ensureColumn(db, name, definition) {
  if (db.prepare('PRAGMA table_info(accounts)').all().some((spalte) => spalte.name === name)) return;
  db.exec(`ALTER TABLE accounts ADD COLUMN ${name} ${definition}`);
}

export function dataDir() {
  return process.env.DL_DATA_DIR ?? join(process.cwd(), '.data');
}

export function databasePath() {
  return join(dataDir(), ACCOUNT_CONFIG.dbFile);
}

export function openAccounts(file = databasePath()) {
  mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(SCHEMA);
  ensureColumn(db, 'state', 'TEXT');
  ensureColumn(db, 'revision', 'INTEGER');
  db.exec(SIDE_SCHEMA);
  return db;
}

export function findAccount(db, name) {
  return db.prepare('SELECT name, player_id, playerseed, verifier, salt FROM accounts WHERE name = ?').get(name) ?? null;
}

export function insertAccount(db, account) {
  db.prepare('INSERT INTO accounts (name, player_id, playerseed, verifier, salt) VALUES (?, ?, ?, ?, ?)').run(
    account.name,
    account.playerId,
    account.playerseed,
    account.verifier,
    account.salt,
  );
  return account;
}

export function countAccounts(db) {
  return db.prepare('SELECT COUNT(*) AS n FROM accounts').get().n;
}

export function readState(db, name) {
  const row = db.prepare('SELECT state FROM accounts WHERE name = ?').get(name);
  if (!row?.state) return null;
  try {
    return JSON.parse(row.state);
  } catch {
    return null;
  }
}

export function writeState(db, name, packed) {
  const plan = stateWriteStatement(packed, name);
  if (plan.decision) return plan.decision;
  const changes = db.prepare(plan.sql).run(...plan.args).changes;
  if (changes > 0) return SNAPSHOT_WRITE.ok;
  return findAccount(db, name) ? SNAPSHOT_WRITE.stale : 'kein konto';
}

export function readSession(db, token) {
  const row = db.prepare('SELECT name FROM sessions WHERE token = ?').get(token);
  return row?.name ? { name: row.name } : null;
}

export function writeSession(db, token, name) {
  db.prepare('INSERT INTO sessions (token, name, created_at) VALUES (?, ?, ?) ON CONFLICT(token) DO UPDATE SET name = excluded.name')
    .run(token, name, Date.now());
  return { name };
}

export function readAttempt(db, key) {
  return db.prepare('SELECT count, until FROM login_attempts WHERE key = ?').get(key) ?? null;
}

export function writeAttempt(db, key, entry) {
  db.prepare('INSERT INTO login_attempts (key, count, until) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET count = excluded.count, until = excluded.until')
    .run(key, entry.count, entry.until);
  return entry;
}
