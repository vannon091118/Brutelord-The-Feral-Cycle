/**
 * Das Opening als Wahl: eine Zusage bindet Essenz, also kann sich der Spieler
 * nicht zwei Türen gleichzeitig versprechen. Gefragt wird über dieselben
 * Aktionen, die auch im Browser laufen — nicht über abgeschriebene Zahlen.
 */
import { readFileSync } from 'node:fs';
import { ACTION } from '../../src/domain/actions/action-types.js';
import { BUILDING_DEFS, BUILDING_STATE, BUILDING_TYPE, START_ESSENCE } from '../../src/domain/buildings/building-config.js';
import { committedEssence, spendableEssence } from '../../src/domain/buildings/building.js';
import { selectPlacement } from '../../src/state/selectors.js';
import { openingRun } from './build-run.mjs';
import { check, section } from './expect.mjs';

const EXTRACTOR = BUILDING_TYPE.ESSENCE_EXTRACTOR;
const HOST = BUILDING_TYPE.SWARM_HOST;
const LORD = BUILDING_TYPE.BRUTE_LORD;
const LIMIT = 120000;

const cost = (type) => BUILDING_DEFS[type].cost;

function chooseDoor(clock, type) {
  clock.dispatch(ACTION.BUILD_CHOSEN, { buildingType: type });
  return clock.state.buildChoice === type;
}

function doorOpen(clock, type) {
  const offen = chooseDoor(clock, type);
  if (offen) clock.dispatch(ACTION.BUILD_CHOSEN, { buildingType: type });
  return offen;
}

function buildDoor(clock, type) {
  if (!chooseDoor(clock, type)) return null;
  const spot = selectPlacement(clock.state)?.spots[0]?.id ?? null;
  clock.dispatch(ACTION.BUILDING_PLACED, { tileId: spot });
  return clock.state.buildings.at(-1) ?? null;
}

function ready(state, id) {
  return state.buildings.find((building) => building.id === id)?.state === BUILDING_STATE.READY;
}

function tickWork(clock, tickMs, reached) {
  let ms = 0;
  while (ms < LIMIT && !reached(clock.state)) {
    clock.dispatch(ACTION.WORK_TICK, { dtMs: tickMs });
    ms += tickMs;
  }
  return ms;
}

function pressHive(clock, tickMs, wanted) {
  let ms = 0;
  while (clock.state.essence < wanted && ms < LIMIT) {
    clock.dispatch(ACTION.HIVE_TICK, { dtMs: tickMs });
    ms += tickMs;
  }
  return ms;
}

function checkPot(run) {
  section('Opening: der Startvorrat kauft eine Tür');
  const menue = run.clock.state;
  check(
    'Der Startvorrat kauft nie zwei Türen zugleich',
    START_ESSENCE < cost(EXTRACTOR) + cost(HOST),
    `${START_ESSENCE} gegen ${cost(EXTRACTOR)} + ${cost(HOST)}`,
  );
  check('Das Baumenü öffnet mit Essenz für beide billigen Türen', menue.essence >= cost(HOST), `${menue.essence} Essenz`);
  check('Das Baumenü ist wirklich offen', run.clock.state.buildMenuVisible === true);
  check('Beide billigen Türen stehen offen', doorOpen(run.clock, EXTRACTOR) && doorOpen(run.clock, HOST));
  check('Die teuerste Tür ist noch zu', !doorOpen(run.clock, LORD));
  check(
    'Ohne Bauplatz ist nichts gebunden',
    committedEssence(menue.buildings) === 0 && spendableEssence(menue.essence, menue.buildings) === menue.essence,
  );
}

function checkPromise(run) {
  section('Opening: ein Bauplatz bindet seinen Preis');
  const vorher = run.clock.state.essence;
  const site = buildDoor(run.clock, EXTRACTOR);
  check('Der Bauplatz steht', Boolean(site));
  check('Der Bauplatz bindet seinen ganzen Preis', committedEssence(run.clock.state.buildings) === cost(EXTRACTOR));
  check(
    'Frei bleibt nur die Essenz ohne den Bauplatz',
    spendableEssence(run.clock.state.essence, run.clock.state.buildings) === vorher - cost(EXTRACTOR),
  );
  check(
    'Die zweite Tür ist zu, obwohl die Essenz reicht',
    run.clock.state.essence >= cost(HOST) && !doorOpen(run.clock, HOST),
    `${run.clock.state.essence} Essenz, ${spendableEssence(run.clock.state.essence, run.clock.state.buildings)} frei`,
  );
  check('Auch die teuerste Tür bleibt zu', !doorOpen(run.clock, LORD));
  check(
    'Solange der Bauplatz offen ist, steht keine Tür mehr offen',
    !doorOpen(run.clock, EXTRACTOR) && !doorOpen(run.clock, HOST),
  );
  return site;
}

function checkReopen(run, site) {
  section('Opening: die Tür geht wieder auf — eine Verzögerung, kein Schloss');
  tickWork(run.clock, run.tickMs, (state) => ready(state, site.id));
  check('Der Bauplatz ist bezahlt', ready(run.clock.state, site.id));
  check('Bezahlt ist nichts mehr gebunden', committedEssence(run.clock.state.buildings) === 0);
  const waitMs = pressHive(run.clock, run.tickMs, cost(HOST));
  check('Die zweite Tür öffnet sich wieder', doorOpen(run.clock, HOST));
  check('Die zweite Tür kostet Wartezeit', waitMs > 0, `${waitMs} ms`);
}

function checkReserve(run) {
  section('Opening: die Reserve ist die vierte Tür');
  const zweiter = buildDoor(run.clock, HOST);
  check('Die zweite Tür lässt sich bauen', Boolean(zweiter));
  check(
    'Danach bleibt keine Essenz zum Graben',
    spendableEssence(run.clock.state.essence, run.clock.state.buildings) < run.digCost,
    `${spendableEssence(run.clock.state.essence, run.clock.state.buildings)} frei, ein Abbau kostet ${run.digCost}`,
  );
  check('Ein Abbau kostet überhaupt Essenz', run.digCost > 0);
}

function checkWiring() {
  section('Opening: die Türen stehen im Baumenü');
  const menu = readFileSync('src/ui/BuildMenu.jsx', 'utf8');
  const button = readFileSync('src/ui/BuildOptionButton.jsx', 'utf8');
  check('Das Baumenü rechnet mit dem freien Vorrat', menu.includes('spendableEssence'));
  check('Das Baumenü nennt die gebundene Essenz', menu.includes('boundNote'));
  check('Jede Tür nennt, was sie freilässt', button.includes('remainderFor') && button.includes('bleibt'));
  check('Die Reserve wird gewarnt, wo nichts mehr frei ist', button.includes('kein Abbau mehr'));
}

export function checkOpening() {
  const run = openingRun();
  checkPot(run);
  const site = checkPromise(run);
  checkReopen(run, site);
  checkReserve(run);
  checkWiring();
}
