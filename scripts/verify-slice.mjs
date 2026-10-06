#!/usr/bin/env node
/** Führt die Slice-Akzeptanzprüfungen in fachlichen Gruppen aus. */
import {
  checkArchitecture, checkBurrowRing, checkColony, checkEdgeMaskGroup, checkGrid, checkHitJuice, checkMining,
  checkOnboarding, checkRaidCap, checkRaidGroup, checkReveal, checkSoilMass, checkRooting, checkStart, checkStartup,
  checkStorage, checkVerticality, checkVerticalityWiring, makeOnboardingRun, summary,
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
  checkRaidGroup();
  checkRaidCap();
  checkSoilMass();
  checkBurrowRing();
  checkReveal();
  await checkStorage();
  checkVerticality();
  checkVerticalityWiring();
  await checkStartup();
  await checkArchitecture();
  checkGrid();
  process.exitCode = summary();
}

main();