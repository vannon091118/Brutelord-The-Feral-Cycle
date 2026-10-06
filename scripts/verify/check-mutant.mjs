/** Erschaffen und Zurückentwickeln — gefahren über den echten Reducer. */
import { ACTION } from '../../src/domain/actions/action-types.js';
import { STONE_CONFIG, STONE_TRAIT } from '../../src/domain/brutelord/stone-config.js';
import { investedIn, isMutant, nextCandidate, refundFor } from '../../src/domain/brutelord/mutant.js';
import { gameReducer } from '../../src/state/game-reducer.js';
import { check, section } from './expect.mjs';
import { checkTraits } from './check-traits.mjs';
import { labState, withStones } from './lab-run.mjs';

function create(state) {
  return gameReducer(state, { type: ACTION.MUTANT_CREATED });
}

function revert(state, workerId = 'dungling-1') {
  return gameReducer(state, { type: ACTION.MUTANT_REVERTED, workerId });
}

function checkCreate() {
  section('Erschaffen');
  const ready = withStones([STONE_TRAIT.SLIMY]);
  check('Ohne Mutation ist der Dungling der Basisbau', !isMutant(ready.dunglings[0]));

  const made = create(ready);
  check('Der Mutant traegt den Stein', made.dunglings[0].stones.length === 1 && isMutant(made.dunglings[0]));
check('Der Stein verlaesst das Inventar', made.lab.stones.length === 0);

  const loose = { ...ready, lab: { ...ready.lab, stones: [{ seed: 7, rarity: 'NORMAL', trait: null, slot: null }] } };
  check('Ein Stein ohne Slot bleibt liegen', create(loose).lab.stones.length === 1);
  check('Ohne Stein im Slot entsteht kein Mutant', !isMutant(create(labState()).dunglings[0]));
  check('Ohne offenes Labor entsteht kein Mutant', !isMutant(create({ ...ready, lab: { ...ready.lab, open: false } }).dunglings[0]));
}

function checkEligibility() {
  section('Erschaffen: wer darf mutiert werden');
  const base = withStones([STONE_TRAIT.SLIMY]);
  const busy = { ...base, dunglings: [{ ...base.dunglings[0], job: { kind: 'EXTRACT' } }] };
  check('Ein arbeitender Dungling ist kein Kandidat, solange nichts anderes frei ist', nextCandidate(busy.dunglings).id === 'dungling-1');
  check('Ein Mutant ist kein Kandidat mehr', nextCandidate(create(base).dunglings) === null);
}

function checkRevert() {
  section('Zurueckentwickeln');
  const made = create(withStones([STONE_TRAIT.GREEDY]));
  const cost = investedIn(made.dunglings[0].stones);
  check('Die Investition ist der Preis der Steine', cost === STONE_CONFIG.cost, `${cost}`);

  const back = revert(made);
  check('Der Mutant wird wieder der Basisbau', back.dunglings[0].stones.length === 0 && !isMutant(back.dunglings[0]));
  check('Die halbe Investition kommt zurueck', cost > 0 && back.essence - made.essence === Math.floor(cost * 0.5), `+${back.essence - made.essence}`);
  check('Die Steine sind verbraucht, nicht zurueck im Inventar', back.lab.stones.length === 0);
}

function checkVeteran() {
  section('Zurueckentwickeln: erfahrener Mutant');
  const made = create(withStones([STONE_TRAIT.GREEDY]));
  const veteran = { ...made, dunglings: [{ ...made.dunglings[0], battleEp: 1 }] };
  check('Der erste Kampf-EP erhoeht die Rueckerstattung', refundFor(veteran.dunglings[0]) > refundFor(made.dunglings[0]));
  check('Ein erfahrener Mutant gibt achtzig Prozent zurueck', refundFor(veteran.dunglings[0]) === Math.floor(investedIn(made.dunglings[0].stones) * 0.8));
}

function checkTwoStones() {
  section('Erschaffen: mehrere Steine');
  const made = create(withStones([STONE_TRAIT.GREEDY, STONE_TRAIT.MOTIVATOR]));
  check('Beide Steine wandern an die Einheit', made.dunglings[0].stones.length === 2);
  check('Beide Wirkungen sind an der Einheit', made.dunglings[0].invested === 2 * STONE_CONFIG.cost, `${made.dunglings[0].invested}`);
}

function checkBred() {
  section('Kreuzen');
  const one = create(withStones([STONE_TRAIT.GREEDY]));
  const mother = one.dunglings[0];
  const father = { ...mother, id: 'dungling-2', tile: { x: 6, y: 6 }, stones: [] };
  const state = { ...one, dunglings: [mother, father] };
  check('Ein Genom ohne Steine gilt schon als Mutant', isMutant(father) && father.stones.length === 0);

  const bred = gameReducer(state, { type: ACTION.MUTANT_BRED, parentIds: [mother.id, father.id] });
  check('Die Eltern sind beide verbraucht', bred.dunglings.length === 1);
  check('Das Kind ist kein Elternteil', bred.dunglings[0].id !== mother.id && bred.dunglings[0].id !== father.id);
  check('Das Kind traegt ein Genom', Boolean(bred.dunglings[0].genome));
  check('Das Kind kommt ohne Steine', bred.dunglings[0].stones.length === 0);
  check('Das Kind ist arbeitsbereit', bred.dunglings[0].job === null);
  check('Die Essenz bleibt unberuehrt', bred.essence === one.essence);
  check('Unbekannte Eltern aendern nichts', gameReducer(state, { type: ACTION.MUTANT_BRED, parentIds: ['x', 'y'] }) === state);
  check('Zweimal dasselbe Elternteil kreuzt nicht', gameReducer(state, { type: ACTION.MUTANT_BRED, parentIds: [mother.id, mother.id] }) === state);
}

export function checkMutant() {
  checkTraits();
  checkCreate();
  checkEligibility();
  checkRevert();
  checkVeteran();
  checkTwoStones();
  checkBred();
}