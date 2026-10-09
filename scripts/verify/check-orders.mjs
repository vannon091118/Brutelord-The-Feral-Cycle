/** Die Befehlsschicht: ein Befehl ist eine Zeile in einer Liste, nur ihr Kopf
 *  wird Arbeit, und eine erledigte Zeile faellt heraus. Ohne Zeile steht der
 *  Dungling — das ist die Umkehr gegenueber der selbsttaetigen Zuweisung.
 *  Die Zeilen entstehen ueber die echte Aktion und nicht ueber eine Fabrik;
 *  den Trait-Fall (Gierig verweigert den Lieferbefehl) prueft `check-traits`. */
import { ACTION } from '../../src/domain/actions/action-types.js';
import { JOB_CONFIG } from '../../src/domain/labour/job-config.js';
import { orderStep } from '../../src/domain/labour/order-job.js';
import { headOrder, pushOrder } from '../../src/domain/orders/order.js';
import { gameReducer } from '../../src/state/game-reducer.js';
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

function assigned() {
  return gameReducer(labState(), { type: ACTION.WORKER_ASSIGNED, buildingId: EXTRACTOR_ID }).dunglings[0];
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
  const leer = labState().dunglings[0];
  check('Ein Dungling traegt von Geburt an eine leere Liste', Array.isArray(leer.orders) && leer.orders.length === 0);
  check('Eine leere Liste hat keinen Kopf', headOrder(leer) === null);
  const order = headOrder(assigned());
  check('Zuweisen kommt als Zeile an', order?.buildingId === EXTRACTOR_ID);
  const zwei = pushOrder({ ...leer, orders: [order] }, { ...order, buildingId: 'building-9' });
  check('Ein zweiter Befehl kommt hinten an', zwei.orders.length === 2);
  check('Der erste Befehl bleibt der Kopf', headOrder(zwei) === order);
  let voll = zwei;
  for (let index = 0; index < 20; index += 1) voll = pushOrder(voll, { ...order, buildingId: 'building-9' });
  check('Die Liste waechst nicht ueber den Deckel', pushOrder(voll, order).orders.length === voll.orders.length);
  check('Der Deckel traegt eine Warteschlange', voll.orders.length > 1, `${voll.orders.length} Zeilen`);
}

function checkShape() {
  section('Befehl: nur der Kopf wird Arbeit');
  const roh = labState();
  const brach = { buildings: roh.buildings, anchor: { x: 7, y: 7 } };
  check('Ohne Befehl gibt es keine Arbeit', orderStep(brach, roh.dunglings[0], JOB_CONFIG).job === null);
  const zugewiesen = gameReducer(labState(), { type: ACTION.WORKER_ASSIGNED, buildingId: EXTRACTOR_ID });
  const werk = { buildings: zugewiesen.buildings, anchor: { x: 7, y: 7 } };
  const station = werk.buildings.find((entry) => entry.id === EXTRACTOR_ID);
  const worker = zugewiesen.dunglings[0];
  const job = orderStep(werk, worker, JOB_CONFIG).job;
  check('Ein Befehl wird Arbeit', job?.buildingId === EXTRACTOR_ID);
  check('Der Auftrag startet an der Station', job?.origin.x === station.anchor.x && job.origin.y === station.anchor.y);
  check('Und endet am Hive', job?.target.x === werk.anchor.x && job.target.y === werk.anchor.y);
  const tot = { ...worker, orders: [{ ...headOrder(worker), buildingId: 'building-99' }] };
  check('Ein Befehl auf ein verschwundenes Ziel wird keine Arbeit', orderStep(werk, tot, JOB_CONFIG).job === null);
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
  check('Die Zuweisung steht als Befehl in der Liste', headOrder(worker)?.buildingId === EXTRACTOR_ID);
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
    if (kopf) gesehen.add(kopf.buildingId);
  }
  check('Die Lieferung lief als Befehl auf den Bauplatz', gesehen.has(site.id), [...gesehen].join(', '));
  check('Die Lieferung kommt an', current.buildings.at(-1).delivered === site.required, `${current.buildings.at(-1).delivered} von ${site.required}`);
  const stille = restUntilIdle(current);
  check('Der Dungling kommt zur Ruhe', stille.dunglings[0].job === null);
  check('Die erledigte Zeile faellt heraus', stille.dunglings[0].orders.length === 0, `${stille.dunglings[0].orders.length} Zeilen`);
}

export function checkOrders() {
  checkList();
  checkShape();
  checkIdle();
  checkAssign();
  checkRelease();
  checkDelivery();
}
