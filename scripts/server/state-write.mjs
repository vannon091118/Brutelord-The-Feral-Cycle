/** Die Schreibregel des Spielstands fuer jede Datenbank: Groesse und monotone
 *  Revision, dieselbe Anweisung in beiden Speichern. Die Groesse rechnet der
 *  Bau vorher, die Revision steckt in der Bedingung der Anweisung — pruefen
 *  und schreiben in einem Schritt. */
import { SNAPSHOT_MAX_BYTES, SNAPSHOT_REVISION_FIELD } from '../../src/state/snapshot-config.js';
import { SNAPSHOT_WRITE, envelopeBytes } from '../../src/state/snapshot-rule.js';

const STATE_WRITE_SQL = Object.freeze({
  revisioned: 'UPDATE accounts SET state = ?, revision = ? WHERE name = ? AND (revision IS NULL OR revision < ?)',
  unrevisioned: 'UPDATE accounts SET state = ? WHERE name = ? AND revision IS NULL',
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
