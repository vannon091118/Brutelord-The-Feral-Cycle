#!/usr/bin/env node
/** Der Draft-Generator: Bot-Bump-Nachricht bauen, Gestagtes vorprüfen. */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import {
  DOC_FILES,
  buildBumpMessage,
  buildDraftMessage,
  commitViolations,
} from './lib/commit-rules.mjs';

function staged() {
  const out = execFileSync('git', ['diff', '--cached', '--name-only'], { encoding: 'utf8' });
  return out.split('\n').filter(Boolean);
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--bump') {
    const version = readFileSync('VERSION', 'utf8').trim();
    const docs = args.slice(1).length > 0 ? args.slice(1) : DOC_FILES;
    const code = execFileSync('git', ['diff', '--name-only', 'HEAD~1', 'HEAD'], { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    process.stdout.write(buildBumpMessage({ version, docs, code }));
    return;
  }
  const paths = staged();
  const message = buildDraftMessage({ subject: args[0] ?? '', paragraphs: args.slice(1), paths });
  const issues = commitViolations({ sha: 'draft', message, paths });
  if (issues.length === 0) {
    process.stdout.write(message);
    return;
  }
  console.error(`Draft-Generator: ${issues.length} Verstoß/Verstöße — nichts schreiben.`);
  for (const issue of issues) console.error(`  ${issue.rule} — ${issue.detail}`);
  process.exitCode = 1;
}

main();
