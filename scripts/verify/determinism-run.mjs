/** Der komplette Slice als Durchlauf: der Bau-Slice aus `build-run.mjs` und
 *  danach die Zuege, die sonst nur der Browser ausloest — Wachstum, Labor,
 *  Mutation, Etagensprung. Nach jedem Zug faellt ein Zustands-Hash. */
import { ACTION } from '../../src/domain/actions/action-types.js';
import { SLOT_ORDER, STONE_CONFIG } from '../../src/domain/brutelord/stone-config.js';
import { JOB_CONFIG } from '../../src/domain/labour/job-config.js';
import { ROOTING_CONFIG } from '../../src/domain/world/rooting-config.js';
import { firstMineableTileId } from '../../src/state/selectors.js';
import { buildRun } from './build-run.mjs';
import { coldStateDigest, stateDigest } from './state-digest.mjs';

const ROOTING_TICKS = Math.ceil((ROOTING_CONFIG.claimDurationMs + ROOTING_CONFIG.cooldownMs) / ROOTING_CONFIG.tickMs);
const ESSENZ_LIMIT = 600;
const PROBEN_ABSTAND = 250;

function warte({ clock, limit, erreicht, type, payload }) {
  let count = 0;
  while (count < limit && !erreicht(clock.state)) {
    clock.dispatch(type, payload);
    count += 1;
  }
  return count;
}

function ohneWurzeln(state) {
  return state.world.rootingWorkIds.length === 0;
}

function mutantId(state) {
  return state.dunglings.find((worker) => (worker.stones ?? []).length > 0)?.id ?? 'unbekannt';
}

function derRest(clock) {
  warte({ clock, limit: ROOTING_TICKS, erreicht: ohneWurzeln, type: ACTION.ROOTING_TICK });
  clock.dispatch(ACTION.BUILDING_SELECTED, { buildingId: clock.state.buildings.at(-1).id });
  clock.dispatch(ACTION.LAB_OPENED);
  const teuer = (state) => state.essence >= STONE_CONFIG.cost;
  warte({ clock, limit: ESSENZ_LIMIT, erreicht: teuer, type: ACTION.WORK_TICK, payload: { dtMs: JOB_CONFIG.tickMs } });
  clock.dispatch(ACTION.STONE_BOUGHT);
  clock.dispatch(ACTION.STONE_PLACED, { seed: clock.state.lab.stones.at(-1).seed, slot: SLOT_ORDER[0] });
  clock.dispatch(ACTION.MUTANT_CREATED);
  clock.dispatch(ACTION.MUTANT_REVERTED, { workerId: mutantId(clock.state) });
  clock.dispatch(ACTION.LAB_CLOSED);
  clock.dispatch(ACTION.FLOOR_DESCEND);
  warte({ clock, limit: ROOTING_TICKS, erreicht: ohneWurzeln, type: ACTION.ROOTING_TICK });
  clock.dispatch(ACTION.TILE_SELECTED, { tileId: firstMineableTileId(clock.state.world) });
  clock.dispatch(ACTION.TILE_SELECTION_CLEARED);
  clock.dispatch(ACTION.BUILDING_SELECTED, { buildingId: clock.state.buildings[0].id });
  clock.dispatch(ACTION.WORKER_RELEASED, { buildingId: clock.state.buildings[0].id });
  clock.dispatch(ACTION.BUILDING_DESELECTED);
}

export function determinismRun(seed) {
  const ticks = [];
  const types = [];
  const kalteTreffer = [];
  const record = (state, now, action) => {
    types.push(action.type);
    if (ticks.length % PROBEN_ABSTAND === 0 && stateDigest(state) !== coldStateDigest(state)) {
      kalteTreffer.push(ticks.length);
    }
    ticks.push(stateDigest(state));
  };
  const run = buildRun({ seed, onDispatch: record });
  derRest(run.clock);
  return { seed, ticks, types, kalteTreffer, state: run.clock.state };
}
