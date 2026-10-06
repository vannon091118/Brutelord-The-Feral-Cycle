/** Der Spielerseed ist die Welt: gleicher Seed gleiche Welt, verschiedene Seeds
 *  verschiedene Welten. Die Auslegung selbst ist fail closed: eine ungueltige
 *  Eingabe ist kein Seed und wird nicht still zur Welt des Seeds 00000000. */
import { ONBOARDING_CONFIG } from '../../src/domain/onboarding/onboarding-config.js';
import { essenceBudget } from '../../src/domain/deposits/deposit-config.js';
import { TILE_KIND, TILE_VISIBILITY, tileId } from '../../src/domain/world/tile.js';
import { allTiles, createWorld, getTile } from '../../src/domain/world/grid.js';
import { SeedError, worldSeed, worldSeed32 } from '../../src/domain/world/world-seed.js';
import { createInitialGameState } from '../../src/state/game-state.js';
import { check, section } from './expect.mjs';

const SEEDS = 24;
const SPAWN_ID = tileId(ONBOARDING_CONFIG.dunglingSpawnTile.x, ONBOARDING_CONFIG.dunglingSpawnTile.y);
const FIRST_EARTH_ID = tileId(ONBOARDING_CONFIG.firstEarthBlock.x, ONBOARDING_CONFIG.firstEarthBlock.y);

const sample = Array.from({ length: SEEDS }, (_, index) => worldSeed((index * 2654435761) >>> 0).toString(16));

/** Vor der Zentralisierung gemessen: jede Zeile muss weiter denselben Wert lesen. */
const LEGACY = [
  ['a1b2c3d4', 2712847316], ['00ff00ff', 16711935], ['7fffffff', 2147483647],
  ['12345678', 305419896], ['00000000', 0], ['FFFFFFFF', 4294967295],
  ['1234ABCD', 305441741], ['1234abcd', 305441741],
  ['a'.repeat(16), 2863311530], ['c0ffee', 12648430], ['deaf', 57007],
  ['0', 0], ['9', 9], ['a1b2c3d4ef', 2712847316],
  [12345678, 12345678], [0, 0], [4294967295, 4294967295],
];

/** Vorher fiel jede davon still auf 0, auf einen Teillesewert oder auf einen Riesenzahl-Rest. */
const INVALID = ['ZZZZZZZZ', '1234ZZZZ', '', ' ', '  ', '12xyz', 'a1b2c3d4z', NaN, -1, 1.5, Infinity, 4294967296, 'a'.repeat(17)];

function fingerprint(world) {
  const lit = allTiles(world).filter((tile) => tile.visibility === TILE_VISIBILITY.VISIBLE).map((tile) => tile.id);
  const stock = Object.values(world.deposits).map((deposit) => `${deposit.id}|${deposit.capacity}|${deposit.cells.join(',')}`);
  return `${lit.join(';')}#${stock.join(';')}`;
}

function checkLegacyValues() {
  section('Seed: die Auslegung liest Bestandswerte unveraendert');
  const broken = LEGACY.filter(([input, expected]) => worldSeed32(input) !== expected);
  check(`Alle ${LEGACY.length} Bestandswerte bleiben gleich`, broken.length === 0, broken.map(([input]) => String(input)).join(', '));
  const twice = Array.from({ length: 20 }, () => worldSeed32('a1b2c3d4'));
  check('Dieselbe Eingabe ergibt immer denselben Wert', new Set(twice).size === 1, `${new Set(twice).size} verschiedene`);
}

function checkGoldenObservables() {
  section('Seed: Wackelkontur und Vorratskarte bleiben gemessen');
  const world = createWorld({ playerseed: 'a1b2c3d4' });
  const sichtbar = allTiles(world).filter((tile) => tile.visibility === TILE_VISIBILITY.VISIBLE).length;
  const pool = Object.values(world.deposits).reduce((sum, deposit) => sum + deposit.pool, 0);
  check('Die Wackelkontur oeffnet 75 Felder', sichtbar === 75, `${sichtbar} Felder`);
  check('Die Vorratskarte traegt 9660 Essenz', pool === 9660, `${pool} Essenz`);
}

function checkInvalidIsNoSeed() {
  section('Seed: eine ungueltige Eingabe ist kein Seed');
  const refused = INVALID.filter((input) => worldSeed32(input) !== null);
  check('Ungueltige Eingaben liefern null statt 0', refused.length === 0, refused.map((input) => String(input)).join(', '));
  check('Die Null bleibt ein gueltiger Seed', worldSeed32('00000000') === 0 && worldSeed32(0) === 0);
  check('Ein Teillesewert wird nicht mehr gelesen', worldSeed32('12xyz') === null && worldSeed32('a1b2c3d4z') === null);
  const halb = '1234ZZZZ';
  check('Eine halbgueltige Saat ist nicht die Null', worldSeed32(halb) === null && worldSeed32(halb) !== worldSeed32('00000000') && worldSeed32(halb) !== 0);
  const missing = [undefined, null, true, {}, []].map((input) => worldSeed32(input));
  check('Eine fehlende Eingabe ergibt die anonyme Welt', new Set(missing).size === 1 && missing[0] === createWorld().seed, missing.join(', '));
}

