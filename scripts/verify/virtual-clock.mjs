/**
 * Virtuelle Uhr: führt denselben Zeitplan aus wie die Sim-Uhr im Browser,
 * nur ohne Wartezeit. Bei einem Phasenwechsel verfallen alte Timer — genau
 * wie im React-Effekt.
 */
import { createInitialGameState } from '../../src/state/game-state.js';
import { gameReducer } from '../../src/state/game-reducer.js';
import { MINING_PHASE } from '../../src/domain/actions/mining.js';
import { scheduleFor } from '../../src/domain/onboarding/onboarding-schedule.js';

export class VirtualClock {
  constructor({ onTransition, onDispatch } = {}) {
    this.state = createInitialGameState();
    this.now = 0;
    this.queue = [];
    this.interval = null;
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

  step() {
    const nextTimer = this.queue[0] ?? null;
    const nextInterval = this.interval ? this.interval.nextAt : Infinity;
    if (!nextTimer && nextInterval === Infinity) return false;

    if (nextTimer && nextTimer.at <= nextInterval) {
      this.now = nextTimer.at;
      this.queue.shift();
      this.dispatch(nextTimer.type);
      return true;
    }

    this.now = nextInterval;
    this.interval.nextAt += this.interval.everyMs;
    const job = this.state.mining;
    if (job && job.phase === MINING_PHASE.WORKING) {
      this.dispatch(this.interval.isLastTick(job) ? this.interval.complete : this.interval.tick);
    }
    return true;
  }

  run() {
    let guard = 0;
    while (this.step()) {
      guard += 1;
      if (guard > 5000) throw new Error('Virtuelle Uhr läuft nicht aus — Endlosschleife.');
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
