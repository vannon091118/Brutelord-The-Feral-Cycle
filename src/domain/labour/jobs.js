/** Der Auftrag eines Dunglings: fünf Phasen, Wege und Zeiten. */
import { JOB_CONFIG } from './job-config.js';

export const JOB_KIND = Object.freeze({
  DELIVER: 'DELIVER',
  EXTRACT: 'EXTRACT',
});

export const JOB_PHASE = Object.freeze({
  FETCH: 'FETCH',
  ATTEND: 'ATTEND',
  TRAVEL: 'TRAVEL',
  WORK: 'WORK',
  RETURN: 'RETURN',
});

export const JOB_EVENT = Object.freeze({
  PICKED: 'PICKED',
  PRODUCED: 'PRODUCED',
  DEPOSITED: 'DEPOSITED',
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
    carrying: 0,
  };
}

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

function leg(job, config, { phase = JOB_PHASE.TRAVEL, carrying = 0, event = null } = {}) {
  const [from, to] = phase === JOB_PHASE.RETURN ? [job.target, job.origin] : [job.origin, job.target];
  return {
    job: { ...job, phase, progressMs: 0, durationMs: travelMs(from, to, config), carrying },
    event,
  };
}

function afterReturn(job, config) {
  if (job.kind !== JOB_KIND.EXTRACT) return { job: null, event: JOB_EVENT.FINISHED };
  return {
    job: { ...job, phase: JOB_PHASE.ATTEND, progressMs: 0, durationMs: config.cycleMs, carrying: 0 },
    event: null,
  };
}

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