function checkThrowingDoor() {
  section('Seed: die Tuer wirft, wo die Auslegung schweigt');
  check('Ein gueltiger Seed geht durch beide Tueren gleich', worldSeed('a1b2c3d4') === worldSeed32('a1b2c3d4'));
  check('Eine fehlende Eingabe bleibt hier die anonyme Welt', worldSeed(undefined) === createWorld().seed);
  let caught = null;
  try { worldSeed('ZZZZZZZZ'); } catch (error) { caught = error; }
  check('Ein ungueltiger Seed wirft SeedError', caught instanceof SeedError && caught.input === 'ZZZZZZZZ', String(caught));
  check('Eine kaputte Saat baut keine Welt', createWorld({ playerseed: 'ZZZZZZZZ' }) === null);
  check('Eine guelte Saat baut weiter eine Welt', createWorld({ playerseed: 'a1b2c3d4' }) !== null);
}

function checkSameSeedTwice() {
  const first = fingerprint(createWorld({ playerseed: 'a1b2c3d4' }));
  const again = fingerprint(createWorld({ playerseed: 'a1b2c3d4' }));
  section('Seed: derselbe Seed, dieselbe Welt');
  check('Zwei Welten aus demselben Seed sind gleich', first === again);
}

function checkOneDoor() {
  section('Seed: eine Tür, nicht zwei');
  for (const playerseed of sample) {
    const asText = fingerprint(createWorld({ playerseed }));
    const asNumber = fingerprint(createWorld({ playerseed: worldSeed(playerseed) }));
    if (asText !== asNumber) {
      check(`Hex und Zahl ergeben dieselbe Welt fuer ${playerseed}`, false);
      return;
    }
  }
  check(`Hex und Zahl ergeben dieselbe Welt (${SEEDS} Seeds)`, true);
  const digits = fingerprint(createWorld({ playerseed: '00000001' }));
  const letters = fingerprint(createWorld({ playerseed: 'cafebabe' }));
  const anonymous = fingerprint(createWorld());
  check('Ein Seed ohne Buchstaben ist nicht die anonyme Welt', digits !== anonymous);
  check('Ein Seed mit Buchstaben ist nicht die anonyme Welt', letters !== anonymous);
  check('Beide Seedarten sind untereinander verschieden', digits !== letters);
}

function checkEverySeedOwnWorld() {
  const prints = sample.map((playerseed) => fingerprint(createWorld({ playerseed })));
  section('Seed: jeder Seed hat eine eigene Welt');
  check(`Alle ${SEEDS} Seeds ergeben verschiedene Welten`, new Set(prints).size === SEEDS, `${new Set(prints).size} verschiedene`);
}

function checkNoStuckPlayer() {
  const broken = sample.filter((playerseed) => {
    const world = createWorld({ playerseed });
    return (
      getTile(world, SPAWN_ID).visibility !== TILE_VISIBILITY.VISIBLE ||
      getTile(world, FIRST_EARTH_ID).visibility !== TILE_VISIBILITY.VISIBLE ||
      !allTiles(world).some((tile) => tile.kind === TILE_KIND.EARTH && tile.visibility === TILE_VISIBILITY.VISIBLE)
    );
  });
  section('Seed: niemand bleibt hängen');
  check('Spawn und erster Erdblock sind in jeder Welt sichtbar', broken.length === 0, broken.join(', '));
  check('Jede Welt startet mit demselben Hive', sample.every((playerseed) => allTiles(createWorld({ playerseed })).filter((tile) => tile.kind === TILE_KIND.HIVE).length === 4));
}

function checkBudgetBand() {
  const band = essenceBudget();
  const totals = sample.map((playerseed) => Object.values(createWorld({ playerseed }).deposits).reduce((sum, deposit) => sum + deposit.pool, 0));
  const outside = totals.filter((total) => total < band.floor || total > band.ceiling);
  section('Seed: die Ökonomie bleibt im Band');
  check(`Jede Weltessenz liegt zwischen ${band.floor} und ${band.ceiling}`, outside.length === 0, `min ${Math.min(...totals)}, max ${Math.max(...totals)}`);
  check('Der Startzustand baut aus jedem Seed', sample.every((playerseed) => createInitialGameState(playerseed).world.seed === worldSeed(playerseed)));
}

export function checkSeed() {
  checkLegacyValues();
  checkGoldenObservables();
  checkInvalidIsNoSeed();
  checkThrowingDoor();
  checkSameSeedTwice();
  checkOneDoor();
  checkEverySeedOwnWorld();
  checkNoStuckPlayer();
  checkBudgetBand();
}
