// @doc: docs/daten/state/snapshot-rule.md#snapshot-rule
export const SNAPSHOT_WRITE = Object.freeze({
  ok: 'ok',
  tooLarge: 'zu gross',
  stale: 'veraltet',
});

export function envelopeBytes(envelope) {
  return JSON.stringify(envelope ?? null).length;
}

export function writeDecision({ bytes, storedRevision, incomingRevision, maxBytes }) {
  if (!Number.isFinite(bytes) || bytes > maxBytes) return SNAPSHOT_WRITE.tooLarge;
  const gesichert = Number.isInteger(storedRevision);
  const kommt = Number.isInteger(incomingRevision);
  if (gesichert && !kommt) return SNAPSHOT_WRITE.stale;
  if (gesichert && kommt && incomingRevision <= storedRevision) return SNAPSHOT_WRITE.stale;
  return SNAPSHOT_WRITE.ok;
}
