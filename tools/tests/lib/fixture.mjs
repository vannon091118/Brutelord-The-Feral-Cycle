/** Die Zustandsbibliothek: eingefroren wird mit derselben Packform, die das
 *  Spiel liest, und abgespielt wird durch dieselbe Tür — kein Testzweig. */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { packState } from '../../../src/state/snapshot.js';
import { SNAPSHOT_KEY, SNAPSHOT_VERSION } from '../../../src/state/snapshot-config.js';
import { SESSION_KEY } from '../../../src/ui/account/session.js';
import { SEL } from './dl.mjs';
import { FIXTURE_PART_LINES, STATE_DIR } from './config.mjs';

const TILES_PART = '.tiles.json';

function fits(value) {
  return JSON.stringify(value, null, 1).split('\n').length <= FIXTURE_PART_LINES;
}

/** Der Zustand ist modular: die Kachel-Delta wandert in eine eigene Datei. */
function modules(name, packed, playerseed) {
  const main = { version: SNAPSHOT_VERSION, seed: playerseed, state: packed };
  if (fits(main)) return [{ file: `${name}.json`, value: main }];
  const world = { ...packed.world };
  delete world.tiles;
  return [
    { file: `${name}.json`, value: { ...main, state: { ...packed, world } } },
    { file: `${name}${TILES_PART}`, value: { tiles: packed.world.tiles } },
  ];
}

function readPart(file) {
  const path = join(STATE_DIR, file);
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
}

export function recordState(name, state, playerseed) {
  mkdirSync(STATE_DIR, { recursive: true });
  return modules(name, packState(state), playerseed)
    .map((part) => {
      const path = join(STATE_DIR, part.file);
      writeFileSync(path, JSON.stringify(part.value, null, 1));
      return path;
    })
    .join(', ');
}

export function readFixture(name) {
  const main = readPart(`${name}.json`);
  if (!main) {
    throw new Error(`Zustand "${name}" fehlt in ${STATE_DIR} — erst DL_FROM=live laufen lassen`);
  }
  const tiles = readPart(`${name}${TILES_PART}`);
  if (!tiles) return main;
  const state = { ...main.state, world: { ...main.state.world, tiles: tiles.tiles } };
  return { ...main, state };
}

export function fixtureNames() {
  if (!existsSync(STATE_DIR)) return [];
  return readdirSync(STATE_DIR)
    .filter((file) => file.endsWith('.json') && !file.endsWith(TILES_PART))
    .map((file) => file.replace(/\.json$/, ''));
}

/** Sitzung und Spielstand in einem Rutsch: der Seed des Zustands muss der der
 *  Sitzung sein, sonst weist die Tür den Zustand als fremd zurück. */
export async function restoreState(page, name, playerName) {
  const fixture = readFixture(name);
  const session = { playerId: `p-${playerName}`, playerseed: fixture.seed, name: playerName };
  await page.addInitScript(
    ([sessionKey, snapshotKey, clean, snapshot]) => {
      window.localStorage.setItem(sessionKey, JSON.stringify(clean));
      window.localStorage.setItem(snapshotKey, JSON.stringify(snapshot));
    },
    [SESSION_KEY, SNAPSHOT_KEY, session, fixture],
  );
  await page.reload();
  await page.locator(SEL.field).waitFor({ timeout: 30000 });
  return fixture;
}