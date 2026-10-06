/** Gruppenbewegung auf dem fremden Dungeon: ein Cursor, ein Pfad, eine Erkundung. */
import { cellCost } from '../../src/domain/raid/raid-path.js';
import { orderFrom } from '../../src/domain/raid/raid-move.js';
import { RAID_VERB } from '../../src/domain/raid/raid-verbs.js';
import { RAID_CONFIG } from '../../src/domain/raid/raid-config.js';
import { RAID_ACTION } from '../../src/domain/raid/raid-actions.js';
import { check, section } from './expect.mjs';
import { raidState, raidWorld, runTicks, digTo, westOf, knownCount } from './raid-fixture.mjs';

function pathPrice(state, world) {
  return state.path.reduce((sum, id) => sum + cellCost(state, world, id), 0);
}

/** Die Grabefolge der Idle-Erkundung, gemessen. Sie haengt an der Reihenfolge
 *  von `frontierOf()`, und die kommt aus `Object.keys(state.dug)`. */
const EXPLORE_ORDER = '60,28|59,28|61,28|61,27|62,27|62,26|60,27';

function checkOneCursor() {
  section('Ein Cursor für das Team');
  const state = raidState();
  check('Die Gruppe steht auf ihrem Einmarschspunkt', state.at.x === state.entry.x && state.at.y === state.entry.y);
  check('Kein Held trägt eine eigene Position', state.heroes.every((hero) => hero.at === undefined));
}

function checkOrderSetsPath() {
  section('Ein Befehl setzt den Pfad');
  const state = raidState();
  const world = raidWorld();
  const ordered = orderFrom(state, world, { verb: RAID_VERB.DIG, ...westOf(state, 2) });
  check('Der Befehl trägt das Verb', ordered.order?.verb === RAID_VERB.DIG);
  check('Der Befehl setzt einen Pfad, keinen Sprung', ordered.path.length === 2, `${ordered.path.length} Schritte`);
  check('Der Pfad kostet zwei Erdfelder', pathPrice(ordered, world) === RAID_CONFIG.earthCost * 2, `${pathPrice(ordered, world)}`);
  check('Der Befehl selbst ist gratis, das Gehen nicht', ordered.stamina === state.stamina);
  check('Ein unerreichbares Ziel lässt den Zustand unberührt', orderFrom(state, world, { verb: RAID_VERB.DIG, x: 0, y: 0 }) === state);
}

function checkPaying() {
  section('Gehen zahlt, der eigene Tunnel nicht');
  const state = raidState();
  const world = raidWorld();
  const goal = westOf(state, 2);
  const dug = digTo(state, world, goal);
  check('Die Gruppe ist gegangen', dug.at.x === goal.x && dug.at.y === goal.y);
  check('Zwei Grabfelder kosten zwei Ausdauer', state.stamina - dug.stamina === 2, `${state.stamina - dug.stamina}`);
  check('Der Snapshot bleibt unberührt, der Grabfortschritt nicht', knownCount(dug) === 2);
  check('Der eigene Tunnel kostet beim Zurückgehen nichts', digTo(dug, world, { x: goal.x + 1, y: goal.y }).stamina === dug.stamina);
  check('Jeder Schritt steht als Verb im Log', dug.log.every((entry) => Object.values(RAID_ACTION).includes(entry.type)));
}

function checkFailClosed() {
  section('Fail closed');
  const world = raidWorld();
  const broke = { ...raidState(), stamina: 0 };
  const stepped = runTicks(broke, world, 3);
  check('Ohne Ausdauer bewegt sich die Gruppe nicht', stepped.at.x === broke.at.x && stepped.at.y === broke.at.y);
  const costly = orderFrom(raidState(), world, { verb: RAID_VERB.DIG, ...westOf(raidState(), 3) });
  check('Ein toter Befehl fällt auf die Erkundung zurück', runTicks({ ...costly, stamina: 0 }, world, 1).order === null);
}

function checkIdleExplores() {
  section('Idle-Erkundung');
  const world = raidWorld();
  const state = raidState();
  const explored = runTicks(state, world, 8);
  check('Ohne Befehl gräbt die Gruppe von selbst', knownCount(explored) >= 4, `${knownCount(explored)} Felder`);
  check('Der Idle-Takt handelt von selbst', runTicks(state, world, 1).log.length > 0);
  check('Die Erkundung führt keinen Angriff aus', explored.log.every((entry) => entry.verb !== RAID_VERB.ATTACK));
  check('Die Erkundung wiederholt sich', runTicks(explored, world, 8).dug !== explored.dug);
  const weit = Object.keys(runTicks(state, world, 12).dug).join('|');
  check('Die Reihenfolge der Erkundung ist Teil des Replay-Formats', weit === EXPLORE_ORDER, weit);
}

function checkAttack() {
  section('Der Angriff zahlt AP');
  const state = raidState();
  const world = raidWorld();
  const target = westOf(state, 2);
  const ordered = orderFrom(state, world, { verb: RAID_VERB.ATTACK, ...target });
  const hit = runTicks(ordered, world, 4);
  check('Der Angriffsbefehl zielt neben das Ziel, nicht hinein', ordered.target.x === target.x);
  check('Der Angriff ist ausgeführt', hit.log.some((entry) => entry.verb === RAID_VERB.ATTACK));
  check('Jeder Held mit AP zahlt mit', hit.heroes.every((hero) => hero.ap === hero.apMax - RAID_CONFIG.attackApCost), `${hit.heroes[0].ap} AP`);
  const dry = { ...state, heroes: state.heroes.map((hero) => ({ ...hero, ap: 0 })) };
  check('Ohne AP gibt es keinen Schlag', runTicks(orderFrom(dry, world, ordered.order), world, 4).log.every((e) => e.verb !== RAID_VERB.ATTACK));
}

export function checkRaidMove() {
  checkOneCursor();
  checkOrderSetsPath();
  checkPaying();
  checkFailClosed();
  checkIdleExplores();
  checkAttack();
}