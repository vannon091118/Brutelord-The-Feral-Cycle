// @doc: docs/daten/labour/work-tick.md#work-tick
import {
  JOB_EVENT,
  JOB_KIND,
  JOB_PHASE,
  advanceJob,
  createDeliverJob,
  createExtractJob,
} from './jobs.js';
import { JOB_CONFIG } from './job-config.js';
import {
  BUILDING_STATE,
  BUILDING_TYPE,
  MAX_DUNGLINGS,
  buildingDef,
} from '../buildings/building-config.js';
import { deliverToSite, openSites, settleSite } from '../buildings/building.js';
import { createDungling, idle, nextDunglingId, withJob } from '../entities/dungling.js';
import { tickScale, unitEffects } from '../brutelord/stone-effects.js';

export function advanceWork(work, dtMs, config = JOB_CONFIG) {
  const staffed = staffWorkers(work, config);
  const working = advanceWorkers(staffed, dtMs, config);
  const grown = advanceBuildings(working, dtMs);
  return {
    essence: grown.essence,
    dunglings: grown.dunglings,
    buildings: grown.buildings.map(settleSite),
    popups: agePopups(grown.popups, dtMs, config),
    popupSeq: grown.popupSeq,
  };
}

export function isStationJob(job) {
  return job?.kind === JOB_KIND.EXTRACT;
}

export function hasWork(work) {
  if (work.popups.length > 0) return true;
  if (work.dunglings.some((worker) => worker.job)) return true;
  if (work.buildings.some(isBusy)) return true;
  return openSites(work.buildings).length > 0 && work.essence > 0;
}

function isBusy(building) {
  return building.workers.length > 0 || Boolean(buildingDef(building.type).spawnEveryMs);
}

function advanceWorkers(work, dtMs, config) {
  let context = work;
  const dunglings = work.dunglings.map((worker) => {
    const step = advanceJob(worker.job, dtMs * tickScale(worker, work.dunglings), config);
    if (step.event) context = applyEvent(context, step.event, { job: worker.job, worker });
    return withJob(worker, step.job);
  });
  return { ...context, dunglings };
}

function applyEvent(work, event, { job, worker }) {
  if (event === JOB_EVENT.PICKED) return { ...work, essence: Math.max(0, work.essence - 1) };
  if (event !== JOB_EVENT.DEPOSITED) return work;
  const landed = addPopup(work, job);
  if (job.kind === JOB_KIND.EXTRACT) return { ...landed, essence: landed.essence + 1 + unitEffects(worker).carryBonus };
  return {
    ...landed,
    buildings: landed.buildings.map((building) =>
      building.id === job.buildingId ? deliverToSite(building) : building,
    ),
  };
}

function addPopup(work, job) {
  const popup = { id: `essence-${work.popupSeq}`, x: job.target.x, y: job.target.y, ageMs: 0 };
  return { ...work, popups: [...work.popups, popup], popupSeq: work.popupSeq + 1 };
}

function agePopups(popups, dtMs, config) {
  return popups
    .map((popup) => ({ ...popup, ageMs: popup.ageMs + dtMs }))
    .filter((popup) => popup.ageMs < config.popupLifetimeMs);
}

function staffWorkers(work, config) {
  let next = work;
  for (const worker of work.dunglings) {
    const relieved = relievedWorker(next, worker);
    if (relieved.job) continue;
    const job = nextJobFor(next, relieved, config);
    if (!job) continue;
    next = { ...next, dunglings: next.dunglings.map((w) => (w.id === worker.id ? withJob(w, job) : w)) };
  }
  return next;
}

function relievedWorker(work, worker) {
  const waiting = worker.job?.kind === JOB_KIND.EXTRACT && worker.job.phase === JOB_PHASE.ATTEND;
  if (!waiting || work.essence <= 0 || openSites(work.buildings).length === 0) return worker;
  return withJob(worker, null);
}

function nextJobFor(work, worker, config) {
  if (unitEffects(worker).buildOrders) {
    const delivery = deliveryFor(work, config);
    if (delivery) return delivery;
  }
  return stationFor(work, worker, config);
}

function deliveryFor(work, config) {
  if (work.essence <= 0) return null;
  const site = openSites(work.buildings)[0];
  if (!site) return null;
  return createDeliverJob({ buildingId: site.id, origin: work.anchor, target: site.anchor, config });
}

function stationFor(work, worker, config) {
  for (const building of work.buildings) {
    if (building.type !== BUILDING_TYPE.ESSENCE_EXTRACTOR) continue;
    if (building.state !== BUILDING_STATE.READY || !building.workers.includes(worker.id)) continue;
    return createExtractJob({ buildingId: building.id, origin: building.anchor, target: work.anchor, config });
  }
  return null;
}

function advanceBuildings(work, dtMs) {
  let dunglings = work.dunglings;
  const buildings = work.buildings.map((building) => {
    const brooded = brood({ building, dtMs, dunglings, anchor: work.anchor });
    dunglings = brooded.dunglings;
    return brooded.building;
  });
  return { ...work, buildings, dunglings };
}

function brood({ building, dtMs, dunglings, anchor }) {
  const def = buildingDef(building.type);
  if (building.state !== BUILDING_STATE.READY || !def.spawnEveryMs) return { building, dunglings };
  const progressMs = building.progressMs + dtMs;
  if (progressMs < def.spawnEveryMs || dunglings.length >= MAX_DUNGLINGS) {
    return { building: { ...building, progressMs: Math.min(progressMs, def.spawnEveryMs) }, dunglings };
  }
  const born = idle(createDungling({ id: nextDunglingId(dunglings), tile: anchor }));
  return { building: { ...building, progressMs: 0 }, dunglings: [...dunglings, born] };
}
