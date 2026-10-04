/** Die Steinwirkung pro Einheit: eigene Steine, fremde Aura, fremde Spur. */
import { ACTION } from '../../src/domain/actions/action-types.js';
import { JOB_CONFIG } from '../../src/domain/labour/job-config.js';
import { STONE_TRAIT } from '../../src/domain/brutelord/stone-config.js';
import { NEUTRAL_EFFECTS, tickScale, unitEffects } from '../../src/domain/brutelord/stone-effects.js';
import { gameReducer } from '../../src/state/game-reducer.js';
import { check, section } from './expect.mjs';
import { labState, mutantWorker, withStones } from './lab-run.mjs';

const EXTRACTOR_ID = 'building-2';
const TICKS = 400;

function checkOwn() {
  section('Trait-Wirkung: eigene Steine');
  const base = labState().dunglings[0];
  check('Ein Dungling ohne Steine ist neutral', unitEffects(base) === NEUTRAL_EFFECTS);
  check('Ein Stein ohne Trait ändert das nicht', unitEffects(mutantWorker('x', { x: 1, y: 1 }, null)) === NEUTRAL_EFFECTS);

  const greedy = unitEffects(mutantWorker('g', { x: 1, y: 1 }, STONE_TRAIT.GREEDY));
  check('Gierig verweigert genau diesem Dungling Bauauftraege', greedy.buildOrders === false);
  check('Gierig hebt seine Tragekraft', greedy.carryBonus === 1, `Bonus ${greedy.carryBonus}`);
}

function checkAura() {
  section('Trait-Wirkung: Aura');
  const source = mutantWorker('a', { x: 20, y: 20 }, STONE_TRAIT.MOTIVATOR);
  const near = mutantWorker('b', { x: 22, y: 20 }, null);
  const far = mutantWorker('c', { x: 30, y: 20 }, null);
  check('In der Aura wird der fremde Dungling schneller', tickScale(near, [source, near]) > 1, `${tickScale(near, [source, near])}`);
  check('Ausserhalb der Aura nicht', tickScale(far, [source, far]) === 1);
  check('Der Motivator beschleunigt sich nicht selbst', tickScale(source, [source]) === 1);
}

function checkSlime() {
  section('Trait-Wirkung: Schleimspur');
  const slimy = mutantWorker('d', { x: 20, y: 20 }, STONE_TRAIT.SLIMY);
  const onIt = mutantWorker('e', { x: 20, y: 20 }, null);
  const nextDoor = mutantWorker('f', { x: 21, y: 20 }, null);
  check('Auf der Spur wird der fremde Dungling langsamer', tickScale(onIt, [slimy, onIt]) < 1, `${tickScale(onIt, [slimy, onIt])}`);
  check('Neben der Spur nicht', tickScale(nextDoor, [slimy, nextDoor]) === 1);
  check('Die eigene Spur bremst den Schleimigen nicht', tickScale(slimy, [slimy]) === 1);
}

function created(traits) {
  return gameReducer(withStones(traits, { x: 24, y: 24 }), { type: ACTION.MUTANT_CREATED });
}

function ticksToDelivery(state) {
  let current = state;
  for (let tick = 1; tick <= TICKS; tick += 1) {
    current = gameReducer(current, { type: ACTION.WORK_TICK, dtMs: JOB_CONFIG.tickMs });
    if (current.popups.length > 0) return tick;
  }
  return -1;
}

function checkGreedyInTick() {
  section('Trait-Wirkung: Gierig im Takt');
  check('Ohne Mutation liefert der Dungling', ticksToDelivery(withStones([], { x: 24, y: 24 })) > 0);
  const greedy = created([STONE_TRAIT.GREEDY]);
  check('Der gierige Mutant traegt den Stein', greedy.dunglings[0].stones.length === 1);
  check('Der gierige Mutant verweigert den Lieferauftrag', ticksToDelivery(greedy) === -1);
}

function extractionEssence(state) {
  let current = gameReducer({ ...state, essence: 0 }, { type: ACTION.WORKER_ASSIGNED, buildingId: EXTRACTOR_ID });
  for (let tick = 1; tick <= TICKS; tick += 1) {
    current = gameReducer(current, { type: ACTION.WORK_TICK, dtMs: JOB_CONFIG.tickMs });
    if (current.essence > 0) return current.essence;
  }
  return -1;
}

function checkCarryInTick() {
  section('Trait-Wirkung: Tragekraft im Takt');
  const plain = extractionEssence(labState());
  check('Ein Extraktor presst genau eine Essenz', plain === 1, `${plain}`);
  const greedy = extractionEssence(gameReducer(withStones([STONE_TRAIT.GREEDY]), { type: ACTION.MUTANT_CREATED }));
  check('Der gierige Mutant presst die doppelte Menge', greedy === 2, `${greedy}`);
}

export function checkTraits() {
  checkOwn();
  checkAura();
  checkSlime();
  checkGreedyInTick();
  checkCarryInTick();
}