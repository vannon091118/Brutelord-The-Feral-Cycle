/** Die Befehlsschicht: ein Befehl ist eine Zeile in einer Liste, nur ihr Kopf
 *  wird Arbeit, und eine erledigte Zeile faellt heraus. Ohne Zeile steht der
 *  Dungling — das ist die Umkehr gegenueber der selbsttaetigen Zuweisung.
 *  Den Trait-Fall (Gierig verweigert den Lieferbefehl) prueft `check-traits`. */
import { ACTION } from '../../src/domain/actions/action-types.js';
import { JOB_CONFIG } from '../../src/domain/labour/job-config.js';
import { ORDER_CONFIG, ORDER_KIND, createOrder, headOrder, jobForOrder, pushOrder } from '../../src/domain/orders/order.js';
import { gameReducer } from '../../src/state/game-reducer.js';
import { workOf } from '../../src/state/work-state.js';
import { deliveryTo, labState } from './lab-run.mjs';
import { check, section } from './expect.mjs';

const EXTRACTOR_ID = 'building-2';
const TICKS = 400;

function tick(state) {
  let current = state;
  for (let index = 0; index < TICKS; index += 1) {
    current = gameReducer(current, { type: ACTION.WORK_TICK, dtMs: JOB_CONFIG.tickMs });
  }
  return current;
}

function workOrder() {
  return createOrder({ kind: ORDER_KIND.WORK, buildingId: EXTRACTOR_ID });
}

function restUntilIdle(state) {
  let current = state;
  for (let index = 0; index < TICKS && current.dunglings[0].job !== null; index += 1) {
    current = gameReducer(current, { type: ACTION.WORK_TICK, dtMs: JOB_CONFIG.tickMs });
  }
  return current;
}

function checkList() {
  section('Befehl: eine Zeile in einer Liste');
  const worker = labState().dunglings[0];
  check('Ein Dungling traegt von Geburt an eine leere Liste', Array.isArray(worker.orders) && worker.orders.length === 0);
  check('Eine leere Liste hat keinen Kopf', headOrder(worker) === null);
  const order = workOrder();
  const one = pushOrder(worker, order);
  check('Ein Befehl kommt hinten an', headOrder(one) === order && one.orders.length === 1);
  const two = pushOrder(one, createOrder({ kind: ORDER_KIND.DELIVER, buildingId: 'building-9' }));
  check('Der erste Befehl bleibt der Kopf', headOrder(two) === order, `${headOrder(two)?.buildingId}`);
  let voll = worker;
  for (let index = 0; index < ORDER_CONFIG.queueMax + 3; index += 1) voll = pushOrder(voll, workOrder());
  check('Die Liste ist gedeckelt', voll.orders.length === ORDER_CONFIG.queueMax, `${voll.orders.length} Zeilen`);
  check('Und der Deckel traegt mehr als einen Befehl', ORDER_CONFIG.queueMax >= 2);
}

function checkJob() {
  section('Befehl: nur der Kopf wird Arbeit');
  const werk = workOf(labState());
  const worker = werk.dunglings[0];
  const station = werk.buildings.find((entry) => entry.id === EXTRACTOR_ID);
  const order = pushOrder(worker, workOrder());
  check('Ohne Befehl gibt es keine Arbeit', jobForOrder(worker, werk) === null);
  const job = jobForOrder(order, werk);
  check('Ein Befehl auf ein fertiges Gebaeude wird Arbeit', job?.buildingId === EXTRACTOR_ID);
  check('Der Auftrag startet an der Station', job?.origin.x === station.anchor.x && job.origin.y === station.anchor.y);
  check('Und endet am Hive', job?.target.x === werk.anchor.x && job.target.y === werk.anchor.y);
  const insLeere = pushOrder(worker, createOrder({ kind: ORDER_KIND.WORK, buildingId: 'building-99' }));
  check('Ein Befehl auf ein verschwundenes Ziel wird keine Arbeit', jobForOrder(insLeere, werk) === null);
  const falsch = pushOrder(worker, createOrder({ kind: ORDER_KIND.DELIVER, buildingId: EXTRACTOR_ID }));
  check('Ein Lieferbefehl auf ein fertiges Gebaeude wird keine Arbeit', jobForOrder(falsch, werk) === null);
}

