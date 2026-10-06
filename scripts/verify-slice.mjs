#!/usr/bin/env node
/** Führt die Slice-Akzeptanzprüfungen in fachlichen Gruppen aus. */
import {
  checkAccountWorker, checkActionTypes, checkArchitecture, checkBurrowRing, checkColony, checkDeterminism, checkDunglingLook,
  checkEdgeMaskGroup, checkFixtures, checkGameClock, checkHitJuice, checkMining, checkOnboarding, checkRaidCap,
  checkRaidGroup, checkReveal, checkSoilMass, checkRooting, checkStart, checkStartup, checkStorage,
  checkVerticality, checkVerticalityWiring, checkOrganicCache, makeOnboardingRun, summary,
} from './verify/index.mjs';

/** Die HTTP- und die Browser-Prüfungen am Ende brauchen einen laufenden Server
 *  und werden abgewartet — sonst zählt `summary()` vorher und der Lauf meldet
 *  grün, ohne dass diese Gruppen je gelaufen sind. */
async function main() {
  checkStart();
  const run = makeOnboardingRun();
  checkOnboarding(run);
  checkMining(run);
  checkHitJuice(run.state);
  checkRooting(run);
  checkEdgeMaskGroup();
  await checkColony(run);
  checkOrganicCache();
  checkRaidGroup();
  checkRaidCap();
  checkSoilMass();
  checkBurrowRing();
  checkReveal();
  checkDunglingLook();
  await checkStorage();
  checkVerticality();
  checkVerticalityWiring();
  checkFixtures();
  checkActionTypes();
  checkDeterminism();
  checkGameClock();
  await checkStartup();
  await checkArchitecture();
  await checkAccountWorker();
  process.exitCode = summary();
}

main();