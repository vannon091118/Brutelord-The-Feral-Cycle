/**
 * Abbau-Domäne: Befehl, Laufweg, Arbeitstakt, Abschluss.
 * Jeder Takt verändert genau den Erd-Zustand des einen Tiles und den Job —
 * nichts anderes, und nichts über eine Event-Kette.
 */
import { MINING_PHASE, advanceMiningJob, canMineTile, createMiningJob, earthHealthForProgress, minedFloorTile } from '../../domain/actions/mining.js';
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

function order(state) {
  if (state.onboarding.state !== ONBOARDING_STATE.ACTION_MENU) return state;
  const targetId = state.selectedTileId;
  if (!targetId || !canMineTile(state.world, targetId)) return state;
  return {
    ...state,
    mining: createMiningJob(targetId),
    dungling: walkTo(state.dungling, getTile(state.world, targetId)),
    selectedTileId: null,
    highlightedTileId: null,
    onboarding: enterOnboarding(state.onboarding, ONBOARDING_STATE.MOVING_TO_TILE),
  };
}

function reached(state) {
  if (state.onboarding.state !== ONBOARDING_STATE.MOVING_TO_TILE || !state.mining) return state;
  return {
    ...state,
    mining: { ...state.mining, phase: MINING_PHASE.WORKING },
    dungling: startWork(state.dungling),
    onboarding: enterOnboarding(state.onboarding, ONBOARDING_STATE.MINING),
  };
}

/** Ein definierter Takt Arbeit → sichtbarer Zustand der Erde. */
function progress(state) {
  if (state.onboarding.state !== ONBOARDING_STATE.MINING || !state.mining) return state;
  const job = advanceMiningJob(state.mining);
  const tile = getTile(state.world, job.tileId);
  if (!tile) return { ...state, mining: job };
  const nextHealth = earthHealthForProgress(job.progress);
  const world =
    tile.earthHealth === nextHealth
      ? state.world
      : replaceTile(state.world, withEarthHealth(tile, nextHealth));
  return { ...state, world, mining: job };
}

function completed(state) {
  if (state.onboarding.state !== ONBOARDING_STATE.MINING || !state.mining) return state;
  const tile = getTile(state.world, state.mining.tileId);
  if (!tile) return state;
  return {
    ...state,
    world: replaceTile(state.world, minedFloorTile(tile)),
    mining: { ...state.mining, phase: MINING_PHASE.COMPLETE, progress: 1 },
    dungling: idle(state.dungling),
    lastDestroyedTileId: tile.id,
    onboarding: enterOnboarding(state.onboarding, ONBOARDING_STATE.TILE_DESTROYED),
  };
}
