import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { check, section } from './expect.mjs';

function collect(dir, extensions, found = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) collect(path, extensions, found);
    else if (extensions.some((ext) => path.endsWith(ext))) found.push(path);
  }
  return found;
}

function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

function sourceText(files) {
  return files.map((path) => readFileSync(path, 'utf8')).join('\n');
}

/** Ein check-Modul, das nirgends importiert wird, prüft nichts. */
function orphanChecks() {
  const modules = collect('scripts/verify', ['.mjs']).map((path) => path.split('/').pop());
  const referenced = collect('scripts', ['.mjs'])
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
  return modules.filter((name) => !referenced.includes(`/${name}'`));
}

export function checkArchitecture() {
  const domain = sourceText(collect('src/domain', ['.js']));
  const code = stripComments(sourceText(collect('src', ['.js', '.jsx'])));
  const waisen = orphanChecks();
  section('Architekturgrenzen');
  check('Domäne importiert weder React noch DOM', !/from ['"]react|document\.|window\./.test(domain));
  check('Keine Zufalls- oder Systemzeit-Spielwahrheit', !/Math\.random\s*\(|Date\.now\s*\(/.test(code));
  check('Domäne rendert kein SVG-Markup', !/<(svg|path|circle|g[ >])/.test(domain));
  check('Jedes Prüfmodul ist verdrahtet', waisen.length === 0, waisen.join(', '));
}
