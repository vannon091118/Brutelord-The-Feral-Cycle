// @doc: docs/daten/labour/order-job.md#order-job
import { BUILDING_STATE, BUILDING_TYPE } from '../buildings/building-config.js';
import { withJob } from '../entities/dungling.js';
import { ORDER_KIND } from '../orders/order-config.js';
import { clearOrders, createOrder, dropOrder, headOrder, pushOrder } from '../orders/order.js';
import { createDeliverJob, createExtractJob, JOB_KIND, JOB_PHASE } from './jobs.js';
import { unitEffects } from '../brutelord/stone-effects.js';

const TARGET_STATE = Object.freeze({
  [ORDER_KIND.WORK]: BUILDING_STATE.READY,
  [ORDER_KIND.DELIVER]: BUILDING_STATE.SITE,
});

export function assignOrder(worker, buildingId) {
  return pushOrder(worker, createOrder({ kind: ORDER_KIND.WORK, buildingId }));
}

export function standDown(worker) {
  return clearOrders(withJob(worker, null));
}

export function orderStep(work, worker, config) {
  const relieved = relievedWorker(work, worker);
  if (relieved.job) return relieved;
  const stocked = headOrder(relieved) ? relieved : refill(relieved, work);
  return withJob(stocked, jobForOrder(stocked, work, config));
}

export function spendOrder(worker, job) {
  return job || !worker.job ? worker : dropOrder(worker);
}

function refill(worker, work) {
  const order = deliveryOrder(work, worker) ?? stationOrder(work, worker);
  return order ? pushOrder(worker, order) : worker;
}

function deliveryOrder(work, worker) {
  if (work.essence <= 0 || !unitEffects(worker).buildOrders) return null;
  const site = openSite(work.buildings);
  return site ? createOrder({ kind: ORDER_KIND.DELIVER, buildingId: site.id }) : null;
}

function stationOrder(work, worker) {
  const building = work.buildings.find(
    (entry) => entry.type === BUILDING_TYPE.ESSENCE_EXTRACTOR
      && entry.state === TARGET_STATE[ORDER_KIND.WORK]
      && entry.workers.includes(worker.id),
  );
  return building ? createOrder({ kind: ORDER_KIND.WORK, buildingId: building.id }) : null;
}

function relievedWorker(work, worker) {
  const waiting = worker.job?.kind === JOB_KIND.EXTRACT && worker.job.phase === JOB_PHASE.ATTEND;
  if (!waiting || work.essence <= 0 || !openSite(work.buildings)) return worker;
  return dropOrder(withJob(worker, null));
}

function openSite(buildings) {
  return buildings.find((building) => building.state === TARGET_STATE[ORDER_KIND.DELIVER]) ?? null;
}

function jobForOrder(worker, work, config) {
  const order = headOrder(worker);
  if (!order) return null;
  const building = work.buildings.find((entry) => entry.id === order.buildingId);
  if (!building || building.state !== TARGET_STATE[order.kind]) return null;
  return jobFor(order, { building, anchor: work.anchor, config });
}

function jobFor(order, { building, anchor, config }) {
  if (order.kind === ORDER_KIND.WORK) {
    return createExtractJob({ buildingId: building.id, origin: building.anchor, target: anchor, config });
  }
  return createDeliverJob({ buildingId: building.id, origin: anchor, target: building.anchor, config });
}
