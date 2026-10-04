#!/usr/bin/env node
/** Führt die Slice-Akzeptanzprüfungen in fachlichen Gruppen aus. */
import { checkOnboarding, makeOnboardingRun } from './verify/check-onboarding.mjs';
import { checkStart } from './verify/check-start.mjs';
import { checkMining } from './verify/check-mining.mjs';
import { checkRooting } from './verify/check-rooting.mjs';
import { checkColony } from './verify/check-colony.mjs';
import { checkArchitecture } from './verify/check-architecture.mjs';
import { summary } from './verify/expect.mjs';

/** Die HTTP-Prüfungen am Ende brauchen einen laufenden Server und werden
 *  abgewartet — sonst zählt `summary()` vorher und der Lauf meldet grün,
 *  ohne dass diese Gruppe je gelaufen ist. */
async function main() {
  checkStart();
  const run = makeOnboardingRun();
  checkOnboarding(run);
  checkMining(run);
  checkRooting(run);
  checkColony(run);
  await checkArchitecture();
  process.exitCode = summary();
}

main();