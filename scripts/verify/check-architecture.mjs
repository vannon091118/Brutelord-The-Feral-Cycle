/** Die Architekturgrenzen: Domäne ohne React/DOM/SVG, keine Zufalls- oder
 *  Systemzeit-Spielwahrheit, kein verwaistes Prüfmodul. Die Importrichtungen
 *  stehen in check-imports.mjs — eine Regel, ein Ort. */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { RARITY_ORDER, STONE_DEFS } from '../../src/domain/brutelord/stone-config.js';
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

const PALETTE = 'src/styles/palette.css';

function paletteSteps() {
  const text = readFileSync(PALETTE, 'utf8');
  return new Set([...text.matchAll(/--color-([a-z0-9-]+)\s*:/g)].map((match) => match[1]));
}

function toneSteps(tone) {
  return [...String(tone).matchAll(/(?:border|text)-([a-z]+-\d+)/g)].map((match) => match[1]);
}

function checkStoneTones() {
  const steps = paletteSteps();
  const tones = RARITY_ORDER.map((rarity) => STONE_DEFS[rarity]?.tone);
  check('Jede Seltenheit traegt eine Anzeige-Rolle', tones.every((tone) => typeof tone === 'string' && tone.startsWith('border-') && tone.includes('text-')), tones.join(' | '));
  const fremd = [...new Set(tones.flatMap(toneSteps))].filter((step) => !steps.has(step));
  check('Jede Rolle nennt einen Schritt der Palette', fremd.length === 0, fremd.join(', '));
  check('Die vier Seltenheiten sind vier Toene', new Set(tones).size === tones.length, tones.join(' | '));
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
  section('Architekturgrenzen: die Anzeige-Rollen der Seltenheiten');
  checkStoneTones();
}
