/** Vorratsplatzierung geprüft: Isolation, Determinismus, Budget, Sperrzonen, Zustand. */
import {
  CLUSTER_COUNT_MAX,
  CLUSTER_COUNT_MIN,
  DEPOSIT_CONFIG,
  DEPOSIT_PHASE,
  WORLD_ESSENCE_BUDGET,
  hiveDistance,
} from '../../src/domain/deposits/deposit-config.js';
import { touchingTiles } from '../../src/domain/deposits/deposit-hint.js';
import { canMineTile, mineTile } from '../../src/domain/actions/mining.js';
import { allTiles, createWorld, getTile, neighborIds } from '../../src/domain/world/grid.js';
import { spreadToNeighbors, startRooting, tickRooting } from '../../src/domain/world/rooting-world.js';
import { checkDepositHarvest } from './check-deposit-harvest.mjs';
import { check, section } from './expect.mjs';

const BIG_TICK = 60000;

export function checkDeposits() {
  const world = createWorld();
  checkIsolation(world);
  checkDeterminism();
  checkBudget(world);
  checkCapacity(world);
  checkExclusion(world);
  checkStates(world);
  checkDepositHarvest(rootedTarget());
}

// Ein Nachbarfeld graben, die Wurzeln laufen lassen und den Vorrat daneben
// aufdecken — genau der Weg, den das Spiel nimmt.
function rootBeside(world, anchorId) {
  const mined = mineTile(world, getTile(world, anchorId));
  const rested = tickRooting(startRooting(mined, getTile(mined, anchorId)), BIG_TICK);
  const claimed = tickRooting(rested.world, BIG_TICK);
  return spreadToNeighbors(claimed.world, claimed.spreading);
}

function rootedTarget() {
  const world = createWorld();
  const deposit = clusterList(world).find((entry) => entry.phase === DEPOSIT_PHASE.BURIED);
  const targetId = deposit.cells[0];
  const anchors = neighborIds(world, targetId).filter((id) => !getTile(world, id).depositId);
  const rooted = anchors.map((id) => rootBeside(world, id)).find((entry) => canMineTile(entry, targetId));
  section('Vorräte: der Weg in den Abbau');
  check('Der aufgedeckte Nachbarvorrat lässt sich abbauen', Boolean(rooted));
  return { rooted: rooted ?? world, targetId };
}

function clusterList(world) {
  return Object.values(world.deposits);
}

function depositTiles(world) {
  return allTiles(world).filter((tile) => tile.depositId);
}

function signature(world) {
  return clusterList(world)
    .map((deposit) => `${deposit.id}|${deposit.phase}|${deposit.pool}|${deposit.capacity}|${deposit.size}|${deposit.cells.join(',')}`)
    .join(';');
}

function checkIsolation(world) {
  const tiles = depositTiles(world);
  const foreign = tiles.filter((tile) => touchesForeign(world, tile));
  const cells = tiles.map((tile) => tile.id);
  section('Vorräte: Isolation ohne Redundanz');
  check('Kein Vorratsfeld grenzt an einen fremden Vorrat', foreign.length === 0, `${foreign.length} Konflikte`);
  check('Jede Zelle gehört zu genau einem Vorrat', new Set(cells).size === cells.length, `${cells.length} Zellen`);
}

function touchesForeign(world, tile) {
  return touchingTiles(world, tile).some(
    (neighbor) => neighbor.depositId && neighbor.depositId !== tile.depositId,
  );
}

function checkDeterminism() {
  const equal = signature(createWorld()) === signature(createWorld());
  section('Vorräte: Determinismus');
  check('Zwei Weltentstehungen liefern dieselben Vorräte', equal);
}

