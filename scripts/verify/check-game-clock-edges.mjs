/** Die Raender der Sim-Uhr: was ein Hintergrundtab, ein schlafender Rechner,
 *  ein Ruecksprung der Systemzeit und ein CPU-Spike mit ihr machen. Geprueft
 *  wird die Naht selbst — vorgegebene Zeit, eingefrorener Zustand, kein Warten. */
import { createGameClock, monotonicNow } from '../../src/state/game-clock.js';
import { GAME_TIME, TICKS } from '../../src/state/game-time.js';
import { createInitialGameState } from '../../src/state/game-state.js';
import { check, section } from './expect.mjs';

const SEED = 'a1b2c3d4';
const MINUTE = 60_000;
const CAP = GAME_TIME.maxStepMs;

function rig() {
  const state = createInitialGameState(SEED);
  let at = 0;
  const clock = createGameClock({ now: () => at });
  const step = (ms) => {
    at += ms;
    return clock.beat(state);
  };
  const back = (ms) => {
    at = Math.max(0, at - ms);
    return clock.beat(state);
  };
  return { step, back, at: () => at, state, stream: (steps) => steps.flatMap((ms) => step(ms)) };
}

function sign(actions) {
  return actions.map((action) => `${action.type}:${action.dtMs ?? ''}`).join('|');
}

function of(actions, type) {
  return actions.filter((action) => action.type === type);
}

function active(state) {
  return TICKS.filter((tick) => !tick.paused(state));
}

function quiet(state) {
  return TICKS.filter((tick) => tick.paused(state));
}

function total(steps) {
  return steps.reduce((sum, step) => sum + step, 0);
}

// Zeitgetreu: jeder laufende Takt fiel genau so oft, wie die Zeit verlangt.
function timely(actions, state, ms) {
  return active(state).every((tick) => of(actions, tick.action).length === Math.floor(ms / tick.everyMs));
}

function counts(actions, tick) {
  return of(actions, tick.action).length;
}

// Dieselbe Spielzeit in gleichmaessigen Schritten unter dem Deckel.
function steady(ms) {
  const steps = [];
  let left = ms;
  while (left > 0) {
    const step = Math.min(CAP, left);
    steps.push(step);
    left -= step;
  }
  return rig().stream(steps);
}

function backgroundTab() {
  section('Uhr: ein gedrosselter Hintergrundtab verliert nichts');
  const takte = Array.from({ length: 100 }, () => 100);
  const feiner = rig().stream(takte);
  const grober = rig().stream(Array.from({ length: 10 }, () => 1000));
  check('Zwei Tab-Geschwindigkeiten, dieselbe Wanduhr, derselbe Strom', sign(feiner) === sign(grober), `${feiner.length} gegen ${grober.length} Aktionen`);
  check('Der gedrosselte Lauf holt die ausgefallenen Takte nach', timely(grober, createInitialGameState(SEED), 10_000));
  check('Die Summe der Schritte ist die vergangene Zeit', total(takte) === 10_000);
}

function tabSwitch() {
  section('Uhr: ein Tab-Wechsel ist kein Zeitverlust');
  const takte = [700, 30, 12, 800, 5, 953, 1];
  const gemischt = rig().stream(takte);
  const gleichmaessig = steady(total(takte));
  check('Verstecken und Zeigen ergibt denselben Strom wie ein gleichmaessiger Lauf', sign(gemischt) === sign(gleichmaessig), `${gemischt.length} gegen ${gleichmaessig.length}`);
  check('Kein Schritt ueberschreitet dabei den Deckel', takte.every((ms) => ms <= CAP), `${Math.max(...takte)} ms`);
  check('Kein Takt faellt dabei aus', timely(gemischt, createInitialGameState(SEED), total(takte)));
}

function sleep() {
  section('Uhr: ein schlafender Rechner springt, statt nachzuholen');
  const lang = rig();
  const wach = lang.step(30 * MINUTE);
  const aktiv = active(lang.state)[0];
  const deckel = Math.floor(CAP / aktiv.everyMs);
  check('Der erste Schritt nach dem Schlaf traegt hoechstens den Deckel nach', counts(wach, aktiv) === deckel, `${counts(wach, aktiv)} statt ${deckel}`);
  check('Er traegt nicht die Abwesenheit nach', counts(wach, aktiv) < (30 * MINUTE) / aktiv.everyMs);
  const weiter = Array.from({ length: 10 }, () => 1000);
  const danach = lang.stream(weiter);
  check('Die Uhr laeuft danach im alten Takt weiter', timely(danach, lang.state, 10_000));
  const kontrolle = rig();
  kontrolle.step(CAP);
  check('Ein Schlaf kostet genau einen gedeckelten Schritt', sign(danach) === sign(kontrolle.stream(weiter)));
}

function absence() {
  section('Uhr: eine lange Abwesenheit holt nichts nach, sie springt');
  const lang = rig();
  const sprung = lang.step(3 * 60 * MINUTE);
  check('Drei Stunden Abwesenheit bleiben ein gedeckelter Schritt', timely(sprung, lang.state, CAP), `${sprung.length} Aktionen`);
  const kurz = rig();
  kurz.step(CAP);
  check('Danach ist die Uhr genau die einer gedeckelten Rueckkehr', sign(lang.stream([400, CAP, 7])) === sign(kurz.stream([400, CAP, 7])));
  check('Kein Takt traegt mehr als der Deckel hergibt', active(lang.state).every((tick) => counts(sprung, tick) <= CAP / tick.everyMs));
}

