/** Die Konten liegen in SQLite. Das Schema ist plain SQL, damit derselbe Code
 *  später auch gegen eine Cloudflare-D1-Datenbank läuft. */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { ACCOUNT_CONFIG } from './account-config.mjs';

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS accounts (
    name       TEXT PRIMARY KEY,
    player_id  TEXT NOT NULL,
    playerseed TEXT NOT NULL,
    verifier   TEXT NOT NULL,
    salt       TEXT NOT NULL
  );
`;

/** Der Spielstand kam spaeter dazu. `IF NOT EXISTS` auf der Spalte gab es
 *  nicht, also wird sie einmal nachgezogen, wenn sie fehlt — sonst waere ein
 *  Konto, das vor dem Upgrade entstand, unlesbar. */
function ensureStateColumn(db) {
  const spalten = db.prepare('PRAGMA table_info(accounts)').all();
  if (spalten.some((spalte) => spalte.name === 'state')) return;
  db.exec('ALTER TABLE accounts ADD COLUMN state TEXT');
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
  ensureStateColumn(db);
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
  return db.prepare('UPDATE accounts SET state = ? WHERE name = ?').run(JSON.stringify(packed), name).changes;
}
