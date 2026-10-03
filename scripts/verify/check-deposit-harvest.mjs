/** Die Ernte: der Vorrat leert sich im Takt des Grabens, drei Stufen, am Ende tot. */
import { DEPOSIT_PHASE, ESSENCE_STAGE, STAGE_MIN_SHARE } from '../../src/domain/deposits/deposit-config.js';
import { depositStage, harvestTick } from '../../src/domain/deposits/deposit-state.js';
import { mineTile } from '../../src/domain/actions/mining.js';
import { totalMiningTicks } from '../../src/domain/onboarding/onboarding-schedule.js';
import { allTiles, createWorld } from '../../src/domain/world/grid.js';
import { checkDepositFlow } from './check-deposit-flow.mjs';
import { check, section } from './expect.mjs';

const TICKS = totalMiningTicks();

function firstDeposit(world) {
  const tile = allTiles(world).find((entry) => entry.depositId);
  return { tile, deposit: world.deposits[tile.depositId] };
}

function harvestAlong(world, tile, ticks) {
  const steps = [];
  let current = world;
  for (let index = 1; index <= ticks; index += 1) {
    const step = harvestTick(current, tile, index / ticks);
    steps.push({ ...step, stage: depositStage(step.world.deposits[tile.depositId]) });
    current = step.world;
  }
  return { world: current, steps };
}

function checkSingle(world) {
  const { tile, deposit } = firstDeposit(world);
  const hidden = harvestTick(world, tile, 0.5);
  const opened = harvestTick(mineTile(world, tile), tile, 0.5);
  const plain = allTiles(world).find((entry) => !entry.depositId);
  const bare = harvestTick(world, plain, 0.5);
  section('Ernte: ein Takt am offenen Vorrat');
  check('Ein verborgener Vorrat gibt nichts her', hidden.gained === 0 && hidden.world === world);
  check('Halber Fortschritt nimmt die halbe Kapazität', opened.gained === Math.ceil(deposit.capacity / 2), `${opened.gained}`);
  check('Gewöhnliche Erde trägt keinen Vorrat', bare.gained === 0 && bare.world === world);
}

function checkDrain(world) {
  const { tile, deposit } = firstDeposit(world);
  const drained = harvestAlong(mineTile(world, tile), tile, TICKS);
  const end = drained.world.deposits[tile.depositId];
  const gains = drained.steps.reduce((sum, step) => sum + step.gained, 0);
  section('Ernte: der Vorrat läuft leer');
  check('Jeder Takt nimmt Essenz heraus', drained.steps.every((step) => step.gained > 0));
  check('Der Vorrat endet leer, nicht darunter', end.pool === 0, `Pool ${end.pool}`);
  check('Kapazität bleibt die Summe aus Pool und Ernte', end.pool + gains === deposit.capacity);
  check('Der Vorrat endet als SPENT', end.phase === DEPOSIT_PHASE.SPENT);
  check('Erst der letzte Takt meldet das Ende', drained.steps.filter((s) => s.depleted).length === 1 && drained.steps.at(-1).depleted);
  check('Nach dem Ende gibt es nichts mehr', harvestTick(drained.world, tile, 1).gained === 0);
}

function checkStages(world) {
  const { tile, deposit } = firstDeposit(world);
  const drained = harvestAlong(mineTile(world, tile), tile, TICKS);
  const seen = [];
  for (const step of drained.steps) {
    if (seen.at(-1) !== step.stage) seen.push(step.stage);
  }
  const at = (pool) => depositStage({ pool, capacity: deposit.capacity });
  section('Ernte: die drei Lesbarkeits-Stufen');
  check('Ein voller Vorrat beginnt reichhaltig', depositStage(deposit) === ESSENCE_STAGE.RICH, depositStage(deposit));
  check('Die Stufenfolge ist RICH → MEDIUM → LEAN → DEAD', seen.join('|') === 'RICH|MEDIUM|LEAN|DEAD', seen.join('|'));
  check('Reichhaltig reicht bis 75 Prozent', at(Math.floor(deposit.capacity * STAGE_MIN_SHARE.RICH)) === ESSENCE_STAGE.RICH);
  check('Mittel reicht bis 25 Prozent', at(Math.floor(deposit.capacity * STAGE_MIN_SHARE.MEDIUM)) === ESSENCE_STAGE.MEDIUM);
  check('Fast leer endet erst bei null', at(1) === ESSENCE_STAGE.LEAN && at(0) === ESSENCE_STAGE.DEAD);
}

export function checkDepositHarvest(context) {
  const world = createWorld();
  checkSingle(world);
  checkDrain(world);
  checkStages(world);
  checkDepositFlow(context);
}