/** Zwei Zahlen, die sich sonst nie begegnen: der Ring, das Budget, die Fassung. */
import { RAID_CONFIG, RAID_FORMAT_VERSION, worstEntryDistance } from '../../src/domain/raid/raid-config.js';
import { candidates } from '../../src/domain/raid/raid-spawn-seed.js';
import { createRaidState, stateHashInput } from '../../src/domain/raid/raid-state.js';
import { orderFrom } from '../../src/domain/raid/raid-move.js';
import { RAID_VERB } from '../../src/domain/raid/raid-verbs.js';
import { check, section } from './expect.mjs';
import { raidState, raidWorld, raidTicket, runTicks, westOf, SNAPSHOT_SEED } from './raid-fixture.mjs';

const GOLDEN = Object.freeze({
  count: 4067,
  first: Object.freeze({ x: 2, y: 0 }),
  last: Object.freeze({ x: 59, y: 63 }),
});

function steps(world, point) {
  return Math.abs(point.x - world.hiveOrigin.x) + Math.abs(point.y - world.hiveOrigin.y);
}

function checkEntryBudget() {
  section('Einmarsch und Ausdauer');
  const world = raidWorld();
  const list = candidates(world, { origin: world.hiveOrigin });
  const corner = { x: world.width - 1, y: world.height - 1 };
  const worst = worstEntryDistance();
  check('Der schlimmste Einmarsch ist der Ring, nicht die Kartenecke', worst === Math.min(RAID_CONFIG.entryRadius, steps(world, corner)), `${worst}`);
  check('Der Wert ist im Ring auch erreichbar', list.some((point) => steps(world, point) === worst));
  check('Die Basis-Ausdauer trägt den schlimmsten Einmarsch', RAID_CONFIG.baseStamina > worst, `${RAID_CONFIG.baseStamina} gegen ${worst}`);
}

function checkCandidateOrder() {
  section('Die Kandidatenliste ist Teil des Formats');
  const list = candidates(raidWorld(), { origin: raidWorld().hiveOrigin });
  check('Die Länge der Liste steht fest', list.length === GOLDEN.count, `${list.length}`);
  check('Die Liste beginnt bei (2,0)', list[0].x === GOLDEN.first.x && list[0].y === GOLDEN.first.y);
  check('Die Liste endet bei (59,63)', list[list.length - 1].x === GOLDEN.last.x && list[list.length - 1].y === GOLDEN.last.y);
}

function checkFormatMark() {
  section('Die Fassungsmarke im Zustand');
  const state = raidState();
  const world = raidWorld();
  check('Der Zustand trägt die Fassung', state.format === RAID_FORMAT_VERSION, `${state.format}`);
  check('Der Hash rechnet sie mit ein', stateHashInput(state).format === RAID_FORMAT_VERSION);
  check('Der Hash sieht die Gruppenposition', stateHashInput(state).at.x === state.at.x);
  const moved = orderFrom(state, world, { verb: RAID_VERB.DIG, ...westOf(state, 1) });
  check('Eine Bewegung ändert den Hash', JSON.stringify(stateHashInput(moved)) !== JSON.stringify(stateHashInput(state)));
}

function checkReproducibility() {
  section('Der fremde Dungeon ist reproduzierbar');
  const ticket = raidTicket();
  const world = raidWorld(ticket.snapshotSeed);
  const first = createRaidState(ticket);
  const walked = runTicks(first, world, 5);
  const terrainOfWorld = (seed) => JSON.stringify(raidWorld(seed).tiles.map((tile) => tile.terrain ?? null));
  check('Derselbe Seed ergibt dasselbe Hartgestein', terrainOfWorld(SNAPSHOT_SEED) === terrainOfWorld(SNAPSHOT_SEED));
  check('Ein anderer Seed ergibt anderes Hartgestein', terrainOfWorld(SNAPSHOT_SEED) !== terrainOfWorld(SNAPSHOT_SEED + 1));
  check('Zwei Starts aus einem Ticket sind gleich', JSON.stringify(stateHashInput(first)) === JSON.stringify(stateHashInput(createRaidState(ticket))));
  check('Die Erkundung endet reproduzierbar', JSON.stringify(stateHashInput(walked)) === JSON.stringify(stateHashInput(runTicks(createRaidState(ticket), world, 5))));
}

export function checkRaidFormat() {
  checkEntryBudget();
  checkCandidateOrder();
  checkFormatMark();
  checkReproducibility();
}