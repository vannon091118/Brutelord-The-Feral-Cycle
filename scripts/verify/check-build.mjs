/**
 * Der Bauablauf: Jeder Bau ist erst ein Bauplatz, den Dunglinge mit Essenz
 * bezahlen — Stück für Stück, bis der Preis beisammen ist. Geprüft wird gegen
 * die Domänenkonstanten, nicht gegen abgeschriebene Zahlen.
 */
import {
  BUILDING_DEFS,
  BUILDING_STATE,
  BUILDING_TYPE,
  MAX_DUNGLINGS,
} from '../../src/domain/buildings/building-config.js';
import { JOB_CONFIG } from '../../src/domain/labour/job-config.js';
import { ONBOARDING_CONFIG } from '../../src/domain/onboarding/onboarding-config.js';
import { buildRun } from './build-run.mjs';
import { check, section } from './expect.mjs';

const def = (type) => BUILDING_DEFS[type];

function checkSites(run) {
  section('Bauen: Bauplatz, Essenz und Fertigstellung');
  check('Sechs Felder abgebaut, sieben nutzbar', run.mined.usableTileCount === 7);
  check('Der Startvorrat reicht nicht für den teuersten Bau', run.bruteLordRefused);
  check('Der Bauplatz verlangt den Preis des Baus', run.extractor.required === def(BUILDING_TYPE.ESSENCE_EXTRACTOR).cost);
  check('Vor der Lieferung steht nur der Bauplatz', run.extractor.stateBefore === BUILDING_STATE.SITE);
  check('Nach der Lieferung steht das Bauwerk', run.extractor.state === BUILDING_STATE.READY);
  check(
    'Nach dem Abbau bleibt genau ein Extraktor übrig',
    run.extractor.essenceStart === def(BUILDING_TYPE.ESSENCE_EXTRACTOR).cost,
    `${run.extractor.essenceStart}Essenz`,
  );
  check('Die Essenz ist danach verbraucht', run.extractor.essenceAfter === 0, `${run.extractor.essenceAfter} übrig`);
  check('Auf belegtem Boden wird nicht gebaut', run.occupiedRefused);
  check('Auf unberührter Erde wird nicht gebaut', run.earthRefused);
  check(
    'Der Brutlord braucht 2 x 2 Felder',
    run.bruteLord.tileCount === def(BUILDING_TYPE.BRUTE_LORD).width * def(BUILDING_TYPE.BRUTE_LORD).height,
  );
  check('Der Brutlord kostet seinen Preis', run.bruteLord.required === def(BUILDING_TYPE.BRUTE_LORD).cost);
  check('Auch der Brutlord wird durch Essenz fertig', run.bruteLord.state === BUILDING_STATE.READY);
}

function checkEssence(run) {
  section('Essenz: Extraktor, Zyklus, +1');
  check('Ein Extraktor beschäftigt den zugewiesenen Dungling', run.extractor.workers === 1);
  check('Höchstens drei Dunglinge je Extraktor', run.extractor.workersAtCap === def(BUILDING_TYPE.ESSENCE_EXTRACTOR).maxWorkers);
  check('Ein Zyklus dauert mindestens die konfigurierte Zeit', run.cycle.afterMs >= JOB_CONFIG.cycleMs);
  check('Der Zyklus presst genau eine Essenz', run.cycle.essence === 1);
  check('Die Essenz kommt mit einem +1-Symbol an', run.cycle.popups > 0);
  check(
    'Das Symbol steht über dem Hive',
    run.cycle.popupAt?.x === ONBOARDING_CONFIG.dunglingSpawnTile.x && run.cycle.popupAt?.y === ONBOARDING_CONFIG.dunglingSpawnTile.y,
  );
}

function checkSwarm(run) {
  section('Schwarm: der Hort brütet Arbeiter');
  check('Der Schwarmhort wird gebaut', run.swarm.state === BUILDING_STATE.READY);
  check('Der Bauplatz des Horts wird vollständig bezahlt', run.swarm.builtInMs > 0);
  check('Der Hort stößt einen neuen Arbeiter aus', run.swarm.spawnedAfter >= 1);
  check('Der Schwarm bleibt unter der Grenze', run.swarm.dunglingsAtEnd <= MAX_DUNGLINGS);
}

export function checkBuild() {
  const run = buildRun();
  checkSites(run);
  checkEssence(run);
  checkSwarm(run);
}
