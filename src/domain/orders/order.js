// @doc: docs/daten/orders/order.md#order
import { BUILDING_STATE } from '../buildings/building-config.js';
import { withJob } from '../entities/dungling.js';
import { JOB_CONFIG } from '../labour/job-config.js';
import { createDeliverJob, createExtractJob } from '../labour/jobs.js';
import { ORDER_CONFIG, ORDER_KIND } from './order-config.js';

export { ORDER_CONFIG, ORDER_KIND };

const TARGET_STATE = Object.freeze({
  [ORDER_KIND.WORK]: BUILDING_STATE.READY,
  [ORDER_KIND.DELIVER]: BUILDING_STATE.SITE,
});

export function createOrder({ kind, buildingId = null }) {
  return { kind, buildingId };
}

export function pushOrder(worker, order) {
  if (!order || worker.orders.length >= ORDER_CONFIG.queueMax) return worker;
  return { ...worker, orders: [...worker.orders, order] };
}

export function dropOrder(worker) {
  if (worker.orders.length === 0) return worker;
  return { ...worker, orders: worker.orders.slice(1) };
}

export function clearOrders(worker) {
  return worker.orders.length === 0 ? worker : { ...worker, orders: [] };
}

export function headOrder(worker) {
  return worker.orders.at(0) ?? null;
}

export function assignOrder(worker, buildingId) {
  return pushOrder(worker, createOrder({ kind: ORDER_KIND.WORK, buildingId }));
}

export function standDown(worker) {
  return clearOrders(withJob(worker, null));
}

export function jobForOrder(worker, work, config = JOB_CONFIG) {
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
