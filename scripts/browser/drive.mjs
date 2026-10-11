/** Die Fahrbefehle der Seite: ein Klick auf ein Ziel, das die angehaltene Uhr erst noch
 *  hervorbringen muss. Ohne dieses Warten haengt der Klick — eine angehaltene Uhr
 *  springt von allein nicht weiter, und ein Knopf, der noch auf einen freien Dungling
 *  wartet, bleibt so lange gesperrt, wie der letzte Auftrag laeuft. */
import { ONBOARDING_CONFIG } from '../../src/domain/onboarding/onboarding-config.js';
import { BUILDING_TYPE, BUILDING_DEFS } from '../../src/domain/buildings/building-config.js';
import { JOB_CONFIG } from '../../src/domain/labour/job-config.js';
import { STEP_MS } from './advance.mjs';
import { SEL } from './config.mjs';

const C = ONBOARDING_CONFIG;
const EXTRACTOR = BUILDING_TYPE.ESSENCE_EXTRACTOR;
const LABEL = BUILDING_DEFS[EXTRACTOR].label;
const EARTH = `[role="button"][aria-label="Erdblock bei ${C.firstEarthBlock.x}, ${C.firstEarthBlock.y} abbauen"]`;
const READY_MS = C.dunglingSettleMs + JOB_CONFIG.cycleMs;

async function clickReady({ page, make }) {
  for (let spent = 0; spent <= READY_MS; spent += STEP_MS) {
    const target = make().first();
    if ((await target.isVisible()) && (await target.isEnabled())) {
      await page.clock.runFor(STEP_MS);
      await target.click({ timeout: 1500 });
      return spent;
    }
    await page.clock.runFor(STEP_MS);
  }
  return -1;
}

export const clickHive = ({ page }) => clickReady({ page, make: () => page.locator(SEL.hive) });
export const clickEarth = ({ page }) => clickReady({ page, make: () => page.locator(EARTH) });
export const clickMine = ({ page }) => clickReady({ page, make: () => page.locator(SEL.mine) });
export const pickExtractor = ({ page }) => clickReady({ page, make: () => page.locator(SEL.buildMenu).getByRole('button', { name: LABEL }) });
export const placeSpot = ({ page }) => clickReady({ page, make: () => page.locator(SEL.spot) });
export const selectBuilding = ({ page }) => clickReady({ page, make: () => page.locator(`[aria-label="${LABEL} anklicken"]`) });
export const assignWorker = ({ page }) => clickReady({ page, make: () => page.locator(SEL.buildingPanel).locator(SEL.assign) });