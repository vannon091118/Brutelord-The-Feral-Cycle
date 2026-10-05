#!/usr/bin/env node
/** Das CI-Gate: Hard Caps, Version, Commit-Regeln. */
import { execFileSync } from 'node:child_process';
import {
  commitViolations,
  changedFiles,
  commitMessage,
  listCommits,
} from './lib/commit-rules.mjs';
import {
  versionViolations,
  versionTransitionViolations,
  readVersionState,
} from './lib/version-authority.mjs';
import { HARD_CAPS, analyzeData, analyzeTree } from './lib/source-metrics.mjs';

const TREE_ROOTS = ['src', 'scripts', 'tools'];
const DATA_ROOTS = ['tools/tests/state'];

function hasRef(ref) {
  try {
    execFileSync('git', ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export { hasRef };

function currentBranch() {
  try {
    return execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

export function detectRange() {
  if (hasRef('origin/main')) return 'origin/main..HEAD';
  if (hasRef('main') && currentBranch() !== 'main') return 'main..HEAD';
  if (hasRef('HEAD~1')) return 'HEAD~1..HEAD';
  return null;
}

function runTreeCheck() {
  const violations = [
    ...TREE_ROOTS.flatMap((root) => analyzeTree(root, HARD_CAPS)),
    ...DATA_ROOTS.flatMap((root) => analyzeData(root, HARD_CAPS)),
  ];
  return violations.map((violation) => ({
    rule: violation.rule,
    detail: `${violation.file}${violation.line ? `:${violation.line}` : ''} — ${violation.detail}`,
  }));
}

function readVersionAt(ref) {
  try {
    const output = execFileSync('git', ['show', `${ref}:version.lock.json`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const lock = JSON.parse(output);
    return { version: lock.version, revision: lock.revision };
  } catch {
    return null;
  }
}

function transitionProblems(state, baseRef) {
  if (!baseRef || !hasRef(baseRef)) return [];
  const base = readVersionAt(baseRef);
  if (!base) return [];
  return versionTransitionViolations({ base, head: state }).map((detail) => ({
    rule: 'globale Version ohne Branch-Divergenz',
    detail,
  }));
}

function runVersionCheck(baseRef) {
  const state = readVersionState(process.cwd());
  const consistency = versionViolations(state).map((detail) => ({ rule: 'Versionierung einheitlich', detail }));
  const transition = transitionProblems(state, baseRef);
  const problems = [...consistency, ...transition];
  if (problems.length === 0) {
    console.log(`Version ${state.version}, Revision ${state.revision} — einheitlich.`);
  }
  return problems;
}

function runCommitCheck(range) {
  if (!range) {
    console.log('Commit-Regeln: keine Basislinie gefunden, übersprungen.');
    return [];
  }
  // Nach einem Force-Push zeigt die gemeldete Basis auf einen Commit, den es
  // nicht mehr gibt; ohne diese Pruefung bricht listCommits hart ab.
  if (!hasRef(range.split('..')[0])) {
    const head = range.split('..').at(-1);
    console.log(`Commit-Regeln: Basis ${range.split('..')[0]} existiert nicht mehr, übersprungen.`);
    return head === range.split('..')[0] ? [] : runCommitCheck(`${head}^..${head}`);
  }
  const shas = listCommits(range);
  if (shas.length === 0) {
    console.log(`Commit-Regeln: keine neuen Commits in ${range}.`);
    return [];
  }
  const entries = shas.map((sha) => ({
    sha: sha.slice(0, 8),
    message: commitMessage(sha),
    paths: changedFiles(sha),
    isMerge: false,
  }));
  const problems = entries.flatMap(commitViolations);
  console.log(`Commit-Regeln: ${entries.length} Commit(s) in ${range} geprüft.`);
  return problems;
}

function report(title, problems) {
  if (problems.length === 0) {
    console.log(`  ok   ${title}`);
    return 0;
  }
  problems.forEach((problem) => console.error(` FAIL  ${problem.rule}: ${problem.detail}`));
  return problems.length;
}

function main() {
  const args = process.argv.slice(2);
  const wantsAll = args.length === 0;
  const commitArg = args.find((arg) => arg.startsWith('--commits'));
  const baseArg = args.find((arg) => arg.startsWith('--base='));
  const explicitRange = commitArg?.includes('=') ? commitArg.split('=')[1] : null;
  const baseRef = baseArg?.split('=')[1] ?? explicitRange?.split('..')[0] ?? detectRange()?.split('..')[0] ?? null;

  let failures = 0;
  if (wantsAll || args.includes('--tree')) {
    failures += report('Hard Caps (LOC, Parameter, Imports)', runTreeCheck());
  }
  if (wantsAll || args.includes('--version')) {
    failures += report('Versionierung', runVersionCheck(baseRef));
  }
  if (wantsAll || commitArg) {
    failures += report('Commit-Regeln', runCommitCheck(explicitRange ?? detectRange()));
  }

  if (failures > 0) {
    console.error(`\nGate: ${failures} Verstoß/Verstöße.`);
    process.exitCode = 1;
    return;
  }
  console.log('\nGate: alles grün.');
}

// Der Einstiegspunkt laeuft nur, wenn diese Datei das Ziel ist — sonst
// feuert jeder Import (verify-commit-gate.mjs) das Gate ein zweites Mal ab.
if (process.argv[1]?.endsWith('ci-gate.mjs')) main();
