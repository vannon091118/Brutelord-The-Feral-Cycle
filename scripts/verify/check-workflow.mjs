/** Der Versions-Bot muss die Commit-Policy selbst erfüllen, die er sonst bricht. */
import { readFileSync } from 'node:fs';
import { check, section } from './expect.mjs';
import { REQUIRED_LABEL } from '../lib/commit-rules.mjs';

const MIRRORS = ['VERSION', 'version.lock.json', 'package.json', 'package-lock.json'];
const MIN_WORDS = 100;

function commitStep() {
  const text = readFileSync('.github/workflows/auto-bump.yml', 'utf8');
  const rest = text.split('- name: Commit bump')[1] ?? '';
  const end = rest.indexOf('\n      - name:');
  return end === -1 ? rest : rest.slice(0, end);
}

function spokenLines(step) {
  const echoes = [...step.matchAll(/echo "([^"]*)"/g)].map((match) => match[1]);
  const intro = step.split('INTRO="')[1]?.split('"')[0] ?? '';
  return echoes.map((line) => (line === '$INTRO' ? intro : line));
}

function wordCount(lines) {
  return lines.reduce((sum, line) => sum + (line.match(/[\p{L}\p{N}]+/gu) ?? []).length, 0);
}

export function checkWorkflow() {
  const step = commitStep();
  const lines = spokenLines(step);
  const label = lines.filter((line) => line.includes(REQUIRED_LABEL));
  const mirrors = step.split('MIRRORS="')[1]?.split('"')[0] ?? '';
  const words = wordCount(lines.filter((line) => line !== REQUIRED_LABEL).flatMap((line) => (line.includes('$f') ? [line, line, line, line] : [line])));
  section('Versions-Bot');
  check('Das VANNON-Label steht allein in einer Zeile', label.length === 1 && label[0] === REQUIRED_LABEL, `${label.length} Zeilen`);
  check('Der Body nennt die vier Spiegeldateien', MIRRORS.every((name) => mirrors.includes(name)), mirrors);
  check('Der kuerzeste Body hat genug Woerter', words >= MIN_WORDS, `${words} von ${MIN_WORDS}`);
}
