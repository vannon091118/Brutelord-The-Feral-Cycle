/**
 * Virtuelle Uhr: führt denselben Zeitplan aus wie die Sim-Uhr im Browser,
 * nur ohne Wartezeit. Bei einem Phasenwechsel verfallen alte Timer — genau
 * wie im React-Effekt. Der Hive presst nur, solange der Plan die Uhr hält.
 */
import { createInitialGameState } from '../../src/state/game-state.js';
import { gameReducer } from '../../src/state/game-reducer.js';
import { intervalAction, scheduleFor } from '../../src/domain/onboarding/onboarding-schedule.js';
import { ACTION } from '../../src/domain/actions/action-types.js';
import { ESSENCE_ECONOMY } from '../../src/domain/economy/essence-economy.js';
import { JOB_CONFIG } from '../../src/domain/labour/job-config.js';

export class VirtualClock {
  constructor({ onTransition, onDispatch } = {}) {
    this.state = createInitialGameState();
    this.now = 0;
    this.queue = [];
    this.interval = null;
    this.hiveMs = JOB_CONFIG.tickMs;
    this.onTransition = onTransition ?? (() => {});
    this.onDispatch = onDispatch ?? (() => {});
    this.schedule();
  }

  schedule() {
    const plan = scheduleFor(this.state.onboarding.state);
    for (const timer of plan.timers) {
      this.queue.push({ at: this.now + timer.delayMs, type: timer.type });
    }
    this.queue.sort((left, right) => left.at - right.at);
    this.interval = plan.interval
      ? { ...plan.interval, nextAt: this.now + plan.interval.everyMs }
      : null;
  }

  dispatch(type, payload) {
    const before = this.state.onboarding.state;
    this.state = gameReducer(this.state, { type, ...payload });
    if (this.state.onboarding.state !== before) {
      this.queue = [];
      this.interval = null;
      this.schedule();
      this.onTransition(this.state.onboarding.state, this.now, before);
    }
    this.onDispatch(this.state, this.now);
  }

  planHorizon() {
    const nextTimer = this.queue[0] ? this.queue[0].at : Infinity;
    const nextInterval = this.interval ? this.interval.nextAt : Infinity;
    return Math.min(nextTimer, nextInterval);
  }

  step() {
    const next = this.planHorizon();
    if (next === Infinity) return false;
    if (this.queue[0] && this.queue[0].at <= next) {
      this.now = this.queue[0].at;
      this.dispatch(this.queue.shift().type);
      return true;
    }
    this.now = next;
    this.interval.nextAt += this.interval.everyMs;
    const action = intervalAction(this.interval, this.state.mining);
    if (action) this.dispatch(action.type);
    return true;
  }

  pressHive() {
    const horizon = this.planHorizon();
    if (horizon === Infinity || this.now + JOB_CONFIG.tickMs > horizon) return false;
    if (this.hiveMs > ESSENCE_ECONOMY.hiveBudget * ESSENCE_ECONOMY.hiveEveryMs) return false;
    this.hiveMs += JOB_CONFIG.tickMs;
    this.dispatch(ACTION.HIVE_TICK, { dtMs: JOB_CONFIG.tickMs });
    return true;
  }

  run() {
    let guard = 0;
    while (this.step()) {
      guard += 1;
      if (guard > 5000) throw new Error('Virtuelle Uhr läuft nicht aus — Endlosschleife.');
      this.pressHive();
    }
  }

  runUntil(phase) {
    let guard = 0;
    while (this.state.onboarding.state !== phase && this.step()) {
      guard += 1;
      if (guard > 5000) throw new Error(`Zustand ${phase} wird nicht erreicht.`);
    }
    return this.state.onboarding.state === phase;
  }
}