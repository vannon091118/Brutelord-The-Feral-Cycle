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