function checkIdle() {
  section('Befehl: ohne Befehl steht der Dungling');
  const start = labState();
  const ruhe = tick(start);
  check('Kein Arbeiter ohne Befehl bekommt Arbeit', ruhe.dunglings[0].job === null);
  check('Und es entsteht keine Essenz', ruhe.essence === start.essence, `${ruhe.essence}`);
  check('Kein Popup, keine Lieferung', ruhe.popups.length === 0);
  check('Die Liste bleibt leer', ruhe.dunglings[0].orders.length === 0);
}

function checkAssign() {
  section('Befehl: Zuweisen legt ihn an, der Takt fuehrt ihn aus');
  const leer = { ...labState(), essence: 0 };
  const zugewiesen = gameReducer(leer, { type: ACTION.WORKER_ASSIGNED, buildingId: EXTRACTOR_ID });
  const worker = zugewiesen.dunglings[0];
  check('Die Zuweisung steht als Befehl in der Liste', headOrder(worker)?.kind === ORDER_KIND.WORK);
  check('Der Befehl nennt das Gebaeude', headOrder(worker)?.buildingId === EXTRACTOR_ID);
  check('Zugewiesen heisst noch nicht gearbeitet', worker.job === null);
  const lauf = tick(zugewiesen);
  check('Der Takt macht aus dem Befehl Arbeit', lauf.essence > 0, `${lauf.essence} Essenz`);
  check('Der Arbeiter haengt am Gebaeude', lauf.buildings.find((entry) => entry.id === EXTRACTOR_ID).workers.includes(worker.id));
}

function checkRelease() {
  section('Befehl: Freigeben raeumt Liste und Arbeit');
  const zugewiesen = gameReducer(labState(), { type: ACTION.WORKER_ASSIGNED, buildingId: EXTRACTOR_ID });
  const lauf = gameReducer(zugewiesen, { type: ACTION.WORK_TICK, dtMs: JOB_CONFIG.tickMs });
  check('Vor dem Freigeben laeuft der Auftrag', lauf.dunglings[0].job !== null);
  const frei = gameReducer(lauf, { type: ACTION.WORKER_RELEASED, buildingId: EXTRACTOR_ID });
  check('Nach dem Freigeben ist die Liste leer', frei.dunglings[0].orders.length === 0);
  check('Und der Auftrag ist weg', frei.dunglings[0].job === null);
  check('Das Gebaeude hat keinen Arbeiter mehr', frei.buildings.find((entry) => entry.id === EXTRACTOR_ID).workers.length === 0);
  check('Ohne Befehl wird auch danach nichts', tick(frei).dunglings[0].job === null);
}

function checkDelivery() {
  section('Befehl: die Lieferung laeuft ueber dieselbe Liste');
  const bauplatz = deliveryTo({ x: 24, y: 24 });
  const site = bauplatz.buildings.at(-1);
  check('Der Bauplatz wartet auf Lieferung', site.delivered < site.required);
  const gesehen = new Set();
  let current = bauplatz;
  for (let index = 0; index < TICKS; index += 1) {
    current = gameReducer(current, { type: ACTION.WORK_TICK, dtMs: JOB_CONFIG.tickMs });
    const kopf = headOrder(current.dunglings[0]);
    if (kopf) gesehen.add(kopf.kind);
  }
  check('Die Lieferung lief als Befehl durch die Liste', gesehen.has(ORDER_KIND.DELIVER), [...gesehen].join(', '));
  check('Die Lieferung kommt an', current.buildings.at(-1).delivered === site.required, `${current.buildings.at(-1).delivered} von ${site.required}`);
  const stille = restUntilIdle(current);
  check('Die erledigte Zeile faellt heraus', stille.dunglings[0].orders.length === 0, `${stille.dunglings[0].orders.length} Zeilen`);
  check('Und danach steht kein neuer Befehl an', restUntilIdle(stille).dunglings[0].orders.length === 0);
}

export function checkOrders() {
  checkList();
  checkJob();
  checkIdle();
  checkAssign();
  checkRelease();
  checkDelivery();
}
