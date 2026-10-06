/** Commit-message policy: explained changes, no generated signatures. */
import { execFileSync } from 'node:child_process';

export const COMMIT_LIMITS = { subjectLength: 72, bodyMinWords: 100, bodyMaxWords: 1000 };
export const REQUIRED_LABEL =
  'created by VANNON Volatile Agent Needing No Other Nonsense — Never Overly Nice, Never Average Vibe.';
export const MIRRORS = ['VERSION', 'version.lock.json', 'package.json', 'package-lock.json'];
export const DOC_FILES = ['Docs/ROADMAP_OPEN.md', 'Docs/CHECKPOINTS.md'];
export const SHOTS_PREFIX = 'Docs/shots/';
// Kennzeichnet die Zeilen, die ein Generator schreibt und die kein Mensch liest.
export const MACHINE_PREFIX = 'Geaendert wurden';

const FORBIDDEN = [
  { id: 'co-authored-by', pattern: /^\s*co-authored-by\s*:/im },
  { id: 'signed-off-by', pattern: /^\s*signed-off-by\s*:/im },
  { id: 'reviewed-by', pattern: /^\s*(reviewed|tested|acked|approved)-by\s*:/im },
  { id: 'generated-with', pattern: /generated\s+with/i },
  { id: 'generated-by', pattern: /generated\s+by/i },
  { id: 'co-authored', pattern: /co-authored/i },
  { id: 'bot-signature', pattern: /\b(codebuff|copilot|claude|cursor)\s*(🤖|bot)?\s*$/im },
  { id: 'footer-separator', pattern: /^\s*(-{3,}|_{3,}|={3,})\s*$/m },
  { id: 'generic-trailer', pattern: /^[A-Za-z][A-Za-z0-9-]*:\s+\S.*$/m },
];

export function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

export function listCommits(range) {
  return range ? git(['rev-list', '--no-merges', range]).split('\n').filter(Boolean) : [];
}

export function commitMessage(sha) {
  return execFileSync('git', ['log', '-1', '--format=%B', sha], { encoding: 'utf8' });
}

export function changedFiles(sha) {
  const result = execFileSync('git', ['diff-tree', '--no-commit-id', '--name-only', '-r', sha], { encoding: 'utf8' });
  return result.trim() ? result.trim().split('\n') : [];
}

export function messageParts(message) {
  const lines = message.replace(/\r/g, '').split('\n');
  return { subject: lines[0] ?? '', body: lines.slice(1).join('\n').trim(), lines };
}

