#!/usr/bin/env node
/**
 * Der Versionierer: die einzige Stelle, die Versionen schreibt.
 *
 *   node scripts/version.mjs check              Stand prüfen
 *   node scripts/version.mjs sync               package.json aus VERSION spiegeln
 *   node scripts/version.mjs bump patch|minor|major
 *   node scripts/version.mjs set 1.2.3
 *
 * Warum nur hier? Parallele Branches, die selbst an der Version drehen,
 * divergieren. Version und Revision wandern gemeinsam — über dieses Werkzeug.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  LOCK_FILE,
  NPM_LOCK_FILE,
  PACKAGE_FILE,
  VERSION_FILE,
  bumpVersion,
  compareVersions,
  parseVersion,
  readJson,
  readVersionState,
  versionViolations,
} from './lib/version-authority.mjs';

const ROOT = process.cwd();

/**
 * Schreibt Lock und Spiegel. Alles, was der Lock sonst noch festhält — etwa
 * ein `amends` aus einer ausdrücklichen Korrektur — bleibt dabei stehen.
 */
function writeVersionState({ version, revision }) {
  const lock = { ...readJson(join(ROOT, LOCK_FILE)), version, revision };
  const pkg = { ...readJson(join(ROOT, PACKAGE_FILE)), version };
  const npmLock = readJson(join(ROOT, NPM_LOCK_FILE));
  npmLock.version = version;
  if (npmLock.packages?.['']) npmLock.packages[''].version = version;
  writeFileSync(join(ROOT, VERSION_FILE), `${version}\n`);
  writeFileSync(join(ROOT, LOCK_FILE), `${JSON.stringify(lock, null, 2)}\n`);
  writeFileSync(join(ROOT, PACKAGE_FILE), `${JSON.stringify(pkg, null, 2)}\n`);
  writeFileSync(join(ROOT, NPM_LOCK_FILE), `${JSON.stringify(npmLock, null, 2)}\n`);
}

function report(problems) {
  if (problems.length === 0) {
    console.log('Versionierung einheitlich.');
    return;
  }
  problems.forEach((problem) => console.error(`Versionierung: ${problem}`));
  process.exitCode = 1;
}

function runCheck() {
  const state = readVersionState(ROOT);
  report(versionViolations(state));
  if (versionViolations(state).length === 0) {
    console.log(`Version ${state.version}, Revision ${state.revision}.`);
  }
}

function runSync() {
  const state = readVersionState(ROOT);
  writeVersionState({ version: state.version, revision: state.revision });
  console.log(`package.json auf ${state.version} gespiegelt (Revision ${state.revision}).`);
}

function runSet(target) {
  const state = readVersionState(ROOT);
  if (!parseVersion(target)) throw new Error(`Ungültige Version: ${target}`);
  if (compareVersions(target, state.version) <= 0) {
    throw new Error(`${target} ist nicht größer als ${state.version}.`);
  }
  writeVersionState({ version: target, revision: state.revision + 1 });
  console.log(`Version ${target}, Revision ${state.revision + 1}.`);
}

function runBump(kind) {
  const state = readVersionState(ROOT);
  const next = bumpVersion(state.version, kind);
  writeVersionState({ version: next, revision: state.revision + 1 });
  console.log(`Version ${next} (${kind}), Revision ${state.revision + 1}.`);
}

const [, , command, argument] = process.argv;

try {
  if (command === 'check' || command === undefined) runCheck();
  else if (command === 'sync') runSync();
  else if (command === 'set') runSet(argument);
  else if (command === 'bump') runBump(argument ?? 'patch');
  else throw new Error(`Unbekannter Befehl: ${command}`);
} catch (error) {
  console.error(`Versionierer: ${error.message}`);
  process.exitCode = 1;
}
