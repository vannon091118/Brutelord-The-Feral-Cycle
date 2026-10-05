#!/usr/bin/env node
/** Offline regression tests for the commit-gate policy. */
import {
  REQUIRED_LABEL,
  buildDraftMessage,
  commitViolations,
  stripForeignFooters,
} from './lib/commit-rules.mjs';
import { hasRef } from './ci-gate.mjs';

const paths = ['src/domain/world/grid.js', 'src/ui/GameStage.jsx'];
const explanation = [
  ...paths,
  ...Array.from({ length: 10 }, (_, index) =>
    `Change ${index + 1} explains why the named source file changed and what behavior it provides.`,
  ),
].join('\n');
const makeEntry = (message) => ({ sha: 'fixture', message, paths });
const valid = `feat: explain the current game changes\n\n${explanation}\n\n${REQUIRED_LABEL}`;
const validViolations = commitViolations(makeEntry(valid));
const trailerViolations = commitViolations(makeEntry(`${valid}\nCo-Authored-By: Bot <bot@example.com>`));
const wrongLabel = commitViolations(makeEntry(`${explanation}\nGenerated with Codebuff`));
const genericTrailer = commitViolations(makeEntry(`${valid}\nReviewed-by: Vannon`));
const repeatedLabel = commitViolations(makeEntry(`${explanation}\n${REQUIRED_LABEL}\n${REQUIRED_LABEL}`));
const missingScope = commitViolations({
  ...makeEntry(`feat: game change\n\n${explanation}\n\n${REQUIRED_LABEL}`),
  paths: [...paths, 'src/state/game-reducer.js'],
});
const tooShort = commitViolations(makeEntry(`feat: short\n\nToo brief.\n\n${REQUIRED_LABEL}`));

const foreignTail = `${valid}\nCo-Authored-By: Bot <bot@example.com>\nGenerated with Freebuff 🤖\nFremd-Footer: geladen`;
const stripped = stripForeignFooters(foreignTail);
const strippedValid = commitViolations(makeEntry(stripped));
const draft = buildDraftMessage({
  subject: 'feat: draft regression fixture',
  paragraphs: [
    ...paths.map((path) => `Die Datei ${path} erklaert dieser Absatz mit Genauigkeit.`),
    ...Array.from({ length: 8 }, (_, index) =>
      `Absatz ${index + 1} erklaert, warum die Aenderung noetig war und welches Verhalten sie dem Spieler bringt.`,
    ),
  ],
  paths,
});
const draftViolations = commitViolations(makeEntry(draft));
const draftStripped = stripForeignFooters(`${draft}\nReviewed-by: Niemand`);

const checks = [
  ['100–1000 Wörter und korrektes Label bestehen', validViolations.length === 0],
  ['Co-Authored Trailer wird abgewiesen', trailerViolations.some((item) => item.rule.includes('Footer/Trailer'))],
  ['Generated-Footer und falsches Label werden abgewiesen', wrongLabel.length > 0],
  ['Generischer Trailer wird abgewiesen', genericTrailer.some((item) => item.rule.includes('Footer/Trailer'))],
  ['VANNON-Label ist genau einmal die letzte Zeile', repeatedLabel.some((item) => item.rule.includes('VANNON-Label'))],
  ['Nicht erklärte Dateien werden abgewiesen', missingScope.some((item) => item.rule.includes('Datei erklären'))],
  ['Zu kurzer Body wird abgewiesen', tooShort.some((item) => item.rule.includes('100–1000'))],
  ['HEAD gilt als vorhandene Referenz', hasRef('HEAD')],
  ['Ein erfundener SHA gilt nicht als vorhanden', !hasRef('deadbeefdeadbeefdeadbeefdeadbeefdeadbeef')],
  ['Unsinn gilt nicht als vorhanden', !hasRef('kaputt')],
  ['Der Stripper entfernt Co-Authored und Bot-Signaturen', !stripped.includes('Co-Authored') && !stripped.includes('Freebuff')],
  ['Der Stripper entfernt Key-value-Trailer', !stripped.includes('Fremd-Footer')],
  ['Nach dem Stripper ist die Message regelkonform', strippedValid.length === 0, strippedValid.map((i) => i.rule).join('; ')],
  ['Der Label-Stripper trennt das VANNON-Label nicht ab', stripped.includes(REQUIRED_LABEL)],
  ['Der Draft-Generator liefert eine policy-feste Message', draftViolations.length === 0, draftViolations.map((i) => i.rule).join('; ')],
  ['Der Draft-Generator stellt das Label ans Ende', draft.trimEnd().endsWith(REQUIRED_LABEL)],
  ['Der Draft-Generator entfernt fremde Footer', !draftStripped.includes('Reviewed-by')],
];

for (const [label, passed] of checks) console.log(`${passed ? '  ok  ' : ' FAIL '} ${label}`);
const failures = checks.filter(([, passed]) => !passed).length;
console.log(failures ? `\n${failures} Gate-Test(s) fehlgeschlagen.` : `\nAlle ${checks.length} Gate-Tests bestanden.`);
process.exitCode = failures ? 1 : 0;
