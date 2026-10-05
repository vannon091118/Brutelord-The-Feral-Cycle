/** Spiegel-Regeln: Pointer-Pflicht, Spiegel-Doku, Caps, Orphan, Drift. */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { commentLineNumbers, parseFunctions } from './source-metrics.mjs';

export const SPIEGEL_CAPS = {
  commentsPerFile: 1,
  docLines: 80,
  docMinLines: 4,
  docMaxColumns: 100,
};

const DOC_ROOT = 'docs/daten';
export const POINTER_RE = /^\/\/\s*@doc:\s*(docs\/daten\/[A-Za-z0-9_./-]+\.md)#([A-Za-z0-9_-]+)\s*$/;

function walk(dir, extensions = ['.js', '.jsx', '.mjs'], found = []) {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.')) continue;
    const full = `${dir}/${entry}`;
    if (statSync(full).isDirectory()) walk(full, extensions, found);
    else if (extensions.some((extension) => entry.endsWith(extension))) found.push(full);
  }
  return found;
}

export function sourceFiles() {
  return walk('src');
}

export function spiegelPath(path) {
  const segments = path.split('/');
  const base = segments.pop().replace(/\.(js|jsx|mjs)$/, '').toLowerCase();
  const domain = segments.length <= 1 ? 'app' : segments[segments.length - 1];
  return `${DOC_ROOT}/${domain}/${base}.md`;
}

