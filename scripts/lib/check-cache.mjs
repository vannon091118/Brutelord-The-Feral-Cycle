/** Der lokale Pruef-Speicher: Fingerabdruck aus Import-Huelle und genannten
 *  Dateien. Nur identische Eingaben erlauben einen wiederverwendeten Lauf. */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

export const CACHE_FILE = '.cache/checks.json';
const FORMAT = 'checks-1';
const IMPORT_RE = /(?:import|export)[^'"\n]*from\s*['"]([^'"]+)['"]/g;
const PATH_RE = /['"](\/?[\w.-]+\/[\w./-]*\.(?:mjs|js|json|sql|yml|yaml|css))['"]/g;

const TEILE = new Map();

function textOf(file) {
  if (!TEILE.has(file)) TEILE.set(file, readFileSync(file, 'utf8'));
  return TEILE.get(file);
}

function localImports(file) {
  return [...textOf(file).matchAll(IMPORT_RE)].map((match) => match[1]).filter((spec) => spec.startsWith('.'));
}

/** Die Datei plus alles, was sie ueber relative Importe erreicht. */
export function closureOf(file, seen = new Set()) {
  const absolute = resolve(file);
  if (seen.has(absolute) || !existsSync(absolute)) return seen;
  seen.add(absolute);
  for (const spec of localImports(absolute)) closureOf(dirname(absolute) + '/' + spec, seen);
  return seen;
}

/** Dateipfade im Text der Huelle: goldene Werte, Workflows, gestartete Skripte. */
export function mentionedFiles(files) {
  const root = resolve('.') + '/';
  const found = new Set();
  for (const file of files) {
    for (const match of textOf(file).matchAll(PATH_RE)) {
      const absolute = resolve(match[1].replace(/^\//, ''));
      if (absolute.startsWith(root) && existsSync(absolute)) found.add(absolute);
    }
  }
  return found;
}

export function fingerprintFiles({ files, context }) {
  const hash = createHash('sha1');
  hash.update(`${FORMAT}\u0000${context}`);
  for (const file of [...files].sort()) {
    hash.update(`\u0000${file}\u0000`);
    hash.update(textOf(file));
  }
  return hash.digest('hex');
}

/** Ein Ordner als Eintrag zaehlt mit allem darin — auch was nichts importiert. */
function addInput(files, entry, seen = new Set()) {
  const absolute = resolve(entry);
  if (seen.has(absolute) || !existsSync(absolute)) return;
  seen.add(absolute);
  if (!statSync(absolute).isDirectory()) return void files.add(absolute);
  for (const name of readdirSync(absolute)) {
    if (!name.startsWith('.')) addInput(files, join(absolute, name), seen);
  }
}

export function fingerprintOf(group, { nodeMajor }) {
  const files = closureOf(group.file);
  if (files.size === 0) throw new Error(`Pruefgruppe ${group.id}: ${group.file} gibt es nicht.`);
  for (const extra of group.inputs ?? []) addInput(files, extra);
  for (const extra of mentionedFiles(files)) files.add(extra);
  const context = group.browser ? `node${nodeMajor}|${process.env.DL_BROWSER_URL ?? 'eigen'}` : `node${nodeMajor}`;
  return fingerprintFiles({ files, context });
}

export function loadCache() {
  if (!existsSync(CACHE_FILE)) return {};
  try {
    const cache = JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
    return cache?.format === FORMAT ? cache.groups ?? {} : {};
  } catch {
    return {};
  }
}

export function saveCache(groups) {
  mkdirSync(dirname(CACHE_FILE), { recursive: true });
  writeFileSync(CACHE_FILE, `${JSON.stringify({ format: FORMAT, groups }, null, 2)}\n`);
}
