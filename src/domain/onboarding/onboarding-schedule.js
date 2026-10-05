// @doc: docs/daten/onboarding/onboarding-schedule.md#onboarding-schedule
import { ONBOARDING_CONFIG } from './onboarding-config.js';
import { ONBOARDING_STATE } from './onboarding-state.js';
import { ACTION } from '../actions/action-types.js';
import { MINING_PHASE, advanceMiningJob, isMiningFinished, miningTotalTicks } from '../actions/mining.js';

export function spawnRemainderMs() {
  return Math.max(
    0,
    ONBOARDING_CONFIG.dunglingSpawnDelayMs -
      ONBOARDING_CONFIG.hiveHitDurationMs -
      ONBOARDING_CONFIG.hiveMutationDurationMs,
  );
}

export function miningBurstEveryTicks() {
  return Math.max(
    1,
    Math.round(ONBOARDING_CONFIG.particleBurstIntervalMs / ONBOARDING_CONFIG.miningTickMs),
  );
}

export function totalMiningTicks() {
  return miningTotalTicks(ONBOARDING_CONFIG);
}

const TIMERS = {
  [ONBOARDING_STATE.HIVE_CLICKED]: [
    { delayMs: ONBOARDING_CONFIG.hiveHitDurationMs, type: ACTION.HIVE_MUTATION_STARTED },
  ],
  [ONBOARDING_STATE.MUTATING]: [
    { delayMs: ONBOARDING_CONFIG.hiveMutationDurationMs, type: ACTION.HIVE_MUTATION_SETTLED },
  ],
  [ONBOARDING_STATE.WAITING_FOR_DUNGLING]: [
    { delayMs: spawnRemainderMs(), type: ACTION.DUNGLING_SPAWNED },
  ],
  [ONBOARDING_STATE.DUNGLING_SPAWNING]: [
    { delayMs: ONBOARDING_CONFIG.dunglingEmergeMs, type: ACTION.DUNGLING_EMERGED },
  ],
  [ONBOARDING_STATE.DUNGLING_IDLE]: [
    { delayMs: ONBOARDING_CONFIG.dunglingSettleMs, type: ACTION.DUNGLING_READY },
  ],
  [ONBOARDING_STATE.MOVING_TO_TILE]: [
    { delayMs: ONBOARDING_CONFIG.workerMoveDurationMs, type: ACTION.DUNGLING_REACHED_TILE },
  ],
  [ONBOARDING_STATE.TILE_DESTROYED]: [
    { delayMs: ONBOARDING_CONFIG.tileDestructionMs, type: ACTION.GRID_EXPANDED },
  ],
  [ONBOARDING_STATE.GRID_EXPANDED]: [
    { delayMs: ONBOARDING_CONFIG.gridExpansionMs, type: ACTION.BUILD_MENU_SHOWN },
  ],
};

const MINING_INTERVAL = {
  everyMs: ONBOARDING_CONFIG.miningTickMs,
  tick: ACTION.MINING_PROGRESS,
  complete: ACTION.MINING_COMPLETED,
  isLastTick: (job) => isMiningFinished(advanceMiningJob(job)),
};

export function intervalAction(interval, job) {
  if (!job || job.phase !== MINING_PHASE.WORKING) return null;
  return { type: interval.isLastTick(job) ? interval.complete : interval.tick };
}

export function scheduleFor(phase) {
  return {
    timers: TIMERS[phase] ?? [],
    interval: phase === ONBOARDING_STATE.MINING ? MINING_INTERVAL : null,
  };
}