export function pointerFor(path) {
  const base = path.split('/').pop().replace(/\.(js|jsx|mjs)$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `// @doc: ${spiegelPath(path)}#${base}`;
}

function anchorOf(code) {
  const line = code.split('\n').find((candidate) => POINTER_RE.test(candidate));
  // Gruppe 2 traegt den Anchor bereits ohne "#": der alte cut stammt aus der
  // Zeit, als die Gruppe optional war.
  return line ? POINTER_RE.exec(line)[2] ?? '' : '';
}

function headingExists(text, anchor) {
  const heading = `## ${anchor}`;
  return text.split('\n').some((line) => line.trim() === heading || line.trim().startsWith(`${heading} `));
}

export function checkFile(path, code) {
  const commentLines = commentLineNumbers(code);
  if (commentLines.length > SPIEGEL_CAPS.commentsPerFile) {
    const line = code.split('\n')[commentLines[1] - 1]?.trim();
    return [{ rule: 'max 1 Kommentarzeile pro src-Modul', detail: `${path}:${commentLines[1]} — "${line?.slice(0, 60)}"` }];
  }
  if (commentLines.length === 1) {
    const line = code.split('\n')[commentLines[0] - 1]?.trim();
    if (!POINTER_RE.test(line)) {
      return [{ rule: 'Die Kommentarzeile ist ein @doc-Pointer', detail: `${path}:${commentLines[0]} — "${line?.slice(0, 70)}"` }];
    }
    const match = POINTER_RE.exec(line);
    if (!existsSync(match[1])) {
      return [{ rule: 'Der Pointer zeigt auf eine Spiegel-Datei', detail: `${path} — ${match[1]} existiert nicht` }];
    }
    return [];
  }
  if (parseFunctions(code).length === 0) return [];
  return [{ rule: 'Jedes Modul mit Logik trägt einen @doc-Pointer', detail: `${path} — kommentarfrei, Spiegel unlinked` }];
}

function docCapsViolations(docPath, lines) {
  const nonEmpty = lines.filter((line) => line.trim() !== '');
  const problems = [];
  if (lines.length > SPIEGEL_CAPS.docLines) {
    problems.push({
      rule: `max ${SPIEGEL_CAPS.docLines} Zeilen pro Spiegel-Doku`,
      detail: `${docPath} — ${lines.length} Zeilen: SRP-Verdacht, das Modul muss gespalten werden`,
    });
  }
  if (nonEmpty.length < SPIEGEL_CAPS.docMinLines) {
    problems.push({ rule: `mindestens ${SPIEGEL_CAPS.docMinLines} gefüllte Zeilen`, detail: `${docPath} — ${nonEmpty.length}` });
  }
  const widest = Math.max(...nonEmpty.map((line) => line.length));
  if (widest > SPIEGEL_CAPS.docMaxColumns) {
    problems.push({ rule: `höchstens ${SPIEGEL_CAPS.docMaxColumns} Zeichen je Zeile`, detail: `${docPath} — ${widest} Zeichen: gestauchter Text` });
  }
  return problems;
}

// Der Abschnitt muss Erklaerung tragen: besteht er nur aus dem Pointer, ist die
// Doku eine Wegweisung ohne Weg, und der Modultext existiert nirgends mehr.
function responsibilityViolations(docPath, lines) {
  const start = lines.findIndex((line) => line.trim() === '## Verantwortung');
  if (start === -1) return [{ rule: 'Abschnitt "## Verantwortung" vorhanden', detail: docPath }];
  const body = lines.slice(start + 1);
  const end = body.findIndex((line) => line.startsWith('## '));
  const section = (end === -1 ? body : body.slice(0, end))
    .map((line) => line.trim())
    .filter((line) => line !== '');
  if (section.some((line) => !line.startsWith('@doc:'))) return [];
  return [{ rule: 'Verantwortung trägt Inhalt, nicht den Pointer', detail: `${docPath} — der Abschnitt besteht nur aus @doc:` }];
}

function pointerViolations({ path, docPath, code, text }) {
  const pointerAnchor = anchorOf(code);
  if (!pointerAnchor) return [];
  if (!headingExists(text, pointerAnchor)) {
    return [{ rule: 'Der Anchor des Pointers existiert in der Spiegel-Doku', detail: `${docPath} — kein "## ${pointerAnchor}"` }];
  }
  const target = code.split('\n').find((candidate) => POINTER_RE.test(candidate));
  const pointerTarget = POINTER_RE.exec(target)[1];
  if (pointerTarget !== docPath) {
    return [{ rule: 'Der Pointer zeigt auf die eigene Spiegel-Datei', detail: `${path} — ${pointerTarget} gegen ${docPath}` }];
  }
  return [];
}

export function checkSpiegelDoc(path, code) {
  const docPath = spiegelPath(path);
  if (!existsSync(docPath)) {
    return [{ rule: 'Spiegel-Datei vorhanden', detail: `${path} — ${docPath} fehlt` }];
  }
  const text = readFileSync(docPath, 'utf8');
  const lines = text.split('\n');
  return [
    ...docCapsViolations(docPath, lines),
    ...responsibilityViolations(docPath, lines),
    ...pointerViolations({ path, docPath, code, text }),
  ];
}

export function analyzeSpiegel() {
  const problems = [];
  const codeFiles = sourceFiles();
  for (const path of codeFiles) {
    const code = readFileSync(path, 'utf8');
    problems.push(...checkFile(path, code), ...checkSpiegelDoc(path, code));
  }
  const referenced = new Set(codeFiles.map((path) => spiegelPath(path)));
  const docs = existsSync(DOC_ROOT) ? walk(DOC_ROOT, ['.md']) : [];
  for (const doc of docs) {
    if (!referenced.has(doc)) {
      problems.push({ rule: 'Keine verwaiste Spiegel-Doku', detail: `${doc} — kein aktiver Pointer im Code` });
    }
  }
  return problems;
}

export function driftEntries(base) {
  if (!base) return [];
  const changed = execFileSync('git', ['diff', '--name-only', base], { encoding: 'utf8' }).split('\n').filter(Boolean);
  const docs = new Set(changed.filter((path) => path.startsWith(`${DOC_ROOT}/`)));
  const sources = sourceFiles();
  const entries = [];
  for (const path of changed.filter((candidate) => /^src\/.+\.(js|jsx|mjs)$/.test(candidate))) {
    if (!sources.includes(path)) continue;
    const code = readFileSync(path, 'utf8');
    if (anchorOf(code) === '') continue;
    const doc = spiegelPath(path);
    if (!docs.has(doc)) {
      entries.push({ rule: 'Quelle und Spiegel-Datei wandern zusammen', detail: `${path} — ${doc} nicht im selben Änderungsbereich` });
    }
  }
  return entries;
}
