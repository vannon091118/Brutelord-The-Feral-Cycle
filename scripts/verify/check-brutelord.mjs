/**
 * Der Brutlord: Determinismus, Pity, Slot-Optik und Gegenpol. Alles gegen die
 * echten Domänenmodule — ein Stein aus demselben Seed ist derselbe Stein.
 */
import {
  RARITY_ORDER,
  RARITY_WEIGHTS,
  SLOT_ORDER,
  STONE_CONFIG,
  STONE_DEFS,
  STONE_RARITY,
  STONE_SLOT,
  STONE_TRAIT,
  STONE_TRAIT_DEFS,
} from '../../src/domain/brutelord/stone-config.js';
import { createStone, rarityFor, rarityWeights } from '../../src/domain/brutelord/stone-roll.js';
import { buyStone, createLab, labStoneCount, nextSeed, placeStone, stoneLabel } from '../../src/domain/brutelord/lab-state.js';
import { counterScales, emptySlots, formFor, torsoScale } from '../../src/domain/brutelord/mutation-formula.js';
import { checkTraits } from './check-traits.mjs';
import { check, section } from './expect.mjs';

const LEGENDARY = STONE_RARITY.LEGENDARY;
const LEGENDARY_SLOT = RARITY_ORDER.indexOf(LEGENDARY);

function buyMany(count, misses = 0) {
  let lab = { ...createLab(), pityMisses: misses };
  for (let index = 0; index < count; index += 1) lab = buyStone(lab, (index + 1) * 7919);
  return lab;
}

function legendaryShare(count, misses) {
  const hits = Array.from({ length: count }, (unused, index) => rarityFor(index * 7717 + 13, misses));
  return hits.filter((rarity) => rarity === LEGENDARY).length / count;
}

function checkDeterminism() {
  section('Brutlord: deterministische Steine');
  const first = createStone({ seed: 12345 });
  check('Derselbe Seed ergibt denselben Stein', JSON.stringify(first) === JSON.stringify(createStone({ seed: 12345 })));
  check('Ein anderer Seed ergibt einen anderen Stein', createStone({ seed: 999 }).seed !== first.seed);

  const many = Array.from({ length: 200 }, (unused, index) => createStone({ seed: index * 104729 }));
  const counts = many.filter((stone) => stone.rarity === LEGENDARY).length / many.length;
  check('Seltene Steine kommen vor, aber nicht oft', counts > 0 && counts < 0.15, `${(counts * 100).toFixed(1)}% Legende`);
  check('Jede Seltenheit bringt genau ihre Fähigkeiten', many.every((stone) => stone.stats.length === STONE_DEFS[stone.rarity].statCount));

  const traitShare = many.filter((stone) => stone.trait !== null).length / many.length;
  check('Ein Teil der Steine trägt einen Trait', traitShare > 0 && traitShare < 1, `${(traitShare * 100).toFixed(0)}% mit Trait`);
  check('Jeder Trait hat eine Definition', many.every((stone) => stone.trait === null || STONE_TRAIT_DEFS[stone.trait]));
}

function checkPity() {
  section('Brutlord: der Pity-Timer');
  const base = rarityWeights(0)[LEGENDARY_SLOT];
  check('Der Pity-Bonus wächst mit den Fehlschlägen', rarityWeights(10)[LEGENDARY_SLOT] > base && base === RARITY_WEIGHTS[LEGENDARY_SLOT]);
  check('Der Pity-Bonus ist gedeckelt', rarityWeights(1000)[LEGENDARY_SLOT] <= base * (1 + STONE_CONFIG.pityMaxBonus));
  check('Die Legende wird am Grenzwert häufiger', legendaryShare(200, 0) < legendaryShare(200, STONE_CONFIG.pityLimit - 1));

  const atLimit = STONE_CONFIG.pityLimit;
  const guaranteed = Array.from({ length: 20 }, (unused, index) => createStone({ seed: index + 1, pityMisses: atLimit }));
  check('Am Pity-Limit ist die Legende garantiert', guaranteed.every((stone) => stone.rarity === LEGENDARY));
  check('Ein Legende-Treffer setzt den Zähler zurück', createStone({ seed: 4242, pityMisses: atLimit }).pityMisses === 0);
}

/** Der Feldwert selbst, nicht die interne Funktion — die prueft gegen den Zustand. */
function discovered(lab, seed) {
  return Boolean(lab.stones.find((stone) => stone.seed === seed)?.discovered);
}

function checkMasking() {
  section('Brutlord: Inventar und Maskierung');
  const lab = buyMany(6);
  check('Gekaufte Steine liegen im Inventar', labStoneCount(lab) === 6);
  check('Jeder Kauf bekommt einen eigenen Seed', new Set(lab.stones.map((stone) => stone.seed)).size === 6);
  check('Ein frischer Stein maskiert sich', stoneLabel(lab, lab.stones[0]) === '???' && !discovered(lab, lab.stones[0].seed));
  check('Der nächste Seed folgt dem Kauf', nextSeed(createLab()) !== nextSeed(buyMany(1)));

  const placed = placeStone(lab, lab.stones[0].seed, STONE_SLOT.ARMS);
  check('Ein verbauter Stein gilt als entdeckt', discovered(placed, lab.stones[0].seed) && stoneLabel(placed, placed.stones[0]) !== '???');
  check('Die Maskierung gilt pro Stein', !discovered(placed, lab.stones[1].seed));
  check('Ein unbekannter Seed ändert nichts', placeStone(lab, 999999, STONE_SLOT.HEAD) === lab);
}

export function checkBruteLord() {
  const base = buyMany(1);
  const arm = placeStone(base, base.stones[0].seed, STONE_SLOT.ARMS).stones[0];
  const leg = placeStone(base, base.stones[0].seed, STONE_SLOT.LEGS).stones[0];

  checkDeterminism();
  checkPity();
  checkMasking();
  checkTraits();

  section('Brutlord: Optik folgt dem Slot');
  check('Der Effekt bleibt beim Slotwechsel gleich', arm.rarity === leg.rarity && arm.trait === leg.trait && JSON.stringify(arm.stats) === JSON.stringify(leg.stats));
  check('Die Optik folgt dem Slot', formFor(arm) !== formFor(leg), `${formFor(arm)} gegen ${formFor(leg)}`);

  section('Brutlord: Gegenpol');
  const solo = counterScales([arm]);
  const mixed = counterScales([arm, { ...leg, rarity: STONE_RARITY.LEGENDARY }]);
  check('Ein starker Platz erreicht die volle Waage', solo[STONE_SLOT.ARMS].balance === 1);
  check('Ein starker Platz drückt den schwachen zurück', mixed[STONE_SLOT.ARMS].balance < 1, `Balance ${mixed[STONE_SLOT.ARMS].balance}`);
  check('Der stärkste Platz behält die Waage', mixed[STONE_SLOT.LEGS].balance === 1);
  check('Die Torso-Skala wächst mit der Last', torsoScale([arm], solo) > 0.8);
  check('Ein belegter Platz verschwindet aus der Leiste', emptySlots([arm]).length === SLOT_ORDER.length - 1);
}