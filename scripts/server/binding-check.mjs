#!/usr/bin/env node
/** npm run deploy:guard — vor dem Ausliefern die Bindung lesen und den
 *  Platzhalter abweisen. Der Fehlpfad ist der Grund fuer dieses Werkzeug: wer
 *  mit dem Null-Platzhalter ausliefert, merkt es erst beim ersten Schreibzugriff.
 *  Die Kennung selbst kommt aus der Deploy-Umgebung und steht nicht im Code. */
import { readFileSync } from 'node:fs';
import { databaseIdProblems } from './binding-config.mjs';

const text = readFileSync('wrangler.jsonc', 'utf8');
const treffer = text.match(/"database_id"\s*:\s*"([^"]*)"/);
const problems = databaseIdProblems(treffer?.[1] ?? '');
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('D1-Bindung: die Kennung ist gesetzt.');
