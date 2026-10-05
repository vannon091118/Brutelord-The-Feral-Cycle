/** Validatoren und der idempotente Move/Stamp für die Doku-Einträge. */
import {
  CHECKPOINT_FILE,
  META_KEYS,
  OPEN_FILE,
  PLACEHOLDER,
  parseEntries,
} from './docs-parse.mjs';

const CATEGORIES = ['Feature', 'Bugfix', 'Refactor', 'Test', 'Doku', 'Abnahme'];
const VERSION_RE = /^\d+\.\d+\.\d+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function metaViolations(entry) {
  const where = `${entry.path}:${entry.line}`;
  if (entry.meta === null) {
    if (entry.done || entry.exempted) return [];
    return [{ rule: 'Metadaten-Block', detail: `${where} — offener Eintrag ohne Attribute` }];
  }
  const missing = META_KEYS.filter((key) => !entry.meta[key]);
  return missing
    .map((key) => ({ rule: 'Metadaten-Block', detail: `${where} — ${key} fehlt` }))
    .concat(valueViolations(entry));
}

export function placeViolations(entry) {
  const problems = [];
  const where = `${entry.path}:${entry.line}`;
  if (entry.path === CHECKPOINT_FILE && entry.meta?.Status === 'geplant') {
    problems.push({ rule: 'geplant steht allein im Open-Dokument', detail: where });
  }
  if (entry.path === OPEN_FILE && entry.meta?.Status === 'fix') {
    problems.push({ rule: 'fix steht allein in den Checkpoints', detail: where });
  }
  if (entry.path === OPEN_FILE && entry.meta?.Version && entry.meta.Version !== PLACEHOLDER) {
    problems.push({ rule: 'Version wird im Open-Dokument nicht geraten', detail: `${where} — nutze ${PLACEHOLDER}` });
  }
  return problems;
}

function valueViolations(entry) {
  const where = `${entry.path}:${entry.line}`;
  const problems = [];
  const status = entry.meta.Status;
  if (status && status !== 'fix' && status !== 'geplant') {
    problems.push({ rule: 'Status ist fix oder geplant', detail: `${where} — gefunden: ${status}` });
  }
  const scope = entry.meta.Scope;
  if (scope && !/^\p{L}[\p{L}-]*$/u.test(scope)) {
    problems.push({ rule: 'Scope ist ein Wort', detail: `${where} — gefunden: ${scope}` });
  }
  const category = entry.meta.Kategorie;
  if (category && !CATEGORIES.includes(category)) {
    problems.push({ rule: `Kategorie ist eine aus ${CATEGORIES.join(', ')}`, detail: `${where} — gefunden: ${category}` });
  }
  const version = entry.meta.Version;
  if (version && version !== PLACEHOLDER && !VERSION_RE.test(version)) {
    problems.push({ rule: 'Version ist x.y.z', detail: `${where} — gefunden: ${version}` });
  }
  const date = entry.meta.Datum;
  if (date && date !== PLACEHOLDER && !DATE_RE.test(date)) {
    problems.push({ rule: 'Datum ist JJJJ-MM-TT', detail: `${where} — gefunden: ${date}` });
  }
  return problems;
}

export function validate(path, text) {
  const entries = parseEntries(path, text);
  const problems = [];
  let lastTopDone = false;
  for (const entry of entries) {
    if (entry.indent === 0) {
      lastTopDone = entry.done;
      problems.push(...metaViolations(entry), ...placeViolations(entry));
    } else if (lastTopDone && !entry.done && !entry.exempted) {
      problems.push({
        rule: 'Eintrag erst abhaken, wenn er fertig ist',
        detail: `${entry.path}:${entry.line} — offene Teilaufgabe unter abgehaktem Eintrag`,
      });
    }
  }
  return { file: path, problems };
}

function isTopItem(line) {
  return /^- \[( |x)\] /.test(line);
}

/** Ein Block ist die Listitem-Zeile samt ihrer Folgezeilen bis zum nächsten
 *  Eintrag oder der nächsten Section — der Eintrag als Ganzes. */
function collectTopBlocks(lines) {
  const blocks = [];
  let current = null;
  lines.forEach((line, index) => {
    if (isTopItem(line) || line.startsWith('## ') || line.trim() === '---') {
      if (current) blocks.push(current);
      current = isTopItem(line) ? { start: index, done: line.startsWith('- [x] '), lines: [line] } : null;
      return;
    }
    if (current) current.lines.push(line);
  });
  if (current) blocks.push(current);
  return blocks;
}

function stampBlock(block, version, date) {
  return block.lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed === 'Status: geplant') return line.replace('geplant', 'fix');
    if (trimmed === `Version: ${PLACEHOLDER}`) return line.replace(PLACEHOLDER, version);
    if (trimmed === `Datum: ${PLACEHOLDER}`) return line.replace(PLACEHOLDER, date);
    return line;
  });
}

export function planMoves({ openText, checkpointText, version, date }) {
  const openLines = openText.split('\n');
  const moving = collectTopBlocks(openLines).filter((block) => block.done);
  if (moving.length === 0) return { openText, checkpointText };
  const nextOpen = removeBlocks(openLines, moving);
  const stamped = moving.map((block) => stampBlock(block, version, date).join('\n'));
  return { openText: nextOpen, checkpointText: insertIntoCheckpoints(checkpointText, stamped, version) };
}

function removeBlocks(openLines, moving) {
  const movingLines = new Set();
  for (const block of moving) {
    for (let index = block.start; index < block.start + block.lines.length; index += 1) movingLines.add(index);
  }
  return openLines
    .filter((_, index) => !movingLines.has(index))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n+$/, '\n');
}

function insertIntoCheckpoints(checkpointText, blocks, version) {
  const lines = checkpointText.split('\n');
  const header = `## ${version}`;
  // Eine Section kann einen Zusatz tragen ("0.0.23 — Vertikalitaet"); beide
  // Fassungen gehoeren zur selben Version, damit keine Doppeltitel entstehen.
  const headerIndex = lines.findIndex((line) => line === header || line.startsWith(`${header} `));
  if (headerIndex !== -1) {
    let end = headerIndex + 1;
    while (end < lines.length && !lines[end].startsWith('## ')) end += 1;
    return [...lines.slice(0, end), ...blocks, '', ...lines.slice(end)].join('\n');
  }
  let first = lines.findIndex((line) => /^## \d/.test(line));
  if (first === -1) first = lines.length;
  return [...lines.slice(0, first), header, '', ...blocks, '', ...lines.slice(first)].join('\n');
}
