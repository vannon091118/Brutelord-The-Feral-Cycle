/** Die Sim-Uhr: ein Herzschlag, gemessene Schritte, gedeckelte Spruenge. */
import { ACTION } from '../../src/domain/actions/action-types.js';
import { scheduleFor } from '../../src/domain/onboarding/onboarding-schedule.js';
import { createGameClock } from '../../src/state/game-clock.js';
import { GAME_TIME, TICKS } from '../../src/state/game-time.js';
import { createInitialGameState } from '../../src/state/game-state.js';
import { gameReducer } from '../../src/state/game-reducer.js';
import { check, section } from './expect.mjs';

const SEED = 'a1b2c3d4';
const LONG_STEP = 60_000;

function makeRunner({ beatMs = GAME_TIME.heartbeatMs, seed = SEED } = {}) {
  let at = 0;
  let state = createInitialGameState(seed);
  const clock = createGameClock({ now: () => at });
  const beat = (step = beatMs) => {
    at += step;
    const actions = clock.beat(state);
    for (const action of actions) state = gameReducer(state, action);
    return actions;
  };
  const send = (type, payload) => {
    state = gameReducer(state, { type, ...payload });
  };
  return { beat, send, state: () => state, at: () => at };
}

function of(actions, type) {
  return actions.filter((action) => action.type === type);
}

function runStream({ beatMs, beats }) {
  const runner = makeRunner({ beatMs });
  const actions = [];
  for (let index = 0; index < beats; index += 1) actions.push(...runner.beat());
  return actions;
}

function sign(actions) {
  return actions.map((action) => `${action.type}:${action.dtMs ?? ''}`).join('|');
}

function cadence() {
  section('Sim-Uhr: ein Herzschlag, gemessene Schritte');
  const runner = makeRunner({});
  const actions = [];
  for (let index = 0; index < 20; index += 1) actions.push(...runner.beat());
  const elapsed = 20 * GAME_TIME.heartbeatMs;
  for (const tick of TICKS) {
    const fired = of(actions, tick.action);
    const expected = tick.paused(runner.state()) ? 0 : Math.floor(elapsed / tick.everyMs);
    check(`${tick.action} taktet in seinem Config-Takt von ${tick.everyMs} ms`, fired.length === expected, `${fired.length} statt ${expected} in ${elapsed} ms`);
    check(`${tick.action} traegt diesen Takt als dtMs`, fired.every((action) => action.dtMs === tick.everyMs));
  }
}

function throttle() {
  section('Sim-Uhr: ein gedrosselter Tab verliert keine Spielzeit');
  const span = 10_000;
  const steady = runStream({ beatMs: 100, beats: span / 100 });
  const throttled = runStream({ beatMs: 1000, beats: span / 1000 });
  check('Gleiche Wanduhr, gleicher Taktstrom', sign(steady) === sign(throttled), `${steady.length} gegen ${throttled.length} Aktionen`);
  const hive = TICKS.find((tick) => tick.action === ACTION.HIVE_TICK);
  const expected = span / hive.everyMs;
  const fired = of(throttled, ACTION.HIVE_TICK);
  check('Der gedrosselte Lauf holt jeden Takt nach', fired.length === expected, `${fired.length} statt ${expected} in ${span} ms`);
  check('Jeder nachgeholte Takt traegt seinen eigenen Schritt', fired.every((action) => action.dtMs === hive.everyMs));
}

function clamp() {
  section('Sim-Uhr: ein Riesenloch wird gedeckelt');
  const hive = TICKS.find((tick) => tick.action === ACTION.HIVE_TICK);
  const cap = Math.floor(GAME_TIME.maxStepMs / hive.everyMs);
  const fired = of(makeRunner({}).beat(LONG_STEP), ACTION.HIVE_TICK);
  check(`Ein Schritt traegt hoechstens ${GAME_TIME.maxStepMs} ms nach`, fired.length === cap, `${fired.length} statt ${cap} Takte fuer ${LONG_STEP} ms`);
  check('Der Deckel laesst den Takt nicht aus', fired.length > 0);
}

