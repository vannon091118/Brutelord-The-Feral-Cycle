#!/usr/bin/env node
/** Führt die Slice-Akzeptanzprüfungen in fachlichen Gruppen aus. */
import {
  checkArchitecture, checkColony, checkEdgeMaskGroup, checkMining,
  checkOnboarding, checkRaidGroup, checkRooting, checkStart, checkStartup,
  makeOnboardingRun, summary,
} from './verify/index.mjs';

/** Die HTTP- und die Browser-Prüfungen am Ende brauchen einen laufenden Server
 *  und werden abgewartet — sonst zählt `summary()` vorher und der Lauf meldet
 *  grün, ohne dass diese Gruppen je gelaufen sind. */
async function main() {
  checkStart();
  const run = makeOnboardingRun();
  checkOnboarding(run);
  checkMining(run);
  checkRooting(run);
  checkEdgeMaskGroup();
  checkColony(run);
  checkRaidGroup();
  await checkStartup();
  await checkArchitecture();
  process.exitCode = summary();
}

main();