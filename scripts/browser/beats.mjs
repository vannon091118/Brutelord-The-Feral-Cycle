/** Die Erwartungsliste: jeder Schritt treibt die Seite weiter und sagt, was gelten muss. */
import { ONBOARDING_CONFIG } from '../../src/domain/onboarding/onboarding-config.js';
import { ONBOARDING_ORDER, ONBOARDING_STATE } from '../../src/domain/onboarding/onboarding-state.js';
import { JOB_CONFIG } from '../../src/domain/labour/job-config.js';
import { BUILDING_TYPE, BUILDING_DEFS } from '../../src/domain/buildings/building-config.js';
import { SEL } from './config.mjs';
import { HINTS } from '../../src/ui/hint-texts.js';

const C = ONBOARDING_CONFIG;
const S = ONBOARDING_STATE;
const EXTRACTOR = BUILDING_TYPE.ESSENCE_EXTRACTOR;
const LABEL = BUILDING_DEFS[EXTRACTOR].label;
const EARTH = `[role="button"][aria-label="Erdblock bei ${C.firstEarthBlock.x}, ${C.firstEarthBlock.y} abbauen"]`;

const clickHive = async ({ page }) => page.locator(SEL.hive).click();
const clickEarth = async ({ page }) => page.locator(EARTH).click();
const clickMine = async ({ page }) => page.locator(SEL.mine).click();
const pickExtractor = async ({ page }) => page.locator(SEL.buildMenu).getByRole('button', { name: LABEL }).click();

const placeSpot = async ({ page, memo }) => {
  const spot = page.locator(SEL.spot).first();
  memo.spotBox = await spot.boundingBox();
  await spot.click();
};

const selectBuilding = async ({ page, memo }) => {
  const { x, y, width, height } = memo.spotBox;
  await page.mouse.click(x + width / 2, y + height / 2);
};

const assignWorker = async ({ page }) => page.locator(SEL.buildingPanel).getByRole('button', { name: SEL.assign }).click();

const miningBudget = C.workerMoveDurationMs + C.miningDurationMs + 800;

/** Jeder Onboarding-Zustand als sein Hinweistext — die Soll-Reihenfolge. */
export const CHAIN_TEXTS = ONBOARDING_ORDER.map((state) => HINTS[state].text);

export const BEATS = [
  { id: 'start', state: S.INITIAL, within: 0, shot: '01-warten', expect: { essence: 11, raum: 1, buildMenu: 0 } },
  { id: 'hive-click', drive: clickHive },
  { id: 'spawn-done', state: S.DUNGLING_IDLE, within: C.dunglingSpawnDelayMs + 2000, shot: '02-dungling-kommt' },
  { id: 'tile-picked', state: S.ACTION_MENU, within: 1500, drive: clickEarth, shot: '03-abbau-menue' },
  { id: 'dungling-works', state: S.MINING, within: C.workerMoveDurationMs + 900, drive: clickMine, shot: '04-abbau' },
  { id: 'floor-grows', state: S.GRID_EXPANDED, within: miningBudget, shot: '05-abgebaut' },
  { id: 'build-menu', state: S.BUILD_MENU_VISIBLE, within: C.gridExpansionMs + 900, shot: '06-baumenue', expect: { raum: 2, buildMenu: 1 } },
  { id: 'extractor-picked', drive: pickExtractor, shot: '07-extractor-gewaehlt', expect: { pressed: LABEL } },
  { id: 'site-placed', drive: placeSpot, shot: '08-bauplatz', expect: { spots: 0 } },
  { id: 'site-open', drive: selectBuilding, shot: '09-bauplatz-offen', expect: { panel: LABEL } },
  { id: 'site-ready', within: JOB_CONFIG.cycleMs * 4, waitFor: 'Fertig gebaut und in Betrieb.', shot: '10-extractor-fertig' },
  { id: 'worker-assigned', drive: assignWorker, shot: '11-dungling-am-werk', expect: { panel: 'Zugewiesen 1' } },
];
