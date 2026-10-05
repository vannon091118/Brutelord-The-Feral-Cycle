/** Hard Caps als Textanalyse: Codezeilen, Kommentare, Funktionen, Parameter, Imports. */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const HARD_CAPS = {
  moduleLines: 300,
  commentLines: 5,
  functionLines: 30,
  parameters: 3,
  imports: 7,
};

export const SOURCE_EXTENSIONS = ['.js', '.jsx', '.mjs', '.css'];
export const DATA_EXTENSIONS = ['.json'];
export const DOCUMENTATION_EXTENSIONS = ['.md', '.markdown', '.txt'];

const FUNCTION_PATTERNS = [
  /(?:^|\n)[ \t]*(?:export[ \t]+)?(?:default[ \t]+)?(?:async[ \t]+)?function[ \t]+([A-Za-z_$][\w$]*)[ \t]*\(([^)]*)\)[ \t]*\{/g,
  /(?:^|\n)[ \t]*(?:export[ \t]+)?const[ \t]+([A-Za-z_$][\w$]*)[ \t]*=[ \t]*(?:async[ \t]*)?\(([^)]*)\)[ \t]*=>[ \t]*\{/g,
  /(?:^|\n)[ \t]*(?:export[ \t]+)?const[ \t]+([A-Za-z_$][\w$]*)[ \t]*=[ \t]*(?:async[ \t]*)?function[ \t]*\(([^)]*)\)[ \t]*\{/g,
  /(?:^|\n)[ \t]*(?:export[ \t]+)?const[ \t]+([A-Za-z_$][\w$]*)[ \t]*=[ \t]*[A-Za-z_$.]+\([ \t]*(?:async[ \t]*)?function[ \t]+([A-Za-z_$][\w$]*)[ \t]*\(([^)]*)\)[ \t]*\{/g,
  /(?:^|\n)[ \t]*(?:export[ \t]+)?const[ \t]+([A-Za-z_$][\w$]*)[ \t]*=[ \t]*[A-Za-z_$.]+\([ \t]*(?:async[ \t]*)?\(([^)]*)\)[ \t]*=>[ \t]*\{/g,
];

function nameOfMatch(match) {
  return match.length > 3 ? (match[2] ?? match[1]) : match[1];
}

function paramsOfMatch(match) {
  return match[match.length - 1];
}

export function stripNoise(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""');
}

export function collectSourceFiles(root, extensions = SOURCE_EXTENSIONS, found = []) {
  for (const entry of readdirSync(root)) {
    // Versteckte Ordner sind Maschinenzustand, kein Quelltext: ein .venv,
    // ein Browserprofil mit Erweiterungen, ein .git. Sie stehen in keiner
    // Dateiliste und trotzdem im Baum — der Scanner muss sie überspringen.
    if (entry.startsWith('.')) continue;
    const full = join(root, entry);
    if (statSync(full).isDirectory()) collectSourceFiles(full, extensions, found);
    else if (extensions.some((extension) => full.endsWith(extension))) found.push(full);
  }
  return found;
}

export function commentLineNumbers(code) {
  const numbers = [];
  let inBlock = false;
  code.split('\n').forEach((line, index) => {
    const trimmed = line.trim();
    if (inBlock) {
      numbers.push(index + 1);
      if (trimmed.includes('*/')) inBlock = false;
      return;
    }
    if (trimmed.startsWith('/*') || trimmed.startsWith('{/*')) {
      numbers.push(index + 1);
      if (!trimmed.includes('*/')) inBlock = true;
      return;
    }
    if (trimmed.startsWith('//')) numbers.push(index + 1);
  });
  return numbers;
}

export function codeLineCount(code) {
  const comments = new Set(commentLineNumbers(code));
  return code
    .split('\n')
    .filter((line, index) => line.trim() !== '' && !comments.has(index + 1)).length;
}

function countTopLevelParams(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  let depth = 0;
  let count = 1;
  for (const char of trimmed) {
    if ('([{'.includes(char)) depth += 1;
    else if (')]}'.includes(char)) depth -= 1;
    else if (char === ',' && depth === 0) count += 1;
  }
  return count;
}

function findBlockEnd(code, openingIndex) {
  let depth = 0;
  for (let index = openingIndex; index < code.length; index += 1) {
    if (code[index] === '{') depth += 1;
    else if (code[index] === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function lineOf(code, index) {
  return code.slice(0, index).split('\n').length;
}

export function parseFunctions(code) {
  const found = [];
  const noiseFree = stripNoise(code);
  for (const pattern of FUNCTION_PATTERNS) {
    pattern.lastIndex = 0;
    let match = pattern.exec(noiseFree);
    while (match) {
      const braceIndex = noiseFree.indexOf('{', match.index + match[0].length - 1);
      const endIndex = findBlockEnd(noiseFree, braceIndex);
      const startLine = lineOf(noiseFree, match.index);
      found.push({
        name: nameOfMatch(match),
        line: startLine,
        lines: endIndex > 0 ? lineOf(noiseFree, endIndex) - startLine + 1 : 0,
        params: countTopLevelParams(paramsOfMatch(match)),
      });
      match = pattern.exec(noiseFree);
    }
  }
  return found.sort((left, right) => left.line - right.line);
}

function moduleViolations(file, code, caps) {
  const lines = codeLineCount(code);
  if (lines <= caps.moduleLines) return [];
  return [{ file, rule: `max ${caps.moduleLines} Codezeilen pro Modul`, detail: `${lines} Codezeilen` }];
}

function commentViolations(file, code, caps) {
  const comments = commentLineNumbers(code);
  if (comments.length <= caps.commentLines) return [];
  return [
    {
      file,
      rule: `max ${caps.commentLines} Kommentarzeilen pro Datei`,
      detail: `${comments.length} Kommentarzeilen (Erklärung gehört nach Docs/)`,
    },
  ];
}

function importViolations(file, code, caps) {
  const count = (stripNoise(code).match(/^[ \t]*import[ \t]/gm) ?? []).length;
  if (count <= caps.imports) return [];
  return [{ file, rule: `max ${caps.imports} Imports pro Datei`, detail: `${count} Imports` }];
}

function functionViolations(file, code, caps) {
  if (file.endsWith('.css')) return [];
  const violations = [];
  for (const unit of parseFunctions(code)) {
    if (unit.lines > caps.functionLines) {
      violations.push({
        file,
        line: unit.line,
        rule: `max ${caps.functionLines} LOC pro Funktion`,
        detail: `${unit.name}(): ${unit.lines} Zeilen`,
      });
    }
    if (unit.params > caps.parameters) {
      violations.push({
        file,
        line: unit.line,
        rule: `max ${caps.parameters} Parameter pro Funktion`,
        detail: `${unit.name}(): ${unit.params} Parameter`,
      });
    }
  }
  return violations;
}

export function metricViolations(file, code, caps = HARD_CAPS) {
  if (file.endsWith('.css')) {
    return [...moduleViolations(file, code, caps), ...commentViolations(file, code, caps)];
  }
  return [
    ...moduleViolations(file, code, caps),
    ...commentViolations(file, code, caps),
    ...importViolations(file, code, caps),
    ...functionViolations(file, code, caps),
  ];
}

export function analyzeTree(root, caps = HARD_CAPS) {
  return collectSourceFiles(root).flatMap((file) =>
    metricViolations(file, readFileSync(file, 'utf8'), caps),
  );
}

function dataViolations(file, code, caps) {
  const lines = codeLineCount(code);
  if (lines <= caps.moduleLines) return [];
  return [{ file, rule: `max ${caps.moduleLines} Codezeilen pro Modul`, detail: `${lines} Codezeilen` }];
}

export function analyzeData(root, caps = HARD_CAPS) {
  return collectSourceFiles(root, DATA_EXTENSIONS).flatMap((file) =>
    dataViolations(file, readFileSync(file, 'utf8'), caps),
  );
}
