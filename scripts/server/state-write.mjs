/** Die Schreibregel des Spielstands fuer jede Datenbank: Groesse und monotone
 *  Revision. Dieselbe Regel und dieselbe Obergrenze wie im Client, damit ein
 *  Server nicht anders urteilt als das Spiel. Ein Stand ohne Revision darf
 *  schreiben, solange kein revisionierter Stand liegt — sonst wuerde der erste
 *  Schreibvorgang eines Kontos an seiner eigenen Neuheit scheitern. */
import { SNAPSHOT_MAX_BYTES, SNAPSHOT_REVISION_FIELD } from '../../src/state/snapshot-config.js';
import { envelopeBytes, writeDecision } from '../../src/state/snapshot-rule.js';

export function revisionOf(packed) {
  const wert = packed?.[SNAPSHOT_REVISION_FIELD];
  return Number.isInteger(wert) ? wert : undefined;
}

export function stateWriteDecision(packed, current) {
  return writeDecision({
    bytes: envelopeBytes(packed),
    storedRevision: revisionOf(current),
    incomingRevision: revisionOf(packed),
    maxBytes: SNAPSHOT_MAX_BYTES,
  });
}