function wordCount(text) {
  return (text.match(/[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu) ?? []).length;
}

function bodyLines(body) {
  return body.split('\n').map((line) => line.trim()).filter(Boolean);
}

function labelViolations(body) {
  const lines = bodyLines(body);
  const occurrences = body.split(REQUIRED_LABEL).length - 1;
  if (lines.at(-1) !== REQUIRED_LABEL || occurrences !== 1) {
    return [{ rule: 'VANNON-Label am Body-Ende', detail: `genau eine letzte Zeile muss ${REQUIRED_LABEL} sein` }];
  }
  return [];
}

function wordViolations(body) {
  // Gezählt wird die eigene Prosa, nicht das Pflicht-Label und die Generatorliste (GOVERNANCE).
  const prose = bodyLines(body)
    .filter((line) => line !== REQUIRED_LABEL && !line.startsWith(MACHINE_PREFIX))
    .join(' ');
  const words = wordCount(prose);
  if (words >= COMMIT_LIMITS.bodyMinWords && words <= COMMIT_LIMITS.bodyMaxWords) return [];
  return [{
    rule: `erklärender Body mit ${COMMIT_LIMITS.bodyMinWords}–${COMMIT_LIMITS.bodyMaxWords} Wörtern`,
    detail: `${words} Wörter (ohne Pflicht-Label und ohne die maschinelle Dateiliste)`,
  }];
}

// Bilder aus Docs/shots/ entstehen bei jeder Abnahme und gehoeren nie allein in einen Commit.
function generatedOnlyViolations(paths) {
  const normalized = paths.map((path) => path.replace(/\\/g, '/'));
  if (normalized.length === 0 || !normalized.every((path) => path.startsWith(SHOTS_PREFIX))) return [];
  return [{
    rule: 'kein Commit allein aus generierten Bildern',
    detail: `${normalized.length} Datei(en) unter ${SHOTS_PREFIX} und sonst nichts — die Bilder werden bei jedem verify neu erzeugt`,
  }];
}

function changedPathViolations(body, paths) {
  const text = body.replace(/\\/g, '/').toLowerCase();
  return paths
    .map((path) => path.replace(/\\/g, '/'))
    .filter((path) => !text.includes(path.toLowerCase()))
    .map((path) => ({ rule: 'jede geänderte Datei erklären', detail: `${path} fehlt im Commit-Body` }));
}

export function commitViolations(entry) {
  const { subject, body } = messageParts(entry.message);
  const issues = [];
  if (!subject.trim()) issues.push({ rule: 'Betreff vorhanden', detail: 'leerer Betreff' });
  if (subject.length > COMMIT_LIMITS.subjectLength) {
    issues.push({ rule: `Betreff höchstens ${COMMIT_LIMITS.subjectLength} Zeichen`, detail: `${subject.length} Zeichen` });
  }
  issues.push(
    ...wordViolations(body),
    ...labelViolations(body),
    ...generatedOnlyViolations(entry.paths),
    ...changedPathViolations(body, entry.paths),
  );
  for (const rule of FORBIDDEN) {
    const scannedText = rule.id === 'generic-trailer' ? body : entry.message;
    if (rule.pattern.test(scannedText)) {
      issues.push({ rule: `kein Footer/Trailer (${rule.id})`, detail: 'Signatur oder Trailer entfernen' });
    }
  }
  return issues.map((issue) => ({ ...issue, scope: entry.sha }));
}

function isForeign(line) {
  return FORBIDDEN.some((rule) => rule.pattern.test(line));
}

export function stripForeignFooters(message) {
  // Zeile null ist der Betreff: konventionelle Subjects wären sonst eigene Opfer.
  const kept = message
    .replace(/\r/g, '')
    .split('\n')
    .filter((line, index) => index === 0 || !isForeign(line));
  return `${kept.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
}

export function buildDraftMessage({ subject, paragraphs, paths }) {
  const prose = paragraphs.map((text) => text.trim()).filter(Boolean);
  const files = paths.length > 0 ? `Geaendert wurden diese Dateien: ${paths.join(', ')}.` : '';
  return stripForeignFooters([subject, '', ...prose, '', files, '', REQUIRED_LABEL, ''].join('\n'));
}

export function buildBumpMessage({ version, docs, code }) {
  const intro = [
    `Diese automatische Erhoehung hebt die Patchstufe auf ${version}, weil der Aenderungsbereich Code unter src/ oder scripts/ beruehrt.`,
    'Sie entsteht aus dem Versionierer und dem Doku-Sync, nicht von Hand, und sie folgt allein daraus, dass die Versionierung die tatsaechliche Funktionalitaet abbilden soll, nicht aus einer Bewertung einzelner Aenderungen.',
    'Der Versionsbot committet als github-actions[bot] und bleibt deshalb ohne Signatur, weil der persoenliche Schluessel nicht im GITHUB_TOKEN liegt; eine behauptete Identitaet waere nicht pruefbar.',
    'Vor dem Bump hat der Pre-Flight die Doku-Eintraege geprueft, danach hat der Doku-Sync die erledigten in die Checkpoints bewegt und dort gestempelt.',
  ].join(' ');
  return stripForeignFooters([
    `chore: Version ${version} — automatischer Bump`,
    '',
    intro,
    '',
    `Geaendert wurden die Spiegeldateien der Versionsautoritaet: ${MIRRORS.join(', ')}.`,
    '',
    `Der Doku-Sync hat die Dateien ${DOC_FILES.join(' und ')} geprueft, gestempelt und die erledigten Eintraege in die Checkpoints bewegt.`,
    '',
    `Geaendert wurden vom Bump die Code-Dateien des Commits davor: ${code.join(', ')}.`,
    '',
    REQUIRED_LABEL,
    '',
  ].join('\n'));
}
