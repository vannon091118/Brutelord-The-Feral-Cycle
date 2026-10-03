/** Commit-message policy: explained changes, no generated signatures. */
import { execFileSync } from 'node:child_process';

export const COMMIT_LIMITS = { subjectLength: 72, bodyMinWords: 100, bodyMaxWords: 1000 };
export const REQUIRED_LABEL = 'Vannon-(vannon091118)';

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
    return [{ rule: 'Vannon-Label am Body-Ende', detail: `genau eine letzte Zeile muss ${REQUIRED_LABEL} sein` }];
  }
  return [];
}

function wordViolations(body) {
  const explanation = bodyLines(body).slice(0, -1).join(' ');
  const words = wordCount(explanation);
  if (words >= COMMIT_LIMITS.bodyMinWords && words <= COMMIT_LIMITS.bodyMaxWords) return [];
  return [{
    rule: `erklärender Body mit ${COMMIT_LIMITS.bodyMinWords}–${COMMIT_LIMITS.bodyMaxWords} Wörtern`,
    detail: `${words} Wörter (ohne Pflicht-Label)`,
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
  issues.push(...wordViolations(body), ...labelViolations(body), ...changedPathViolations(body, entry.paths));
  for (const rule of FORBIDDEN) {
    const scannedText = rule.id === 'generic-trailer' ? body : entry.message;
    if (rule.pattern.test(scannedText)) {
      issues.push({ rule: `kein Footer/Trailer (${rule.id})`, detail: 'Signatur oder Trailer entfernen' });
    }
  }
  return issues.map((issue) => ({ ...issue, scope: entry.sha }));
}
