/** Der Slice gegen einen eingefrorenen Zustands-Hash je Zug. Weicht ein Zug
 *  ab, nennt der Befund die Nummer, die Aktion und beide Hashes — ein stiller
 *  Logikdrift faellt so an seiner Stelle auf, nicht als Enddifferenz. Der Wert
 *  nennt im Kopf die Node-Major, auf der er entstanden ist: eine andere
 *  Laufzeit sieht nicht denselben Slice und darf ihn nicht vergleichen. */
import { readFileSync } from 'node:fs';
import { ACTION } from '../../src/domain/actions/action-types.js';
import { SAMPLE_SEEDS } from './floor-sample.js';
import { determinismRun } from './determinism-run.mjs';
import { abweichung, ciNodeMajor, nodeMajor } from '../lib/node-laufzeit.mjs';
import { contourEntries } from './contour-digest.mjs';
import { check, section } from './expect.mjs';

const GOLDEN = 'scripts/verify/determinism-golden.json';
const ZEILE = 80;
const BREITE = 8;

function wohlgeformt(zeilen) {
  if (!Array.isArray(zeilen) || zeilen.length === 0) return false;
  const voll = zeilen.slice(0, -1).every((line) => line.length === ZEILE);
  const rest = zeilen.at(-1).length;
  return voll && rest > 0 && rest <= ZEILE && zeilen.join('').length % BREITE === 0;
}

function seedsAus(golden) {
  return typeof golden?.seeds === 'object' && golden.seeds !== null ? golden.seeds : {};
}

function pruefeLaufzeit(golden) {
  const gepinnt = ciNodeMajor();
  const mangel = abweichung({ gepinnt, gelaufen: nodeMajor() });
  check(
    'Der Golden-Wert nennt die Node-Major der CI',
    golden?.nodeMajor === gepinnt,
    `im Wert ${golden?.nodeMajor ?? 'keine Angabe'}, gepinnt ${gepinnt ?? 'keine Angabe'}`,
  );
  check('Diese Laufzeit ist die gepinnte', mangel === null, mangel ?? `Node ${nodeMajor()}`);
}

function ersteAbweichung(soll, ist) {
  const schritte = Math.min(soll.length, ist.length) / BREITE;
  for (let index = 0; index < schritte; index += 1) {
    if (soll.slice(index * BREITE, (index + 1) * BREITE) !== ist.slice(index * BREITE, (index + 1) * BREITE)) return index;
  }
  return soll.length === ist.length ? -1 : schritte;
}

function befund({ lauf, soll, ist, ab }) {
  const schritte = ist.length / BREITE;
  if (ab === -1) return `${schritte} Zuege`;
  const fenster = (text) => text.slice(ab * BREITE, (ab + 1) * BREITE) || '—';
  return `Zug ${ab + 1} von ${schritte} (${lauf.types[ab] ?? 'kein Zug'}) — erwartet ${fenster(soll)}, gelesen ${fenster(ist)}`;
}

function konturAbweichung(soll, ist) {
  for (const hash of Object.keys(ist)) {
    const erwartet = soll[hash];
    if (!erwartet) return { hash, phase: 0, soll: 'unbekannt', ist: 'neu' };
    for (let phase = 0; phase < ist[hash].length; phase += 1) {
      if (erwartet[phase] !== ist[hash][phase]) return { hash, phase, soll: erwartet[phase], ist: ist[hash][phase] };
    }
  }
  const fehlt = Object.keys(soll).find((hash) => !(hash in ist));
  return fehlt ? { hash: fehlt, phase: 0, soll: 'vorhanden', ist: 'fehlt' } : null;
}

function konturBefund(ab, anzahl) {
  if (ab === null) return `${anzahl} Genome`;
  return `Genom ${ab.hash}, Phase ${ab.phase} — erwartet ${ab.soll}, gelesen ${ab.ist}`;
}

function checkContours(golden, laeufe) {
  const werte = typeof golden.contours === 'object' && golden.contours !== null ? golden.contours : {};
  const fehlend = laeufe.map((lauf) => String(lauf.seed)).filter((seed) => !werte[seed]);
  check('Der Golden-Wert traegt je Seed einen Kontur-Abschnitt', fehlend.length === 0, fehlend.join(', '));
  for (const lauf of laeufe) {
    const ist = contourEntries(lauf.genomes);
    const ab = konturAbweichung(werte[String(lauf.seed)] ?? {}, ist);
    check(`Seed ${lauf.seed} trifft die Konturen aller vier Atemphasen`, ab === null && Object.keys(ist).length > 0, konturBefund(ab, Object.keys(ist).length));
  }
}

function pruefeForm(seeds, gemessen) {
  const fremd = Object.keys(gemessen).filter((key) => !seeds.includes(key));
  const fehlend = seeds.filter((seed) => !(seed in gemessen));
  check('Der Golden-Wert kennt genau die Sample-Seeds', fremd.length === 0 && fehlend.length === 0, [...fremd, ...fehlend.map((key) => `${key} fehlt`)].join(', '));
  check('Der Golden-Wert ist wohlgeformt', seeds.every((seed) => wohlgeformt(gemessen[seed])), seeds.filter((seed) => !wohlgeformt(gemessen[seed])).join(', '));
}

export function checkDeterminism() {
  section('Determinismus: ein Zustands-Hash je Zug gegen den Golden-Wert');
  const golden = JSON.parse(readFileSync(GOLDEN, 'utf8'));
  const seeds = SAMPLE_SEEDS.map(String);
  const gemessen = seedsAus(golden);
  pruefeLaufzeit(golden);
  pruefeForm(seeds, gemessen);

  const laeufe = seeds.map((seed) => determinismRun(seed));
  for (const lauf of laeufe) {
    const schluessel = String(lauf.seed);
    const soll = (gemessen[schluessel] ?? []).join('');
    const ist = lauf.ticks.join('');
    const ab = ersteAbweichung(soll, ist);
    check(`Seed ${schluessel} trifft den Golden-Wert`, ab === -1 && soll.length === ist.length, befund({ lauf, soll, ist, ab }));
  }

  const gefeuert = new Set(laeufe.flatMap((lauf) => lauf.types));
  const ungenutzt = Object.values(ACTION).filter((type) => !gefeuert.has(type));
  check('Der Durchlauf feuert jede Aktion der Kette', ungenutzt.length === 0, ungenutzt.join(', '));
  const luegen = laeufe.flatMap((lauf) => lauf.kalteTreffer.map((index) => `${String(lauf.seed)}:${index}`));
  check('Der Hash-Cache luegt nicht', luegen.length === 0, luegen.join(', '));
  const folgen = new Set(laeufe.map((lauf) => lauf.ticks[0]));
  check('Verschiedene Seeds ergeben verschiedene Zustandsfolgen', folgen.size === laeufe.length, `${folgen.size} von ${laeufe.length} verschieden`);
  check('Nach dem Durchlauf arbeitet keine Wurzel mehr', laeufe.every((lauf) => lauf.state.world.rootingWorkIds.length === 0));
  checkContours(golden, laeufe);
}