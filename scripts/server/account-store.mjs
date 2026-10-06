/** Konten, Spielstand, Sitzung, Bremse, Ticketzeile und Raid-Quittung in SQLite;
 *  derselbe Code laeuft auch gegen D1 (siehe workers/account-store-d1.mjs). */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { ACCOUNT_CONFIG } from './account-config.mjs';
import { SNAPSHOT_WRITE } from '../../src/state/snapshot-rule.js';
import { STORAGE_DECISION } from './storage-contract.mjs';
import { stateWriteStatement, ticketSteps } from './state-write.mjs';

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
    created_at INTEGER,
    expires_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS login_attempts (
    key   TEXT PRIMARY KEY,
    count INTEGER NOT NULL,
    until INTEGER NOT NULL
  );
`;

const TICKET_SCHEMA = `
  CREATE TABLE IF NOT EXISTS raid_tickets (
    id         TEXT PRIMARY KEY,
    account    TEXT NOT NULL,
    defender   TEXT NOT NULL,
    ticket     TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  );
`;

const BOOKING_SCHEMA = `
  CREATE TABLE IF NOT EXISTS raid_bookings (
    id         TEXT PRIMARY KEY,
    account    TEXT NOT NULL,
    defender   TEXT NOT NULL,
    essence    INTEGER NOT NULL,
    bloodstone INTEGER NOT NULL,
    revision   INTEGER NOT NULL,
    booked_at  INTEGER NOT NULL
  );
`;

function ensureColumn(db, { table, name, definition }) {
  if (db.prepare(`PRAGMA table_info(${table})`).all().some((spalte) => spalte.name === name)) return;
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
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
  ensureColumn(db, { table: 'accounts', name: 'state', definition: 'TEXT' });
  ensureColumn(db, { table: 'accounts', name: 'revision', definition: 'INTEGER' });
  db.exec(SIDE_SCHEMA);
  db.exec(TICKET_SCHEMA);
  db.exec(BOOKING_SCHEMA);
  ensureColumn(db, { table: 'sessions', name: 'expires_at', definition: 'INTEGER' });
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
  return findAccount(db, name) ? SNAPSHOT_WRITE.stale : STORAGE_DECISION.noAccount;
}

function lebt(db, { id, account }) {
  return Boolean(db.prepare('SELECT id FROM raid_tickets WHERE id = ? AND account = ? AND expires_at > ?').get(id, account, Date.now()));
}

export function readTicket(db, id) {
  const row = db.prepare('SELECT account, ticket FROM raid_tickets WHERE id = ? AND expires_at > ?').get(id, Date.now());
  if (!row) return null;
  try {
    return { account: row.account, ticket: JSON.parse(row.ticket) };
  } catch {
    return null;
  }
}

/** Ein Paar hat genau ein lebendes Ticket; die Id bleibt je Ausstellung eindeutig. */
export function writeTicket(db, id, row) {
  db.prepare('DELETE FROM raid_tickets WHERE expires_at <= ?').run(Date.now());
  db.prepare('DELETE FROM raid_tickets WHERE account = ? AND defender = ? AND id != ?').run(row.account, row.defender, id);
  db.prepare('INSERT INTO raid_tickets (id, account, defender, ticket, expires_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET account = excluded.account, defender = excluded.defender, ticket = excluded.ticket, expires_at = excluded.expires_at')
    .run(id, row.account, row.defender, JSON.stringify(row.ticket), row.expiresAt);
  return { id };
}

export function readBooking(db, id) {
  return db.prepare('SELECT id, account, defender, essence, bloodstone, revision, booked_at FROM raid_bookings WHERE id = ?').get(id) ?? null;
}

export function readBookings(db, account, limit = 20) {
  return db.prepare('SELECT id, defender, essence, bloodstone, revision, booked_at FROM raid_bookings WHERE account = ? ORDER BY booked_at DESC, rowid DESC LIMIT ?')
    .all(account, limit);
}

/** Erst schreiben, dann quittieren, dann loeschen — oder keins von dreien. */
export function takeTicket(db, { account, id, packed = null, booking = null }) {
  const plan = ticketSteps({ packed, accountId: account, ticketId: id, booking });
  if (plan.decision) return plan.decision;
  db.exec('BEGIN IMMEDIATE');
  try {
    if (plan.write && db.prepare(plan.write.sql).run(...plan.write.args).changes === 0) return abortBooking(db, account, id);
    if (plan.quittung && db.prepare(plan.quittung.sql).run(...plan.quittung.args).changes === 0) return abortBooking(db, account, id);
    if (db.prepare(plan.take.sql).run(...plan.take.args).changes === 0) return abortBooking(db, account, id);
    db.exec('COMMIT');
    return SNAPSHOT_WRITE.ok;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function abortBooking(db, account, id) {
  db.exec('ROLLBACK');
  if (!findAccount(db, account)) return STORAGE_DECISION.noAccount;
  return lebt(db, { id, account }) ? SNAPSHOT_WRITE.stale : STORAGE_DECISION.noTicket;
}

export function readSession(db, token) {
  const row = db.prepare('SELECT name FROM sessions WHERE token = ? AND expires_at > ?').get(token, Date.now());
  return row?.name ? { name: row.name } : null;
}

export function writeSession(db, token, name) {
  const now = Date.now();
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now);
  db.prepare('INSERT INTO sessions (token, name, created_at, expires_at) VALUES (?, ?, ?, ?) ON CONFLICT(token) DO UPDATE SET name = excluded.name, created_at = excluded.created_at, expires_at = excluded.expires_at')
    .run(token, name, now, now + ACCOUNT_CONFIG.sessionTtlMs);
  return { name };
}

export function deleteSession(db, token) {
  return db.prepare('DELETE FROM sessions WHERE token = ?').run(token).changes > 0;
}

export function readAttempt(db, key) {
  return db.prepare('SELECT count, until FROM login_attempts WHERE key = ?').get(key) ?? null;
}

export function writeAttempt(db, key, entry) {
  db.prepare('DELETE FROM login_attempts WHERE until < ?').run(Date.now());
  db.prepare('INSERT INTO login_attempts (key, count, until) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET count = excluded.count, until = excluded.until')
    .run(key, entry.count, entry.until);
  return entry;
}
