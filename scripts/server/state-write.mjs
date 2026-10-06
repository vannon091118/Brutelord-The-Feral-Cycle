/** Die Schreibregel des Spielstands fuer jede Datenbank: die Revision steht in
 *  der Bedingung der Anweisung. Die Buchung bindet dieselbe an die Ticketzeile
 *  und schreibt in derselben Transaktion die Quittung des Raids. */
import { SNAPSHOT_MAX_BYTES, SNAPSHOT_REVISION_FIELD } from '../../src/state/snapshot-config.js';
import { SNAPSHOT_WRITE, envelopeBytes } from '../../src/state/snapshot-rule.js';

const STATE_WRITE_SQL = Object.freeze({
  revisioned: 'UPDATE accounts SET state = ?, revision = ? WHERE name = ? AND (revision IS NULL OR revision < ?)',
  unrevisioned: 'UPDATE accounts SET state = ? WHERE name = ? AND revision IS NULL',
});

const TICKET_SQL = Object.freeze({
  stands: 'EXISTS (SELECT 1 FROM raid_tickets WHERE id = ? AND account = ? AND expires_at > ?)',
  take: 'DELETE FROM raid_tickets WHERE id = ? AND account = ? AND expires_at > ?',
  written: 'EXISTS (SELECT 1 FROM accounts WHERE name = ? AND revision = ?)',
  blank: 'EXISTS (SELECT 1 FROM accounts WHERE name = ? AND revision IS NULL)',
  quittung: 'INSERT INTO raid_bookings (id, account, defender, essence, bloodstone, revision, booked_at) SELECT ?, ?, ?, ?, ?, ?, ?',
});

function revisionOf(packed) {
  const wert = packed?.[SNAPSHOT_REVISION_FIELD];
  return Number.isInteger(wert) ? wert : undefined;
}

/** `{ decision }` heisst zu gross; sonst `{ sql, args }` fuer genau ein `run()`. */

export function stateWriteStatement(packed, accountId) {
  const bytes = envelopeBytes(packed);
  if (!Number.isFinite(bytes) || bytes > SNAPSHOT_MAX_BYTES) return { decision: SNAPSHOT_WRITE.tooLarge };
  const revision = revisionOf(packed);
  const state = JSON.stringify(packed);
  if (revision === undefined) return { sql: STATE_WRITE_SQL.unrevisioned, args: [state, accountId] };
  return { sql: STATE_WRITE_SQL.revisioned, args: [state, revision, accountId, revision] };
}

function guarded(sql, { accountId, revision }, verb) {
  const teil = revision === undefined ? TICKET_SQL.blank : TICKET_SQL.written;
  const args = revision === undefined ? [accountId] : [accountId, revision];
  return { sql: `${sql} ${verb} ${teil}`, args };
}

function takeAfterWrite({ accountId, ticketId, now, revision }) {
  const plan = guarded(TICKET_SQL.take, { accountId, revision }, 'AND');
  return { sql: plan.sql, args: [ticketId, accountId, now, ...plan.args] };
}

function quittungAfterWrite({ accountId, ticketId, now, booking, revision }) {
  const plan = guarded(TICKET_SQL.quittung, { accountId, revision }, 'WHERE');
  return {
    sql: plan.sql,
    args: [ticketId, accountId, booking.defender, booking.essence, booking.bloodstone, revision ?? 0, now, ...plan.args],
  };
}

/** Erst schreiben, dann quittieren, dann loeschen — nur wenn die vorige durchkam. */
export function ticketSteps({ packed = null, accountId, ticketId, now = Date.now(), booking = null } = {}) {
  let write = null;
  let revision;
  if (packed) {
    const plan = stateWriteStatement(packed, accountId);
    if (plan.decision) return { decision: plan.decision };
    revision = revisionOf(packed);
    write = { sql: `${plan.sql} AND ${TICKET_SQL.stands}`, args: [...plan.args, ticketId, accountId, now] };
  }
  const quittung = write && booking ? quittungAfterWrite({ accountId, ticketId, now, booking, revision }) : null;
  const take = write
    ? takeAfterWrite({ accountId, ticketId, now, revision })
    : { sql: TICKET_SQL.take, args: [ticketId, accountId, now] };
  return { write, quittung, take };
}
