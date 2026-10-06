#!/usr/bin/env node
/** Schreibt den Golden-Wert der Deterministizitaet neu: `determinismRun` je
 *  Sample-Seed, die Hash-Folge als Zeilen von zehn Bloecken. Ein neu
 *  geschriebener Golden-Wert ist eine Verhaltensaenderung und gehoert in den
 *  Commit-Body — der Pruefer selbst schreibt ihn nie. Seeds gehen als String
 *  hinein: "12345678" ist hex gelesen und nicht die Zahl 12345678. */
import { writeFileSync } from 'node:fs';
import { SAMPLE_SEEDS } from '../scripts/verify/floor-sample.js';
import { determinismRun } from '../scripts/verify/determinism-run.mjs';
import { abweichung, ciNodeMajor, nodeMajor } from '../scripts/lib/node-laufzeit.mjs';

const DATEI = 'scripts/verify/determinism-golden.json';
const ZEILE = 80;

function zeilen(ticks) {
  const text = ticks.join('');
  const zeilenweise = [];
  for (let index = 0; index < text.length; index += ZEILE) zeilenweise.push(text.slice(index, index + ZEILE));
  return zeilenweise;
}

function seeds() {
  const golden = {};
  for (const seed of SAMPLE_SEEDS.map(String)) {
    const lauf = determinismRun(seed);
    golden[seed] = zeilen(lauf.ticks);
    console.log(`${seed}: ${lauf.ticks.length} Zuege, ${new Set(lauf.types).size} Aktionen, Cache-Widersprueche ${lauf.kalteTreffer.length}`);
  }
  return golden;
}

function main() {
  const gepinnt = ciNodeMajor();
  const mangel = abweichung({ gepinnt, gelaufen: nodeMajor() });
  if (mangel) {
    console.error(`Golden-Wert nicht geschrieben: ${mangel}`);
    console.error('Ein zweiter Golden-Wert waere eine zweite Wahrheit. Auf der gepinnten Laufzeit neu erzeugen.');
    process.exitCode = 1;
    return;
  }
  writeFileSync(DATEI, `${JSON.stringify({ nodeMajor: gepinnt, seeds: seeds() }, null, 2)}\n`);
  console.log(`Geschrieben: ${DATEI} — Node ${gepinnt}, ${SAMPLE_SEEDS.length} Seeds`);
}

main();