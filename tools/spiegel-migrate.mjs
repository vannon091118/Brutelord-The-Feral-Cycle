#!/usr/bin/env node
/** Mechanische Migration: Kommentare in Spiegel-Doku, Code behaelt den Pointer. */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { commentLineNumbers, parseFunctions } from '../scripts/lib/source-metrics.mjs';
import { POINTER_RE, pointerFor, spiegelPath, sourceFiles } from '../scripts/lib/spiegel-rules.mjs';

const WRAP = 92;
const PLACEHOLDER = 'Kein Kommentar im Bestand — die Verantwortung steht in den Schnittstellen.';

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
  // Der Pointer ist eine Adresse, keine Erklaerung: sonst schreibt ein zweiter
  // Lauf ueber einen migrierten Baum die Adresse als Prosa zurueck.
  return commentLineNumbers(code)
    .filter((line) => !POINTER_RE.test(lines[line - 1]))
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
  const anchor = base.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const exports = parseFunctions(code).map((fn) => `- \`${fn.name}()\``);
  const wrapped = prose.length > 0 ? wrap(prose) : [PLACEHOLDER];
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

// Prosa wird nie ueberschrieben, und ein zweiter Lauf liefert dieselben Bytes:
// docs/daten ist nach der Migration die Quelle, keine Ausgabe (GOVERNANCE).
function hasContent(docPath) {
  if (!existsSync(docPath)) return false;
  const lines = readFileSync(docPath, 'utf8').split('\n');
  const start = lines.findIndex((line) => line.trim() === '## Verantwortung');
  if (start === -1) return false;
  const body = lines.slice(start + 1);
  const end = body.findIndex((line) => line.startsWith('## '));
  return (end === -1 ? body : body.slice(0, end))
    .some((line) => line.trim() !== '' && !line.trim().startsWith('@doc:') && line.trim() !== PLACEHOLDER);
}

function main() {
  const files = sourceFiles();
  let docs = 0;
  let codes = 0;
  let kept = 0;
  for (const path of files) {
    const code = readFileSync(path, 'utf8');
    const docPath = spiegelPath(path);
    if (hasContent(docPath)) kept += 1;
    else {
      mkdirSync(docPath.split('/').slice(0, -1).join('/'), { recursive: true });
      const nextDoc = docText(path, code, proseOf(code));
      if (!existsSync(docPath) || readFileSync(docPath, 'utf8') !== nextDoc) {
        writeFileSync(docPath, nextDoc);
        docs += 1;
      }
    }
    const next = migrateCode(code, pointerFor(path));
    if (next !== code) {
      writeFileSync(path, next);
      codes += 1;
    }
  }
  console.log(`Migration: ${docs} Spiegel-Dateien neu aufgebaut, ${kept} mit vorhandener Prosa behalten, ${codes} Code-Dateien auf Pointer gesetzt.`);
}

main();
