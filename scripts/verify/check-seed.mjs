/** Der Spielerseed ist die Welt: gleicher Seed gleiche Welt, verschiedene Seeds
 *  verschiedene Welten. Und niemand darf hängen bleiben, egal welcher Seed. */
import { ONBOARDING_CONFIG } from '../../src/domain/onboarding/onboarding-config.js';
import { essenceBudget } from '../../src/domain/deposits/deposit-config.js';
import { TILE_KIND, TILE_VISIBILITY, tileId } from '../../src/domain/world/tile.js';
import { allTiles, createWorld, getTile } from '../../src/domain/world/grid.js';
import { worldSeed } from '../../src/domain/world/world-seed.js';
import { createInitialGameState } from '../../src/state/game-state.js';
import { check, section } from './expect.mjs';

const SEEDS = 24;
const SPAWN_ID = tileId(ONBOARDING_CONFIG.dunglingSpawnTile.x, ONBOARDING_CONFIG.dunglingSpawnTile.y);
const FIRST_EARTH_ID = tileId(ONBOARDING_CONFIG.firstEarthBlock.x, ONBOARDING_CONFIG.firstEarthBlock.y);

const sample = Array.from({ length: SEEDS }, (_, index) => worldSeed(index * 2654435761).toString(16));

function fingerprint(world) {
  const lit = allTiles(world).filter((tile) => tile.visibility === TILE_VISIBILITY.VISIBLE).map((tile) => tile.id);
  const stock = Object.values(world.deposits).map((deposit) => `${deposit.id}|${deposit.capacity}|${deposit.cells.join(',')}`);
  return `${lit.join(';')}#${stock.join(';')}`;
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
  checkSameSeedTwice();
  checkOneDoor();
  checkEverySeedOwnWorld();
  checkNoStuckPlayer();
  checkBudgetBand();
}
