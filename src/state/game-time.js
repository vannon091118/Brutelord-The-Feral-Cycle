// @doc: docs/daten/state/game-time.md#game-time
import { ACTION } from '../domain/actions/action-types.js';
import { ONBOARDING_CONFIG } from '../domain/onboarding/onboarding-config.js';
import { JOB_CONFIG } from '../domain/labour/job-config.js';
import { ROOTING_CONFIG } from '../domain/world/rooting-config.js';
import { hiveHasBudget } from '../domain/economy/essence-economy.js';
import { rootingWorkCount } from '../domain/world/rooting-world.js';
import { workIsIdle } from './work-state.js';

export const GAME_TIME = Object.freeze({
  heartbeatMs: Math.min(ROOTING_CONFIG.tickMs, ONBOARDING_CONFIG.miningTickMs),
  maxStepMs: 1000,
});

export const TICKS = Object.freeze([
  {
    action: ACTION.ROOTING_TICK,
    everyMs: ROOTING_CONFIG.tickMs,
    paused: (state) => rootingWorkCount(state.world) === 0,
  },
  { action: ACTION.WORK_TICK, everyMs: JOB_CONFIG.tickMs, paused: workIsIdle },
  { action: ACTION.HIVE_TICK, everyMs: JOB_CONFIG.tickMs, paused: (state) => !hiveHasBudget(state.hive) },
]);
