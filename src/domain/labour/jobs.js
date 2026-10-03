/**
 * Der Auftrag eines Dunglings: hinlaufen, Hand anlegen, zurücklaufen.
 *
 * Ein Auftrag ist eine kleine Maschine mit fünf Phasen und kennt nur Tiles
 * und Zeiten. Wer die Essenz bezahlt und wer sie bekommt, entscheidet der
 * Takt — der Auftrag selbst kennt keine Ökonomie, nur Wege.
 *
 *   `origin` ist der Ausgangspunkt (Hive oder Extraktor),
 *   `target` das Ziel (Bauplatz oder Hive).
 */
import { JOB_CONFIG } from './job-config.js';

export const JOB_KIND = Object.freeze({
  /** Essenz vom Hive zum Bauplatz bringen. */
  DELIVER: 'DELIVER',
  /** Am Extraktor arbeiten und die Essenz zum Hive tragen. */
  EXTRACT: 'EXTRACT',
});

export const JOB_PHASE = Object.freeze({
  /** Am Ausgangspunkt: eine Essenz aufnehmen. */
  FETCH: 'FETCH',
  /** Am Extraktor: der Zyklus läuft, bis die Essenz reif ist. */
  ATTEND: 'ATTEND',
  /** Mit der Last unterwegs zum Ziel. */
  TRAVEL: 'TRAVEL',
  /** Am Ziel: abladen. */
  WORK: 'WORK',
  /** Leer zurück zum Ausgangspunkt. */
  RETURN: 'RETURN',
});

export const JOB_EVENT = Object.freeze({
  /** Essenz verlässt den Vorrat des Hive. */
  PICKED: 'PICKED',
  /** Am Extraktor ist eine Essenz entstanden. */
  PRODUCED: 'PRODUCED',
  /** Essenz ist angekommen — am Bauplatz oder am Hive. */
  DEPOSITED: 'DEPOSITED',
  /** Der Auftrag ist abgeschlossen, der Dungling wieder frei. */
  FINISHED: 'FINISHED',
});

function travelMs(from, to, config) {
  const distance = Math.max(1, Math.abs(from.x - to.x) + Math.abs(from.y - to.y));
  return distance * config.travelMsPerTile;
}

function standing({ kind, buildingId, phase, origin, target, durationMs }) {
  return {
    kind,
    buildingId,
    phase,
    progressMs: 0,
    durationMs,
    origin: { ...origin },
    target: { ...target },
    /** Trägt er gerade eine Essenz? Der Träger ist sichtbar, die Last auch. */
    carrying: 0,
  };
}

/** Essenz holen, hintragen, abladen, leer zurück. */
export function createDeliverJob({ buildingId, origin, target, config = JOB_CONFIG }) {
  return standing({
    kind: JOB_KIND.DELIVER,
    buildingId,
    phase: JOB_PHASE.FETCH,
    origin,
    target,
    durationMs: config.workMs,
  });
}

/** Am Extraktor warten, bis die Essenz reif ist — dann trägt er sie zum Hive. */
export function createExtractJob({ buildingId, origin, target, config = JOB_CONFIG }) {
  return standing({
    kind: JOB_KIND.EXTRACT,
    buildingId,
    phase: JOB_PHASE.ATTEND,
    origin,
    target,
    durationMs: config.cycleMs,
  });
}

/**
 * Ein Takt Zeit vergeht. Rückgabe: der neue Auftrag und das Ereignis, das
 * genau an dieser Phasengrenze fällig ist — oder null.
 */
export function advanceJob(job, dtMs, config = JOB_CONFIG) {
  if (!job) return { job: null, event: null };
  const progressMs = Math.min(job.durationMs, job.progressMs + dtMs);
  if (progressMs < job.durationMs) return { job: { ...job, progressMs }, event: null };
  return nextPhase(job, config);
}

function nextPhase(job, config) {
  switch (job.phase) {
    case JOB_PHASE.FETCH:
      return leg(job, config, { carrying: 1, event: JOB_EVENT.PICKED });
    case JOB_PHASE.ATTEND:
      return leg(job, config, { carrying: 1, event: JOB_EVENT.PRODUCED });
    case JOB_PHASE.TRAVEL:
      return { job: { ...job, phase: JOB_PHASE.WORK, progressMs: 0, durationMs: config.workMs }, event: null };
    case JOB_PHASE.WORK:
      return leg(job, config, { phase: JOB_PHASE.RETURN, carrying: 0, event: JOB_EVENT.DEPOSITED });
    case JOB_PHASE.RETURN:
      return afterReturn(job, config);
    default:
      return { job, event: null };
  }
}

/** Der Weg einer Phase — vorwärts zum Ziel, rückwärts zum Ausgangspunkt. */
function leg(job, config, { phase = JOB_PHASE.TRAVEL, carrying = 0, event = null } = {}) {
  const [from, to] = phase === JOB_PHASE.RETURN ? [job.target, job.origin] : [job.origin, job.target];
  return {
    job: { ...job, phase, progressMs: 0, durationMs: travelMs(from, to, config), carrying },
    event,
  };
}

/** Ein Extraktor bindet seinen Dungling dauerhaft; jede andere Last endet hier. */
function afterReturn(job, config) {
  if (job.kind !== JOB_KIND.EXTRACT) return { job: null, event: JOB_EVENT.FINISHED };
  return {
    job: { ...job, phase: JOB_PHASE.ATTEND, progressMs: 0, durationMs: config.cycleMs, carrying: 0 },
    event: null,
  };
}

/**
 * Wo der Dungling zwischen zwei Tiles steht — die Darstellung interpoliert
 * daraus seinen Lauf, statt ihn springen zu lassen.
 */
export function jobTrip(job) {
  if (!job) return null;
  if (job.phase === JOB_PHASE.TRAVEL) return trip(job.origin, job.target, job);
  if (job.phase === JOB_PHASE.RETURN) return trip(job.target, job.origin, job);
  const at = job.phase === JOB_PHASE.WORK ? job.target : job.origin;
  return { from: at, to: at, progress: 0 };
}

function trip(from, to, job) {
  return { from, to, progress: Math.min(1, job.progressMs / job.durationMs) };
}
