/** Die Einreichung pruefen: zuerst die Laenge, dann das Replay, dann der Vergleich.
 *  Das ist Rechnung und kein Speicher — die Begruendung steht als B3 in
 *  Docs/BACKEND-PLAN.md. Beide Speicher benutzen diese eine Funktion. */
import { replayMatches, replayOverflow, replayRaid } from '../../src/domain/raid/raid-replay.js';
import { RAID_CONFIG } from '../../src/domain/raid/raid-config.js';

export const REJECT = Object.freeze({
  TOO_LONG: 'Das Log ist länger als erlaubt.',
  BROKEN: 'Das Log lässt sich nicht nachspielen.',
  MISMATCH: 'Das Ergebnis passt nicht zum Log.',
});

/** Rueckgabe: `{ ok: true, state }` oder `{ ok: false, reason }`. Kein Wurf —
 *  eine Einreichung, die durchfaellt, ist ein Ergebnis und kein Fehler. */
export function validateRaidReplay(raidLog = {}) {
  try {
    const { ticket, claimed, actions = [] } = raidLog;
    if (!ticket || !claimed) return { ok: false, reason: REJECT.BROKEN };
    if (replayOverflow(actions)) return { ok: false, reason: REJECT.TOO_LONG, limit: RAID_CONFIG.maxActions };
    if (!replayMatches({ ticket, actions, claimed })) return { ok: false, reason: REJECT.MISMATCH };
    return { ok: true, state: replayRaid({ ticket, actions }) };
  } catch {
    return { ok: false, reason: REJECT.BROKEN };
  }
}
