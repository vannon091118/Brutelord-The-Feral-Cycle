/** Die Erwartungsliste: jeder Schritt treibt die Seite weiter und sagt, was gelten muss. */
import { ONBOARDING_CONFIG } from '../../src/domain/onboarding/onboarding-config.js';
import { ONBOARDING_ORDER, ONBOARDING_STATE } from '../../src/domain/onboarding/onboarding-state.js';
import { JOB_CONFIG } from '../../src/domain/labour/job-config.js';
import { BUILDING_TYPE, BUILDING_DEFS, START_ESSENCE } from '../../src/domain/buildings/building-config.js';
import {
  assignWorker,
  clickEarth,
  clickHive,
  clickMine,
  pickExtractor,
  placeSpot,
  selectBuilding,
} from './drive.mjs';
import { HINTS } from '../../src/ui/hint-texts.js';
import { countFloorTiles, createWorld } from '../../src/domain/world/grid.js';

const C = ONBOARDING_CONFIG;
const START_RAUM = countFloorTiles(createWorld());
const S = ONBOARDING_STATE;
const EXTRACTOR = BUILDING_TYPE.ESSENCE_EXTRACTOR;
const LABEL = BUILDING_DEFS[EXTRACTOR].label;

// Der Schritt misst ab dem Beginn des Abbaus: Abbau, Zerstörung des Blocks und der
// Puffer fuer die Taktaufloesung des Herzschlags und einen Lese-Schritt.
const miningBudget = C.miningDurationMs + C.tileDestructionMs + 4 * C.miningTickMs;

/** Jeder Onboarding-Zustand als sein Hinweistext — die Soll-Reihenfolge. */
export const CHAIN_TEXTS = ONBOARDING_ORDER.map((state) => HINTS[state].text);

export const BEATS = [
  { id: 'start', state: S.INITIAL, within: 0, shot: '01-warten', expect: { essence: START_ESSENCE, raum: START_RAUM, buildMenu: 0 } },
  { id: 'hive-click', drive: clickHive },
  { id: 'spawn-done', state: S.DUNGLING_IDLE, within: C.dunglingSpawnDelayMs + 2000, shot: '02-dungling-kommt' },
  { id: 'tile-picked', state: S.ACTION_MENU, within: 1500, drive: clickEarth, shot: '03-abbau-menue' },
  { id: 'dungling-works', state: S.MINING, within: C.workerMoveDurationMs + 900, drive: clickMine, shot: '04-abbau' },
  { id: 'floor-grows', state: S.GRID_EXPANDED, within: miningBudget, shot: '05-abgebaut' },
  { id: 'build-menu', state: S.BUILD_MENU_VISIBLE, within: C.gridExpansionMs + 900, shot: '06-baumenue', expect: { raum: START_RAUM + 1, buildMenu: 1 } },
  { id: 'extractor-picked', drive: pickExtractor, shot: '07-extractor-gewaehlt', expect: { pressed: LABEL } },
  { id: 'site-placed', drive: placeSpot, shot: '08-bauplatz', expect: { spots: 0 } },
  { id: 'site-open', drive: selectBuilding, shot: '09-bauplatz-offen', expect: { panel: LABEL } },
  { id: 'site-ready', within: JOB_CONFIG.cycleMs * 4, waitFor: 'Fertig gebaut und in Betrieb.', shot: '10-extractor-fertig' },
  { id: 'worker-assigned', drive: assignWorker, shot: '11-dungling-am-werk', expect: { panel: 'Zugewiesen 1' } },
];
