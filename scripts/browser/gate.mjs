/** Act eins: ohne Sitzung steht das Konto-Tor, und das Anlegen führt ins Spiel. */
import { chromium } from 'playwright';
import { BROWSER_CONFIG, SEL, baseUrl } from './config.mjs';
import { check } from '../verify/expect.mjs';
import { shoot } from './shots.mjs';

const uniqueName = () => `${BROWSER_CONFIG.accountName}-${Date.now().toString(36)}`;

async function fillField(page, selector, value) {
  await page.locator(selector).first().fill(value);
}

/** Der erste Akt startet seinen eigenen Browser — das Tor kennt keine Sitzung. */
export async function checkGate() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: BROWSER_CONFIG.viewport });
  const page = await context.newPage();
  await page.clock.install({ time: new Date(BROWSER_CONFIG.clockStart) });
  await page.goto(baseUrl(), { waitUntil: 'load' });
  // Der Produktname steht im Seitentitel; eine Umbenennung soll hier auffallen, nicht im Browser-Tab.
  const title = await page.title();
  check('Der Seitentitel nennt den Produktnamen', title.includes('Dungeon Lord'), title);
  const submit = page.locator(SEL.submit).first();
  const offer = (await submit.count()) ? await submit.innerText() : '';
  check('Ohne Sitzung steht das Konto-Tor', (await submit.count()) === 1, `Titel: ${title}`);
  check('Das Tor bietet das Anlegen an', offer.includes('Konto anlegen'), offer);
  await fillField(page, SEL.nameField, uniqueName());
  await fillField(page, SEL.passField, BROWSER_CONFIG.accountPassword);
  memoShots(page);
  await submit.click();
  await page.waitForSelector(SEL.field, { timeout: BROWSER_CONFIG.bootTimeoutMs });
  check('Nach dem Anlegen steht das Spielfeld', (await page.locator(SEL.field).count()) === 1);
  const out = page.getByRole('button', { name: /abmelden/ });
  check('Die neue Sitzung traegt ihren Namen', (await out.count()) === 1, await out.innerText().catch(() => ''));
  await shoot(page, '09-gespielt');
  await context.close();
  await browser.close();
}

function memoShots(page) {
  return shoot(page, '00-konto-tor');
}