#!/usr/bin/env node
/** Der Doku-Sync: pre-flight vor jedem Schreiben, Bewegung nur hier. */
import { writeFileSync } from 'node:fs';
import {
  CHECKPOINT_FILE,
  OPEN_FILE,
  readDocText,
} from './lib/docs-parse.mjs';
import { planMoves, validate } from './lib/docs-rules.mjs';
import { readVersionState } from './lib/version-authority.mjs';

function report(problems) {
  if (problems.length === 0) return 0;
  for (const problem of problems) console.error(`Doku: ${problem.rule} — ${problem.detail}`);
  console.error(`${problems.length} Problem(e) in der Doku.`);
  return problems.length;
}

export function preFlightProblems() {
  const open = validate(OPEN_FILE, readDocText(OPEN_FILE));
  const checkpoints = validate(CHECKPOINT_FILE, readDocText(CHECKPOINT_FILE));
  return [...open.problems, ...checkpoints.problems];
}

function runCheck() {
  const problems = preFlightProblems();
  if (problems.length > 0) { process.exitCode = report(problems); return; }
  const state = readVersionState(process.cwd());
  console.log(`Doku: Einträge valide, Status fix/geplant konsistent (Version ${state.version}).`);
}

function runSync() {
  const problems = preFlightProblems();
  if (problems.length > 0) {
    process.exitCode = report(problems);
    console.error('Doku-Sync: nichts geschrieben — ein invalider Eintrag stoppt den Bump.');
    return;
  }
  const state = readVersionState(process.cwd());
  const openBefore = readDocText(OPEN_FILE);
  const checkpointBefore = readDocText(CHECKPOINT_FILE);
  const planned = planMoves({
    openText: openBefore,
    checkpointText: checkpointBefore,
    version: state.version,
    date: new Date().toISOString().slice(0, 10),
  });
  if (planned.openText === openBefore && planned.checkpointText === checkpointBefore) {
    console.log(`Doku-Sync: nichts zu bewegen — Doku synchron (Version ${state.version}).`);
    return;
  }
  writeFileSync(process.cwd() + '/' + OPEN_FILE, planned.openText);
  writeFileSync(process.cwd() + '/' + CHECKPOINT_FILE, planned.checkpointText);
  console.log(`Doku-Sync: Version ${state.version} gestempelt, Einträge bewegt.`);
}

const command = process.argv[2];
try {
  if (process.argv[1]?.endsWith('docs-sync.mjs')) {
    if (command === '--check' || command === 'check' || command === undefined) runCheck();
    else if (command === 'sync') runSync();
    else throw new Error(`Unbekannter Befehl: ${command} (erlaubt: --check, sync)`);
  }
} catch (error) {
  console.error(`Doku-Sync: ${error.message}`);
  process.exitCode = 1;
}