function checkBudget(world) {
  const list = clusterList(world);
  const total = list.reduce((sum, deposit) => sum + deposit.pool, 0);
  section('Vorräte: Weltbudget');
  check('Die Clusterzahl liegt im Band', list.length >= CLUSTER_COUNT_MIN && list.length <= CLUSTER_COUNT_MAX, `${list.length} Cluster`);
  check('Die Essenz der Welt entspricht dem Budget', total === WORLD_ESSENCE_BUDGET, `${total} statt ${WORLD_ESSENCE_BUDGET}`);
}

function checkCapacity(world) {
  const wrong = clusterList(world).filter((deposit) => !isSound(deposit, DEPOSIT_CONFIG));
  section('Vorräte: Kapazität');
  check('Jeder Vorrat startet voll und bleibt in Größe und Obergrenze', wrong.length === 0, `${wrong.length} Abweichungen`);
  check('Kein Vorrat ist von Anfang an sichtbar', clusterList(world).every((deposit) => deposit.phase === DEPOSIT_PHASE.BURIED));
}

function isSound(deposit, conf) {
  return (
    deposit.pool === deposit.capacity &&
    deposit.capacity <= conf.capacityMax &&
    deposit.size >= conf.sizeMin &&
    deposit.size <= conf.sizeMax
  );
}

function checkExclusion(world) {
  const tiles = depositTiles(world);
  const near = tiles.filter((tile) => hiveDistance({ x: tile.x, y: tile.y, hiveOrigin: world.hiveOrigin, hiveSize: world.hiveSize }) <= DEPOSIT_CONFIG.hiveExclusion);
  section('Vorräte: Sperrzonen');
  check('Kein Vorrat liegt im Hive-Radius', near.length === 0, `${near.length} zu nah`);
  check('Burrow und Leiter bleiben frei', tiles.every((tile) => tile.id !== world.spawnTileId && !sameTile(tile, world.entrance)));
}

function sameTile(tile, other) {
  return tile.x === other.x && tile.y === other.y;
}

function checkStates(world) {
  const buried = clusterList(world).find((deposit) => deposit.phase === DEPOSIT_PHASE.BURIED);
  const claim = claimBesideDeposit(world, buried);
  const hinted = visibleAfter(claim.world);
  const again = visibleAfter(spreadToNeighbors(claim.world, [claim.anchorId]));
  section('Vorräte: Zustandswechsel');
  check('Ein geclaimtes Nachbarfeld macht genau einen Vorrat spürbar', onlyCluster(hinted, buried), `${hinted.length} sichtbar`);
  check('Ein zweiter Claim wiederholt den Hinweis nicht', onlyCluster(again, buried), `${again.length} sichtbar`);
  checkMine(world);
}

// Zwei große Ticks: der erste trägt GROWING zu RESTING, der zweite claimt und streut.
function claimBesideDeposit(world, deposit) {
  const target = getTile(world, deposit.cells[0]);
  const anchor = touchingTiles(world, target).find((tile) => !tile.depositId);
  const mined = mineTile(world, anchor);
  const growing = startRooting(mined, getTile(mined, anchor.id));
  const rested = tickRooting(growing, BIG_TICK);
  const claimed = tickRooting(rested.world, BIG_TICK);
  return { world: spreadToNeighbors(claimed.world, claimed.spreading), anchorId: anchor.id };
}

function visibleAfter(world) {
  return clusterList(world).filter((deposit) => deposit.phase === DEPOSIT_PHASE.HINTED);
}

function onlyCluster(hinted, deposit) {
  return hinted.length === 1 && hinted[0].id === deposit.id;
}

function checkMine(world) {
  const deposit = clusterList(world).find((entry) => entry.phase === DEPOSIT_PHASE.BURIED);
  const mined = mineTile(world, getTile(world, deposit.cells[0]));
  const found = mined.deposits[deposit.id];
  const opened = found.phase === DEPOSIT_PHASE.FOUND && found.pool === deposit.pool;
  check('Der Abbau öffnet den Vorrat und lässt seinen Pool ganz', opened, found.phase);
}
