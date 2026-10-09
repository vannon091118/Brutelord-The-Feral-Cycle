#!/usr/bin/env node
/** Die eine Prueflinie: lokal die gedeckelte Last, `--voll` die volle, `--browser`
 *  die Browser-Stufe — die CI ruft dieselbe Zeile, siehe Docs/WORKFLOW.md. */
import { execFileSync } from 'node:child_process';
import { fingerprintOf, loadCache, saveCache } from './lib/check-cache.mjs';
import { GROUPS, groupById, runGroups } from './verify/groups.mjs';
import { failureCount, summary } from './verify/expect.mjs';

const args = process.argv.slice(2);
const named = args.filter((arg) => !arg.startsWith('-'));
const nodeMajor = Number(process.versions.node.split('.')[0]);
const all = args.includes('--all');
const voll = args.includes('--voll') || process.env.DL_LAST === 'voll';
const DECKEL_MS = 9000;
const START = Date.now();
const useCache = !args.includes('--no-cache') && !all;
const cache = loadCache();

function git(argsToRun) {
  try {
    return execFileSync('git', argsToRun, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

export function changedPaths() {
  const offen = execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(3).trim().replace(/^"|"$/g, ''));
  const zaehlung = git(['rev-list', '--count', 'origin/main..HEAD']);
  const commits = zaehlung === null ? 0 : Number(zaehlung.trim());
  if (commits === 0) return { paths: offen, commits: 0 };
  return { paths: [...offen, ...(git(['diff', '--name-only', 'origin/main..HEAD']) ?? '').split('\n').filter(Boolean)], commits };
}

function explicitGuardianArgs() {
  const explicit = args.filter((arg) => arg.startsWith('--base=') || arg.startsWith('--commits='));
  return explicit.length > 0 ? ['--tree', '--spiegel', '--docs', '--version', ...explicit] : [];
}

export function guardianArgs({ paths, commits }) {
  if (all) return explicitGuardianArgs();
  const any = (pattern) => paths.some((path) => pattern.test(path));
  const flags = [];
  if (any(/^(src|scripts|tools)\//)) flags.push('--tree');
  if (any(/^src\//)) flags.push('--spiegel');
  if (any(/^Docs\/.+\.(md|markdown)$/)) flags.push('--docs');
  if (any(/^(version\.lock\.json|VERSION|package(-lock)?\.json)$/)) flags.push('--version');
  if (commits > 0) flags.push('--base=origin/main', '--commits=origin/main..HEAD');
  return flags;
}

function gate({ paths, commits }) {
  const flags = guardianArgs({ paths, commits });
  if (!all && flags.length === 0) {
    console.log('Waechter: nichts betroffen, keiner laeuft.');
    return;
  }
  console.log(`Waechter: gate ${flags.join(' ') || '(alle)'}`);
  try {
    execFileSync(process.execPath, ['scripts/ci-gate.mjs', ...flags], { stdio: 'inherit' });
  } catch {
    throw new Error('Waechter rot — die Pruefgruppen laufen nicht.');
  }
}

const unveraendert = (group) => cache[group.id] === fingerprintOf(group, { nodeMajor });

/** Ein Name ist eine Ansage: wer eine Gruppe nennt, will sie laufen sehen.
 *  Die Auswahl-Flags dagegen respektieren den Speicher. */
function select() {
  const gewaehlt = named.map((name) => groupById(name)).filter(Boolean);
  if (gewaehlt.length) return gewaehlt;
  const mitBrowser = args.includes('--browser');
  const basis = mitBrowser
    ? (all ? GROUPS : GROUPS.filter((group) => group.browser))
    : GROUPS.filter((group) => !group.browser);
  const kandidaten = voll ? basis : basis.filter((group) => !group.heavy);
  if (all || !useCache) return kandidaten;
  return kandidaten.filter((group) => !unveraendert(group));
}

function liste() {
  for (const group of GROUPS) {
    const frisch = unveraendert(group);
    const marke = `${group.browser ? ' [Browser]' : ''}${group.heavy ? ' [schwer]' : ''}`;
    console.log(`  ${group.id.padEnd(20)} ${frisch ? 'unveraendert' : 'laeuft      '} ${group.file}${marke}`);
  }
}

function measure(group, bericht) {
  return {
    ...group,
    run: async (m, ctx) => {
      const vorher = failureCount();
      const start = Date.now();
      try {
        return await group.run(m, ctx);
      } finally {
        bericht.set(group.id, { ms: Date.now() - start, ok: failureCount() === vorher });
      }
    },
  };
}

async function runSelected(groups) {
  const m = await import('./verify/index.mjs');
  const bericht = new Map();
  await runGroups({
    m,
    groups: groups.map((group) => measure(group, bericht)),
    prepare: async (mm) => {
      const start = Date.now();
      const run = await mm.makeOnboardingRun();
      bericht.set('onboarding-run', { ms: Date.now() - start, ok: true });
      return run;
    },
    stop: () => named.length === 0 && !voll && Date.now() - START >= DECKEL_MS,
  });
  const neu = { ...cache };
  for (const group of groups) {
    if (bericht.get(group.id)?.ok) neu[group.id] = fingerprintOf(group, { nodeMajor });
  }
  return { bericht, neu };
}

/** Die Zeiten kommen zuletzt: das Geruest haelt seinen Bericht bis `summary()`. */
function protokoll(bericht) {
  for (const [id, { ms, ok }] of bericht) {
    console.log(`${ok ? '  ok  ' : ' FAIL '} ${id.padEnd(20)} ${String(ms).padStart(6)} ms`);
  }
}

function modus() {
  if (voll) return args.includes('--browser') ? 'Volllauf mit Browser (die Zeile der CI)' : 'Volllauf ohne Browser';
  return `lokale Last: hoechstens ${DECKEL_MS / 1000} s, schwere Gruppen nur im Volllauf`;
}

async function main() {
  if (args.includes('--list')) return liste();
  const unbekannt = named.filter((name) => !groupById(name));
  if (unbekannt.length) throw new Error(`Unbekannte Gruppe(n): ${unbekannt.join(', ')} — npm run check -- --list`);
  console.log(`${modus()}\n`);
  gate(changedPaths());
  const groups = select();
  if (groups.length === 0) {
    console.log('Pruefgruppen: alle Eingaben unveraendert, keine laeuft.');
    return;
  }
  const { bericht, neu } = await runSelected(groups);
  if (useCache) saveCache(neu);
  console.log('');
  const fehler = summary();
  protokoll(bericht);
  const gelaufen = GROUPS.filter((group) => bericht.has(group.id));
  const uebersprungen = GROUPS.filter((group) => !bericht.has(group.id)).map((group) => group.id);
  console.log(`\n${gelaufen.length} von ${GROUPS.length} Gruppen gelaufen (uebersprungen: ${uebersprungen.join(', ') || 'keine'}).`);
  process.exitCode = fehler;
}

try {
  await main();
} catch (error) {
  console.error(`check: ${error.message}`);
  process.exitCode = 1;
}