function firstTimerBeats(beatMs = GAME_TIME.heartbeatMs) {
  const runner = makeRunner({ beatMs });
  runner.send(ACTION.HIVE_CLICKED);
  const timer = scheduleFor(runner.state().onboarding.state).timers[0];
  let count = 0;
  while (count < 100) {
    count += 1;
    const actions = runner.beat();
    if (actions.some((action) => action.type === timer.type)) break;
  }
  return { beats: count, elapsed: count * beatMs, delay: timer.delayMs, type: timer.type };
}

function plan() {
  section('Der Onboarding-Plan laeuft auf derselben Uhr');
  const steady = firstTimerBeats();
  check('Der Timer wartet, bis die Zeit wirklich vergangen ist', steady.elapsed >= steady.delay, `${steady.elapsed} ms fuer ${steady.delay} ms`);
  check('Und keine ganze Taktlaenge laenger', steady.elapsed < steady.delay + GAME_TIME.heartbeatMs, `${steady.elapsed} ms fuer ${steady.delay} ms`);
  const stretched = firstTimerBeats(GAME_TIME.maxStepMs);
  check('Ein gedrosselter Takt feuert den faelligen Timer sofort', stretched.beats === 1, `${stretched.beats} Takte`);
  check('Die Uhr kennt den Plan nicht, sie holt ihn aus der Domaene', stretched.type === steady.type && Boolean(steady.type));
}

function plannedMs(trail) {
  const seen = new Set();
  let sum = 0;
  for (const phase of trail) {
    if (seen.has(phase)) continue;
    seen.add(phase);
    for (const timer of scheduleFor(phase).timers) sum += timer.delayMs;
  }
  return sum;
}

function toMining(runner) {
  runner.send(ACTION.HIVE_CLICKED);
  let guard = 0;
  while (!runner.state().highlightedTileId && guard < 200) {
    runner.beat();
    guard += 1;
  }
  runner.send(ACTION.TILE_SELECTED, { tileId: runner.state().highlightedTileId });
  runner.send(ACTION.MINING_ORDERED);
  const planned = plannedMs(runner.state().onboarding.trail);
  guard = 0;
  while (!scheduleFor(runner.state().onboarding.state).interval && guard < 200) {
    runner.beat();
    guard += 1;
  }
  return { planned, elapsed: runner.at(), interval: scheduleFor(runner.state().onboarding.state).interval };
}

function mining() {
  section('Abbau und Onboarding teilen denselben Takt');
  const runner = makeRunner({});
  const { interval, planned, elapsed } = toMining(runner);
  check('Die Abbau-Phase hat ihren Intervall-Takt', Boolean(interval));
  check('Die Kette laeuft auf der Wanduhr, ohne Drift', elapsed >= planned && elapsed < planned + GAME_TIME.heartbeatMs, `${elapsed} ms fuer ${planned} ms geplante Wartezeit`);
  if (!interval) return;
  const total = runner.state().mining.totalTicks;
  const perStep = Math.floor(GAME_TIME.maxStepMs / interval.everyMs);
  let progress = of(runner.beat(GAME_TIME.maxStepMs), interval.tick).length;
  check('Ein gedrosselter Schritt arbeitet die faelligen Abbautakte nach', progress === perStep, `${progress} statt ${perStep}`);
  let complete = 0;
  let guard = 0;
  while (complete === 0 && guard < 200) {
    guard += 1;
    const actions = runner.beat();
    progress += of(actions, interval.tick).length;
    complete += of(actions, interval.complete).length;
  }
  check('Der Abbau endet genau einmal', complete === 1, `${complete} Abschluesse`);
  check('Zusammen genau die Takte des Auftrags', progress + complete === total, `${progress + complete} statt ${total}`);
}

export function checkGameClock() {
  cadence();
  throttle();
  clamp();
  plan();
  mining();
}
