/**
 * Der Bau-Durchlauf als Simulation: Onboarding, sechs Felder abbauen, dann
 * Extraktor, Schwarmhort und Brutlord bauen — mit virtueller Uhr, echten
 * Reducern und demselben Arbeitstakt wie im Browser.
 *
 * Das Ergebnis sind Beobachtungen, kein Test: die Prüfungen entscheiden, was
 * davon gelten muss.
 */
import { ACTION } from '../../src/domain/actions/action-types.js';
import { BUILDING_TYPE, canAfford } from '../../src/domain/buildings/building-config.js';
import { JOB_CONFIG } from '../../src/domain/labour/job-config.js';
import { ONBOARDING_CONFIG } from '../../src/domain/onboarding/onboarding-config.js';
import { tileId } from '../../src/domain/world/tile.js';
import { VirtualClock } from './virtual-clock.mjs';

/** Der Raum des Durchlaufs: das erste Feld plus ein 2x2-Feld daneben. */
function roomTiles() {
  const { x, y } = ONBOARDING_CONFIG.firstEarthBlock;
  return [
    { x, y },
    { x: x + 1, y },
    { x, y: y + 1 },
    { x: x + 1, y: y + 1 },
    { x, y: y + 2 },
    { x: x + 1, y: y + 2 },
  ];
}

export const ROOM = Object.freeze(roomTiles());
export const ROOM_IDS = Object.freeze(ROOM.map(({ x, y }) => tileId(x, y)));
/** Wo im Durchlauf gebaut wird — je Bau eine eigene Stelle. */
export const SITE_TILES = Object.freeze({
  extractor: ROOM_IDS[0],
  swarmHost: ROOM_IDS[1],
  bruteLord: ROOM_IDS[2],
  /** Ein Feld neben dem Raum — nie abgebaut, also kein Bauplatz. */
  earth: tileId(roomTiles()[0].x + 2, roomTiles()[0].y),
});

function mine(clock, id) {
  clock.dispatch(ACTION.TILE_SELECTED, { tileId: id });
  clock.dispatch(ACTION.MINING_ORDERED);
  clock.run();
}

function tickOnce(clock) {
  clock.dispatch(ACTION.WORK_TICK, { dtMs: JOB_CONFIG.tickMs });
}

/** Takt für Takt, bis die Bedingung stimmt — oder die Geduld reißt. */
function tickUntil(clock, limitMs, reached) {
  let elapsed = 0;
  while (elapsed < limitMs && !reached(clock.state)) {
    tickOnce(clock);
    elapsed += JOB_CONFIG.tickMs;
  }
  return elapsed;
}

function tickFor(clock, durationMs) {
  return tickUntil(clock, durationMs, () => false);
}

function choose(clock, type) {
  clock.dispatch(ACTION.BUILD_CHOSEN, { buildingType: type });
  return clock.state.buildChoice === type;
}

function place(clock, id) {
  clock.dispatch(ACTION.BUILDING_PLACED, { tileId: id });
  return clock.state.buildings.at(-1) ?? null;
}

/** Warten, bis dieser Bauplatz bezahlt ist: geliefert heißt fertig. */
function paid(building) {
  return Boolean(building) && building.delivered >= building.required;
}

function buildExtractor(clock) {
  choose(clock, BUILDING_TYPE.ESSENCE_EXTRACTOR);
  const site = place(clock, SITE_TILES.extractor);
  const builtInMs = tickUntil(clock, 30000, (state) => paid(state.buildings[0]));
  return {
    required: site.required,
    stateBefore: site.state,
    state: clock.state.buildings[0].state,
    essenceAfter: clock.state.essence,
    builtInMs,
  };
}

/** Ein Arbeiter am Extraktor: ein Zyklus, dann liegt die erste Essenz im Hive. */
function runExtractorCycle(clock) {
  clock.dispatch(ACTION.WORKER_ASSIGNED, { buildingId: clock.state.buildings[0].id });
  const afterMs = tickUntil(clock, 40000, (state) => state.essence > 0);
  const popup = clock.state.popups[0] ?? null;
  return {
    afterMs,
    essence: clock.state.essence,
    popups: clock.state.popups.length,
    popupAt: popup ? { x: popup.x, y: popup.y } : null,
    workers: clock.state.buildings[0].workers.length,
  };
}

function buildSwarmHost(clock) {
  tickUntil(clock, 200000, (state) => canAfford(state.essence, BUILDING_TYPE.SWARM_HOST));
  choose(clock, BUILDING_TYPE.SWARM_HOST);
  place(clock, SITE_TILES.swarmHost);
  const builtInMs = tickUntil(clock, 200000, (state) => paid(state.buildings[1]));
  const before = clock.state.dunglings.length;
  /** Lange genug, dass der Hort mehrfach brütet — nur so füllt sich der Schwarm. */
  tickFor(clock, 100000);
  return {
    state: clock.state.buildings[1].state,
    builtInMs,
    spawnedAfter: clock.state.dunglings.length - before,
  };
}

/** Vier Zuweisungen an denselben Extraktor — mehr als die Grenze geht nicht. */
function staffToLimit(clock) {
  const buildingId = clock.state.buildings[0].id;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    clock.dispatch(ACTION.WORKER_ASSIGNED, { buildingId });
  }
  return clock.state.buildings[0].workers.length;
}

/** Ein zweiter Bau auf demselben Feld ist kein Bau — die Zahl bleibt gleich. */
function tryPlace(clock, id) {
  const before = clock.state.buildings.length;
  place(clock, id);
  return clock.state.buildings.length === before;
}

function refusesOccupied(clock) {
  choose(clock, BUILDING_TYPE.ESSENCE_EXTRACTOR);
  const refused = tryPlace(clock, SITE_TILES.extractor);
  choose(clock, BUILDING_TYPE.ESSENCE_EXTRACTOR);
  return refused;
}

function buildBruteLord(clock) {
  tickUntil(clock, 400000, (state) => canAfford(state.essence, BUILDING_TYPE.BRUTE_LORD));
  choose(clock, BUILDING_TYPE.BRUTE_LORD);
  const site = place(clock, SITE_TILES.bruteLord);
  const builtInMs = tickUntil(clock, 60000, (state) => paid(state.buildings.at(-1)));
  return {
    required: site.required,
    tileCount: site.tileIds.length,
    state: clock.state.buildings.at(-1).state,
    builtInMs,
  };
}

/** Onboarding, Abbau und die erste Ablehnung: der Start des Durchlaufs. */
function prepare(clock) {
  clock.dispatch(ACTION.HIVE_CLICKED);
  clock.run();
  for (const id of ROOM_IDS) mine(clock, id);
  return {
    mined: { usableTileCount: clock.state.usableTileCount, essence: clock.state.essence },
    bruteLordRefused: !choose(clock, BUILDING_TYPE.BRUTE_LORD),
    essenceStart: clock.state.essence,
  };
}

export function buildRun() {
  const clock = new VirtualClock();
  const start = prepare(clock);
  const extractor = { ...buildExtractor(clock), essenceStart: start.essenceStart };
  const cycle = runExtractorCycle(clock);
  extractor.workers = cycle.workers;
  const swarm = buildSwarmHost(clock);
  extractor.workersAtCap = staffToLimit(clock);
  const occupiedRefused = refusesOccupied(clock);
  const earthRefused = tryPlace(clock, SITE_TILES.earth);
  const bruteLord = buildBruteLord(clock);
  swarm.dunglingsAtEnd = clock.state.dunglings.length;
  return { ...start, extractor, cycle, swarm, bruteLord, occupiedRefused, earthRefused, essence: clock.state.essence };
}
