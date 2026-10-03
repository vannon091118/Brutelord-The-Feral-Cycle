#!/usr/bin/env node
/** Führt die Slice-Akzeptanzprüfungen in fachlichen Gruppen aus. */
import { checkOnboarding, makeOnboardingRun } from './verify/check-onboarding.mjs';
import { checkStart } from './verify/check-start.mjs';
import { checkMining } from './verify/check-mining.mjs';
import { checkRooting } from './verify/check-rooting.mjs';
import { checkColony } from './verify/check-colony.mjs';
import { checkArchitecture } from './verify/check-architecture.mjs';
import { summary } from './verify/expect.mjs';

checkStart();
const run = makeOnboardingRun();
checkOnboarding(run);
checkMining(run);
checkRooting(run);
checkColony(run);
checkArchitecture();
process.exitCode = summary();
