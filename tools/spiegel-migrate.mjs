#!/usr/bin/env node
/** Mechanische Migration: Kommentare in Spiegel-Doku, Code behaelt den Pointer. */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { commentLineNumbers, parseFunctions } from '../scripts/lib/source-metrics.mjs';
import { pointerFor, spiegelPath, sourceFiles } from '../scripts/lib/spiegel-rules.mjs';

const WRAP = 92;

function wrap(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    if (current !== '' && (current + ' ' + word).length > WRAP) {
      lines.push(current);
      current = word;
    } else {
      current = current === '' ? word : `${current} ${word}`;
    }
  }
  if (current !== '') lines.push(current);
  return lines;
}

/** Jede Kommentarzeile wandert in die Prosa, der Code behaelt genau eine
 *  Kommentarzeile: den Pointer an der Stelle des ersten Kommentars. */
function migrateCode(code, pointer) {
  const lines = code.split('\n');
  const comments = commentLineNumbers(code);
  if (comments.length === 0) return `${pointer}\n${code}`;
  const keep = comments[0] - 1;
  const dropped = new Set(comments.map((line) => line - 1));
  const kept = lines
    .map((line, index) => (index === keep ? pointer : line))
    .filter((_, index) => index === keep || !dropped.has(index));
  return kept.join('\n');
}

function proseOf(code) {
  const lines = code.split('\n');
  const comments = commentLineNumbers(code);
  return comments
    .map((line) => lines[line - 1]
      .replace(/^\s*\{?\/\*+/, '')
      .replace(/\*+\/\}?\s*$/, '')
      .replace(/^\s*\*+/, '')
      .replace(/^\s*\/\/\s?/, '')
      .trim())
    .filter(Boolean)
    .join(' ');
}

function docText(path, code, prose) {
  const base = path.split('/').pop().replace(/\.(js|jsx|mjs)$/, '');
  // Derselbe Sanitizer wie in pointerFor(): Anchor und Pointer sind sonst
  // bei Dateinamen mit Punkt auseinander.
  const anchor = base.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const exports = parseFunctions(code).map((fn) => `- \`${fn.name}()\``);
  const wrapped = prose.length > 0 ? wrap(prose) : ['Kein Kommentar im Bestand — die Verantwortung steht im Code.'];
  const intro = wrap(`Spiegel-Datei für \`src/${path.replace(/^src\//, '')}\`.`);
  return [
    `# ${base}`,
    '',
    `## ${anchor}`,
    '',
    ...intro,
    '',
    '## Verantwortung',
    '',
    ...wrapped,
    '',
    '## Schnittstellen',
    '',
    ...(exports.length > 0 ? exports : ['- keine benannten Funktionen']),
    '',
    `Aus der Migration vom ${new Date().toISOString().slice(0, 10)} hervorgegangen.`,
    '',
  ].join('\n');
}

function main() {
  const files = sourceFiles();
  let docs = 0;
  let codes = 0;
  for (const path of files) {
    const code = readFileSync(path, 'utf8');
    const docPath = spiegelPath(path);
    if (!existsSync(docPath)) {
      mkdirSync(docPath.split('/').slice(0, -1).join('/'), { recursive: true });
      writeFileSync(docPath, docText(path, code, proseOf(code)));
      docs += 1;
    }
    const next = migrateCode(code, pointerFor(path));
    if (next !== code) {
      writeFileSync(path, next);
      codes += 1;
    }
  }
  console.log(`Migration: ${docs} Spiegel-Dateien angelegt, ${codes} Code-Dateien auf Pointer gesetzt.`);
}

const fresh = process.argv.includes('--fresh');
if (fresh && existsSync('docs/daten')) rmSync('docs/daten', { recursive: true });
main();
