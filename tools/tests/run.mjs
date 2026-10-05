/** Der Lauf: Server hoch, sichtbarer Browser, Szenarien der Reihe nach, Urteil am Ende. */
import { launchServer, stopServer, testBase } from './lib/server.mjs';
import { openBrowser } from './lib/browser.mjs';
import { createLogger } from './lib/log.mjs';
import { scenarioList } from './scenarios.mjs';
import { FIXTURE_MODE, HEADED, LOG_DIR, TEST_NAME, TEST_PLAYERSEED, TEST_PORT } from './lib/config.mjs';
import { claimSlot } from './lib/queue.mjs';
import { hold, missingFixtures, stageFor, summarize } from './lib/stage.mjs';

/** Ein Fall, der nicht durchläuft, ist ein Fehlschlag und kein stiller Sprung. */
async function runScenario(scenario, stage) {
  try {
    if (FIXTURE_MODE && scenario.fixture) {
      await stage.restore(scenario.fixture);
      stage.log(`  eingefroren: ${scenario.fixture}`);
    }
    await scenario.drive?.(stage);
    await scenario.check?.(stage);
    stage.check(`${scenario.id}: durchgelaufen`, true);
    const state = await summarize(stage);
    if (state) stage.log(`  Zustand: ${JSON.stringify(state)}`);
  } catch (error) {
    stage.check(`${scenario.id}: durchgelaufen`, false, error.message);
  }
}

async function driveAll(logger, browser) {
  const stage = await stageFor(logger, browser, testBase(TEST_PORT));
  for (const scenario of scenarioList()) {
    logger.log('info', `▶ ${scenario.title}`);
    await runScenario(scenario, stage);
  }
}

async function main() {
  const logger = createLogger(LOG_DIR);
  logger.log('info', `Lauf ${HEADED ? 'sichtbar' : 'unsichtbar'}, Start aus ${FIXTURE_MODE ? 'eingefrorenen Zuständen' : 'live'}`);
  const slot = await claimSlot(`${TEST_NAME} (${HEADED ? 'sichtbar' : 'unsichtbar'})`, {
    onWait: (message) => logger.log('info', message),
  });
  logger.log('info', `Platz ${slot.slot} ist frei.`);
  const missing = missingFixtures();
  if (FIXTURE_MODE && missing.length > 0) {
    logger.log('FAIL', `Zustände fehlen: ${missing.join(', ')}`, 'erst einmal DL_FROM=live laufen lassen');
    process.exit(1);
  }
  const server = await launchServer({ port: TEST_PORT });
  let browser = null;
  let result;
  try {
    browser = await openBrowser();
    await driveAll(logger, browser);
  } catch (error) {
    logger.log('FAIL', `Der Lauf kam nicht bis zum ersten Fall: ${error.message}`);
  } finally {
    result = logger.report();
  }
  if (!result.ok && HEADED) await hold();
  await browser?.close();
  stopServer(server);
  slot.release();
  process.exit(result.ok ? 0 : 1);
}

main();