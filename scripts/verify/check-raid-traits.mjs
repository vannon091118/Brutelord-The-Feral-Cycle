/** Die drei Traits im Raid und das Graben-Tor: Erde immer, Hartgestein nur mit Fähigkeit. */
import { STONE_TRAIT, TRAIT_ORDER, RAID_CAPABILITY, RAID_CAPABILITY_DEFS } from '../../src/domain/brutelord/stone-config.js';
import { TILE_TERRAIN } from '../../src/domain/world/tile.js';
import { RAID_CONFIG, RAID_TRAIT_DEFS, NEUTRAL_TRAITS } from '../../src/domain/raid/raid-config.js';
import { teamTraitProfile, carriedLoot } from '../../src/domain/raid/raid-traits.js';
import { cellCost, UNREACHED } from '../../src/domain/raid/raid-path.js';
import { check, section } from './expect.mjs';
import { raidState, raidWorld, digTo, westOf } from './raid-fixture.mjs';

const KEYS = ['lootScale', 'apScale', 'digScale'];

function digSteps(options) {
  const state = raidState(options);
  const world = raidWorld();
  const first = digTo(state, world, westOf(state, 1));
  const second = digTo(first, world, westOf(first, 1));
  return { first: state.stamina - first.stamina, second: first.stamina - second.stamina };
}

function checkComplete() {
  section('Trait-Übersetzung: Vollständigkeit');
  check('Jeder Stein-Trait hat eine Raid-Übersetzung', TRAIT_ORDER.every((trait) => Boolean(RAID_TRAIT_DEFS[trait])));
  check('Jede Übersetzung nennt genau eine Achse', TRAIT_ORDER.every((t) => KEYS.filter((k) => k in RAID_TRAIT_DEFS[t]).length === 1));
  check('Es gibt keine Übersetzung ohne Stein-Trait', Object.keys(RAID_TRAIT_DEFS).length === TRAIT_ORDER.length);
}

function checkValues() {
  section('Trait-Übersetzung: Werte');
  const { GREEDY, MOTIVATOR, SLIMY } = STONE_TRAIT;
  check('Gierig verdoppelt die Beute', RAID_TRAIT_DEFS[GREEDY].lootScale === 2, `${RAID_TRAIT_DEFS[GREEDY].lootScale}`);
  check('Der Motivator gibt dem Team ein Viertel mehr AP', RAID_TRAIT_DEFS[MOTIVATOR].apScale === 1.25, `${RAID_TRAIT_DEFS[MOTIVATOR].apScale}`);
  check('Schleimig verdoppelt den Preis am eigenen Tunnel', RAID_TRAIT_DEFS[SLIMY].digScale === 2, `${RAID_TRAIT_DEFS[SLIMY].digScale}`);
}

function checkFolding() {
  section('Trait-Übersetzung: Faltung');
  const plain = raidState({ heroes: 2 });
  const greedy = teamTraitProfile([{ traits: [STONE_TRAIT.GREEDY] }, { traits: [STONE_TRAIT.GREEDY] }]);
  check('Ohne Trait ist alles neutral', KEYS.every((key) => plain.traits[key] === NEUTRAL_TRAITS[key]));
  check('Der zweite Stein mit demselben Trait bringt nichts', greedy.lootScale === RAID_TRAIT_DEFS[STONE_TRAIT.GREEDY].lootScale);
  check('Gierig zählt die Beute doppelt', carriedLoot(7, plain.traits) === 7 && carriedLoot(7, greedy) === 14);
}

function checkAura() {
  section('Trait-Übersetzung: Motivator');
  const plain = raidState({ heroes: 2 });
  const motivated = raidState({ traits: [STONE_TRAIT.MOTIVATOR], heroes: 2 });
  check('Die Aura umfasst das ganze Team', motivated.heroes.every((hero) => hero.apMax === motivated.heroes[0].apMax));
  check('Das AP-Maximum ist um ein Viertel höher', motivated.heroes[0].apMax > plain.heroes[0].apMax, `${motivated.heroes[0].apMax} gegen ${plain.heroes[0].apMax}`);
  check('Die Runde füllt die AP auf dieses Maximum', motivated.heroes.every((hero) => hero.ap === hero.apMax));
}

function checkSlime() {
  section('Trait-Übersetzung: Schleim');
  const plain = digSteps({});
  const slimy = digSteps({ traits: [STONE_TRAIT.SLIMY] });
  check('Das erste Feld am Einmarsch kostet gleich', plain.first === slimy.first, `${plain.first} gegen ${slimy.first}`);
  check('Das Feld am eigenen Tunnel kostet beim Schleimigen das Doppelte', slimy.second === plain.second * 2, `${slimy.second} gegen ${plain.second}`);
}

function checkDigGate() {
  section('Graben-Tor: Erde immer, Hartgestein nur mit Fähigkeit');
  const world = raidWorld();
  const stein = world.tiles.find((tile) => tile.terrain === TILE_TERRAIN.STONE);
  const id = stein ? `${stein.x},${stein.y}` : '0,0';
  check('Im fremden Dungeon gibt es Hartgestein', stein !== undefined);
  check('Ohne Fähigkeit ist Hartgestein unerreichbar', cellCost(raidState({ dig: false }), world, id) === UNREACHED);
  check('Mit Fähigkeit kostet es den Steintarif', cellCost(raidState(), world, id) === RAID_CONFIG.stoneCost);
  check('Erde ist ohne Fähigkeit grabbar', digSteps({ dig: false }).first === RAID_CONFIG.earthCost);
  check('Die Fähigkeit kommt aus dem Kader, nicht aus der Welt', raidState({ dig: false }).heroes.every((hero) => hero.dig === false));
  check('Die Fähigkeit ist eine benannte Stein-Konstante', RAID_CAPABILITY_DEFS[RAID_CAPABILITY.DIG].label === 'Graben');
}

export function checkRaidTraits() {
  checkComplete();
  checkValues();
  checkFolding();
  checkAura();
  checkSlime();
  checkDigGate();
}