function jitter() {
  section('Uhr: CPU-Spikes und ungleiche Schritte verlieren keine Zeit');
  const takte = [17, 3, 480, 1, 999, 250, 61, CAP, 999, 7, 812, 13];
  const runner = rig();
  const actions = runner.stream(takte);
  const gesamt = total(takte);
  check('Kein Schritt liegt ueber dem Deckel', takte.every((ms) => ms <= CAP), `${Math.max(...takte)} ms`);
  check('Die Summe der Schritte ist die vergangene Zeit', gesamt === 4642, `${gesamt} ms`);
  check('Der Taktstrom ist zeitgetreu ueber alle Spikes', timely(actions, runner.state, gesamt));
  check('Er ist Zeichen fuer Zeichen der eines gleichmaessigen Laufs', sign(actions) === sign(steady(gesamt)), `${actions.length} Aktionen`);
}

function missedTicks() {
  section('Uhr: mehrere verpasste Takte zaehlen weder doppelt noch gar nicht');
  const tick = active(createInitialGameState(SEED))[0];
  const einSchritt = rig().stream([3 * tick.everyMs]);
  const dreiSchritte = rig().stream(Array.from({ length: 3 }, () => tick.everyMs));
  check('Drei verpasste Takte ergeben denselben Strom wie ein Schritt', sign(einSchritt) === sign(dreiSchritte), sign(einSchritt).slice(0, 60));
  check('Kein Takt faellt aus', counts(einSchritt, tick) === 3, `${counts(einSchritt, tick)} statt 3`);
  check('Und keiner kommt zweimal', counts(dreiSchritte, tick) === 3, `${counts(dreiSchritte, tick)} statt 3`);
  const herz = 3 * GAME_TIME.heartbeatMs;
  check('Drei ganze Herzschlaege holen ihren Teil nach', counts(rig().stream([herz]), tick) === Math.floor(herz / tick.everyMs));
  check('Ein Sprung ueber den Deckel verdoppelt nichts', timely(rig().stream([20 * GAME_TIME.heartbeatMs]), createInitialGameState(SEED), CAP));
}

function quietRun() {
  section('Uhr: eine schweigende Uhr staut nichts an');
  const runner = rig();
  const still = quiet(runner.state);
  check('Es gibt ueberhaupt eine schweigende Uhr', still.length > 0, still.map((tick) => tick.action).join(', '));
  const actions = runner.stream(Array.from({ length: 10 }, () => 1000));
  check('Auch nach zehn Sekunden bleibt sie still', still.every((tick) => counts(actions, tick) === 0));
  check('Die laufenden Uhren waehrenddessen schon', active(runner.state).some((tick) => counts(actions, tick) > 0));
}

function backwards() {
  section('Uhr: ein Ruecksprung der Systemzeit zaehlt nicht doppelt');
  const runner = rig();
  const erste = runner.stream(Array.from({ length: 5 }, () => 1000));
  const zurueck = runner.back(3000);
  check('Der Ruecksprung selbst feuert nichts nach', zurueck.length === 0, `${zurueck.length} Aktionen`);
  const weiter = runner.stream(Array.from({ length: 4 }, () => 1000));
  const tick = active(runner.state)[0];
  check('Nach dem Ruecksprung laeuft die Uhr ab dem alten Stand weiter', timely(weiter, runner.state, 1000));
  check('Der Ruecksprung wird weder doppelt gezaehlt noch nachgeholt',
    counts([...erste, ...weiter], tick) === Math.floor(runner.at() / tick.everyMs),
    `${counts([...erste, ...weiter], tick)} Takte fuer ${runner.at()} ms`);
  const sauber = steady(9000);
  check('Die verlorene Spanne holt die Uhr nicht nach', counts([...erste, ...weiter], tick) < counts(sauber, tick), `${counts([...erste, ...weiter], tick)} gegen ${counts(sauber, tick)} Takte einer ehrlichen Uhr`);
}

function systemTime() {
  section('Uhr: die Systemzeit erreicht die monotone Naht nicht');
  const propen = [];
  for (let index = 0; index < 200; index += 1) propen.push(monotonicNow());
  check('Die echte Naht laeuft nur vorwaerts', propen.every((wert, index) => index === 0 || wert >= propen[index - 1]));
  let wall = 0;
  let at = 0;
  const state = createInitialGameState(SEED);
  const clock = createGameClock({ now: () => at });
  const actions = [500, 500, 500].flatMap((ms) => {
    at += ms;
    wall += 3600 * 1000;
    return clock.beat(state);
  });
  check('Eine um Stunden verschobene Systemuhr aendert den Taktstrom nicht', sign(actions) === sign(rig().stream([500, 500, 500])), `${wall / 3600000} h verschoben`);
  const doppelt = rig();
  doppelt.stream([500, 500]);
  check('Dieselbe Messung zweimal liefert keine Takte', doppelt.stream([0]).length === 0);
}

export function checkGameClockEdges() {
  backgroundTab();
  tabSwitch();
  sleep();
  absence();
  jitter();
  missedTicks();
  quietRun();
  backwards();
  systemTime();
}
