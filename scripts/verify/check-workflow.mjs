/** Der Versions-Bot muss die Commit-Policy selbst erfüllen, die er sonst bricht. */
import { readFileSync } from 'node:fs';
import { check, section } from './expect.mjs';
import {
  DOC_FILES,
  MIRRORS,
  REQUIRED_LABEL,
  buildBumpMessage,
  commitViolations,
} from '../lib/commit-rules.mjs';

const WORKFLOW = '.github/workflows/auto-bump.yml';
const CI = '.github/workflows/ci.yml';
const GENERATOR = 'node scripts/commit-draft.mjs --bump';

function stepText(text, name) {
  const rest = text.split(`- name: ${name}`)[1] ?? '';
  const end = rest.indexOf('\n      - name:');
  return end === -1 ? rest : rest.slice(0, end);
}

export function checkWorkflow() {
  const text = readFileSync(WORKFLOW, 'utf8');
  const preflight = text.indexOf('- name: Pre-Flight');
  const bump = text.indexOf('- name: Bump version, stamp docs');
  const commit = stepText(text, 'Commit bump');
  const message = buildBumpMessage({ version: '0.0.0', docs: DOC_FILES, code: ['src/domain/world/grid.js'] });
  const issues = commitViolations({
    sha: 'bot',
    message,
    paths: [...MIRRORS, ...DOC_FILES, 'src/domain/world/grid.js'],
  });
  const missing = [...MIRRORS, ...DOC_FILES].filter((file) => !commit.includes(file));
  section('Versions-Bot');
  check('Der Pre-Flight laeuft vor dem Bump', preflight !== -1 && bump !== -1 && preflight < bump, `${preflight} vor ${bump}`);
  check('Die Bump-Stufe faehrt den Doku-Sync', /npm run docs:sync sync/.test(text), 'npm run docs:sync sync');
  check('Der Commit kommt aus dem Draft-Generator', commit.includes(GENERATOR), GENERATOR);
  check('Der Commit nimmt Spiegel- und Doku-Dateien auf', missing.length === 0, missing.join(', '));
  check('Die generierte Message traegt das Label am Ende', message.trimEnd().endsWith(REQUIRED_LABEL), 'Label-Stelle');
  check('Die generierte Message erfuellt die Commit-Policy', issues.length === 0, issues.map((i) => `${i.rule}: ${i.detail}`).join('; '));
  section('CI-Volllast');
  const ci = readFileSync(CI, 'utf8');
  const checkText = readFileSync('scripts/check.mjs', 'utf8');
  check('Der CI-Volllauf verlangt die volle Last', /DL_LAST:\s*['"]?voll/.test(ci) && /npm run verify/.test(ci), 'DL_LAST: voll');
  check('Die lokale Last ist gedeckelt, nicht die der CI', /args\.includes\('--voll'\)/.test(checkText), '--voll');
  check('Der Deckel trifft nur die Standardauswahl, keine benannte Gruppe',
    /stop: \(\) => named\.length === 0 && !voll/.test(checkText), 'named.length === 0');
}
