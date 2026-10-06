/** Der Browser: angehaltene Uhr, gepinnte Sitzung, eingesammelte Seitenfehler.
 *  Die Uhr wird nicht nur installiert, sondern angehalten: sonst laeuft sie mit der
 *  Wanduhr weiter, und die Spielzeit haengt an der Lesegeschwindigkeit des Laufs. */
import { chromium } from 'playwright';
import { BROWSER_CONFIG, SEL, baseUrl, pinnedSession } from './config.mjs';

function watchErrors(page, errors) {
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
}

async function pinSession(context) {
  await context.addInitScript((session) => {
    window.localStorage.setItem('dl.session', JSON.stringify(session));
  }, pinnedSession());
}

export async function openStage() {
  const errors = [];
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: BROWSER_CONFIG.viewport });
  await pinSession(context);
  const page = await context.newPage();
  watchErrors(page, errors);
  await page.clock.install({ time: new Date(BROWSER_CONFIG.clockStart) });
  await page.clock.pauseAt(new Date(BROWSER_CONFIG.clockStart));
  await page.goto(baseUrl(), { waitUntil: 'load' });
  await page.waitForSelector(SEL.field, { timeout: BROWSER_CONFIG.bootTimeoutMs });
  return { browser, page, errors };
}