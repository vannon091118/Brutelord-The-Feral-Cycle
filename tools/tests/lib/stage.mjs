/** Die Bühne des Laufs: was ein Fall bekommt, womit er urteilt und wann das
 *  Fenster offen bleibt, weil etwas rot ist. */
import { createInterface } from 'node:readline';
import { scenarioList } from '../scenarios.mjs';
import { fixtureNames, recordState, restoreState } from './fixture.mjs';
import { readFullState, readState, stateSummary } from './probe.mjs';
import { pinSession } from './browser.mjs';
import { SEL } from './dl.mjs';
import { FIXTURE_MODE, TEST_NAME, TEST_PLAYERSEED } from './config.mjs';

export async function stageFor(logger, browser, base) {
  const page = await browser.context.newPage();
  await pinSession(page, { playerseed: TEST_PLAYERSEED, name: TEST_NAME });
  await page.goto(base);
  await page.locator(SEL.field).waitFor({ timeout: 30000 });
  return {
    page,
    base,
    log: (message) => logger.log('info', message),
    check: logger.check,
    restore: (name) => restoreState(page, name, TEST_NAME),
    writeState: async (name) => {
      if (FIXTURE_MODE) return logger.log('info', `Zustand "${name}" ist die Grundlage dieses Laufs — unverändert`);
      const file = recordState(name, await readFullState(page), TEST_PLAYERSEED);
      return logger.log('ok', `eingefroren: ${name}`, file);
    },
  };
}

/** Rot heißt: das Fenster bleibt, bis du Enter drückst. */
export function hold() {
  console.log('\nEtwas ist rot. Das Fenster bleibt offen, bis du Enter drückst.');
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question('', () => { rl.close(); resolve(); }));
}

export function missingFixtures() {
  const known = new Set(fixtureNames());
  return scenarioList().map((scenario) => scenario.fixture).filter((name) => name && !known.has(name));
}

export function summarize(stage) {
  return readState(stage.page).then((state) => (state ? stateSummary(state) : null));
}