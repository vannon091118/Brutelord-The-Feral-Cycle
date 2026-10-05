/** Die Zustandsbibliothek: eingefroren wird mit derselben Packform, die das
 *  Spiel liest, und abgespielt wird durch dieselbe Tür — kein Testzweig. */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { packState } from '../../../src/state/snapshot.js';
import { SNAPSHOT_KEY, SNAPSHOT_VERSION } from '../../../src/state/snapshot-config.js';
import { SESSION_KEY } from '../../../src/ui/account/session.js';
import { SEL } from './dl.mjs';
import { STATE_DIR } from './config.mjs';

export function recordState(name, state, playerseed) {
  mkdirSync(STATE_DIR, { recursive: true });
  const file = join(STATE_DIR, `${name}.json`);
  writeFileSync(file, JSON.stringify({ version: SNAPSHOT_VERSION, seed: playerseed, state: packState(state) }, null, 1));
  return file;
}

export function readFixture(name) {
  const file = join(STATE_DIR, `${name}.json`);
  if (!existsSync(file)) {
    throw new Error(`Zustand "${name}" fehlt in ${STATE_DIR} — erst DL_FROM=live laufen lassen`);
  }
  return JSON.parse(readFileSync(file, 'utf8'));
}

export function fixtureNames() {
  if (!existsSync(STATE_DIR)) return [];
  return readdirSync(STATE_DIR)
    .filter((file) => file.endsWith('.json'))
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