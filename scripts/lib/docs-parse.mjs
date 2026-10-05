/** Parser für die Doku-Einträge: Listitem, Metadaten-Block, Section. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const OPEN_FILE = 'Docs/ROADMAP_OPEN.md';
export const CHECKPOINT_FILE = 'Docs/CHECKPOINTS.md';
export const META_KEYS = ['Status', 'Scope', 'Kategorie', 'Version', 'Datum'];
export const PLACEHOLDER = 'ausstehend';

const LIST_ITEM = /^(\s*)- \[( |x)\] (.*)$/;
const META_LINE = /^(Status|Scope|Kategorie|Version|Datum):\s*(.+)$/;
const SECTION = /^## /;
const EXEMPT = '<!-- Metadaten: aus -->';

export function readDocText(path) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

export function parseEntries(path, text = readDocText(path)) {
  const entries = [];
  let current = null;
  let exempted = false;
  text.split('\n').forEach((line, index) => {
    if (SECTION.test(line)) {
      if (current) { entries.push(current); current = null; }
      exempted = false;
      return;
    }
    if (line.includes(EXEMPT)) { exempted = true; return; }
    const item = LIST_ITEM.exec(line);
    if (item) {
      if (current) entries.push(current);
      current = {
        path,
        line: index + 1,
        indent: item[1].length,
        done: item[2] === 'x',
        text: item[3],
        meta: exempted ? null : {},
        exempted,
      };
      return;
    }
    if (!current || current.meta === null) return;
    const meta = META_LINE.exec(line.trim());
    if (meta) current.meta[meta[1]] = meta[2].trim();
  });
  if (current) entries.push(current);
  return entries;
}
