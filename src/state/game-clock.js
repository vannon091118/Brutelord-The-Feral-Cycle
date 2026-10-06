// @doc: docs/daten/state/game-clock.md#game-clock
import { GAME_TIME, TICKS } from './game-time.js';
import { advanceMiningJob } from '../domain/actions/mining.js';
import { intervalAction, scheduleFor } from '../domain/onboarding/onboarding-schedule.js';

export function monotonicNow() {
  return performance.now();
}

function armPhase(run, phase) {
  if (phase === run.phase) return;
  run.phase = phase;
  run.plan = scheduleFor(phase);
  run.phaseMs = run.carry;
  run.carry = 0;
  run.credits = new Map();
  run.pending = run.plan.timers.map((timer) => ({ at: timer.delayMs, type: timer.type }));
}

function due(run, { key, everyMs, dtMs }) {
  const owed = (run.credits.get(key) ?? 0) + dtMs;
  const count = Math.floor(owed / everyMs);
  run.credits.set(key, owed - count * everyMs);
  return count;
}

function stepTimers({ run, actions, dtMs }) {
  run.phaseMs += dtMs;
  while (run.pending.length > 0 && run.pending[0].at <= run.phaseMs) {
    const timer = run.pending.shift();
    actions.push({ type: timer.type });
    run.carry = run.phaseMs - timer.at;
  }
}

function stepTicks({ run, actions, state, dtMs }) {
  for (const tick of TICKS) {
    if (tick.paused(state)) {
      run.credits.set(tick.action, 0);
      continue;
    }
    const count = due(run, { key: tick.action, everyMs: tick.everyMs, dtMs });
    for (let index = 0; index < count; index += 1) {
      actions.push({ type: tick.action, dtMs: tick.everyMs });
    }
  }
}

function stepMining({ run, actions, state, dtMs }) {
  const interval = run.plan.interval;
  if (!interval) return;
  let job = state.mining;
  let left = due(run, { key: interval, everyMs: interval.everyMs, dtMs });
  while (left > 0) {
    const action = intervalAction(interval, job);
    if (!action) break;
    actions.push(action);
    if (action.type === interval.complete) break;
    job = advanceMiningJob(job);
    left -= 1;
  }
}

function beat(run, state) {
  armPhase(run, state.onboarding.state);
  const at = run.now();
  const dtMs = Math.min(Math.max(0, at - run.last), run.maxStepMs);
  run.last = Math.max(run.last, at);
  const actions = [];
  stepTimers({ run, actions, dtMs });
  stepTicks({ run, actions, state, dtMs });
  stepMining({ run, actions, state, dtMs });
  return actions;
}

export function createGameClock({ now = monotonicNow, maxStepMs = GAME_TIME.maxStepMs } = {}) {
  const run = {
    now,
    maxStepMs,
    last: now(),
    phase: null,
    plan: { timers: [], interval: null },
    phaseMs: 0,
    carry: 0,
    credits: new Map(),
    pending: [],
  };
  return { beat: (state) => beat(run, state) };
}
