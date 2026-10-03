/** Abbau-Domäne: Befehl, Laufweg, Takt, Ernte, Abschluss. */
import { MINING_PHASE, advanceMiningJob, canMineTile, createMiningJob, earthHealthForProgress, mineTile } from '../../domain/actions/mining.js';
import { exposeDeposit, harvestTick } from '../../domain/deposits/deposit-state.js';
import { getTile, replaceTile } from '../../domain/world/grid.js';
import { withEarthHealth } from '../../domain/world/tile.js';
import { idle, startWork, walkTo } from '../../domain/entities/dungling.js';
import { ONBOARDING_STATE, enterOnboarding } from '../../domain/onboarding/onboarding-state.js';
import { ACTION } from '../../domain/actions/action-types.js';

export function reduceMining(state, action) {
  switch (action.type) {
    case ACTION.MINING_ORDERED:
      return order(state);
    case ACTION.DUNGLING_REACHED_TILE:
      return reached(state);
    case ACTION.MINING_PROGRESS:
      return progress(state);
    case ACTION.MINING_COMPLETED:
      return completed(state);
    default:
      return state;
  }
}

function withWorker(state, workerId, change) {
  return {
    ...state,
    dunglings: state.dunglings.map((worker) => (worker.id === workerId ? change(worker) : worker)),
  };
}

function freeWorker(state) {
  return state.dunglings.find((worker) => !worker.job);
}

function order(state) {
  if (state.onboarding.state !== ONBOARDING_STATE.ACTION_MENU) return state;
  const targetId = state.selectedTileId;
  const worker = freeWorker(state);
  if (!targetId || !worker || !canMineTile(state.world, targetId)) return state;
  const next = withWorker(state, worker.id, (entry) => walkTo(entry, getTile(state.world, targetId)));
  return {
    ...next,
    mining: { ...createMiningJob(targetId), workerId: worker.id },
    selectedTileId: null,
    highlightedTileId: null,
    onboarding: enterOnboarding(state.onboarding, ONBOARDING_STATE.MOVING_TO_TILE),
  };
}

function reached(state) {
  if (state.onboarding.state !== ONBOARDING_STATE.MOVING_TO_TILE || !state.mining) return state;
  const tile = getTile(state.world, state.mining.tileId);
  return {
    ...withWorker(state, state.mining.workerId, startWork),
    world: tile ? exposeDeposit(state.world, tile) : state.world,
    mining: { ...state.mining, phase: MINING_PHASE.WORKING },
    onboarding: enterOnboarding(state.onboarding, ONBOARDING_STATE.MINING),
  };
}

function progress(state) {
  if (state.onboarding.state !== ONBOARDING_STATE.MINING) return state;
  if (!state.mining) return state;
  const job = advanceMiningJob(state.mining);
  const tile = getTile(state.world, job.tileId);
  if (!tile) return { ...state, mining: job };
  const nextHealth = earthHealthForProgress(job.progress);
  const world =
    tile.earthHealth === nextHealth
      ? state.world
      : replaceTile(state.world, withEarthHealth(tile, nextHealth));
  const harvest = harvestTick(world, tile, job.progress);
  if (harvest.gained === 0) return { ...state, world, mining: job };
  return {
    ...state,
    world: harvest.world,
    essence: state.essence + harvest.gained,
    lastHarvest: {
      seq: (state.lastHarvest?.seq ?? 0) + 1,
      tileId: tile.id,
      depleted: harvest.depleted,
      to: workerSpot(state, job.workerId),
    },
    mining: job,
  };
}

function workerSpot(state, workerId) {
  const worker = state.dunglings.find((entry) => entry.id === workerId);
  return worker ? { x: worker.tile.x, y: worker.tile.y } : null;
}

function completed(state) {
  if (state.onboarding.state !== ONBOARDING_STATE.MINING || !state.mining) return state;
  const tile = getTile(state.world, state.mining.tileId);
  if (!tile) return state;
  return {
    ...withWorker(state, state.mining.workerId, idle),
    world: mineTile(state.world, tile),
    mining: { ...state.mining, phase: MINING_PHASE.COMPLETE, progress: 1 },
    lastDestroyedTileId: tile.id,
    onboarding: enterOnboarding(state.onboarding, ONBOARDING_STATE.TILE_DESTROYED),
  };
}
