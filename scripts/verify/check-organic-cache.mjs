/** Der Konturen-Cache: diskrete Schluessel, stabile Objekte, kein Wachstum pro Frame. */
import { createGenome } from '../../src/domain/brutelord/genome-roll.js';
import { phaseOf } from '../../src/domain/brutelord/organic-bones.js';
import { ORGANIC_CONFIG } from '../../src/domain/brutelord/genome-config.js';
import { cacheKeys, clearFrames, frameCount, frameKey, organicFrame } from '../../src/domain/brutelord/organic-cache.js';
import { check, section } from './expect.mjs';

const ORG = ORGANIC_CONFIG;
const GENOMES = Array.from({ length: 3 }, (unused, index) => createGenome(index * 7919 + 3));
const FRAMES = 2008;

/** Die Gegenprobe: derselbe Lauf mit dem rohen Takt als Schluessel. */
function naiveKeys() {
  const map = new Map();
  for (let tick = 0; tick < FRAMES; tick += 1) map.set(`g${tick % GENOMES.length}_f${tick}`, tick);
  return map.size;
}

/** Ein Lauf ueber viele Frames, wie ihn die Schleife des Bildschirms faehrt. */
function drive(frames) {
  const seen = [];
  for (let tick = 0; tick < frames; tick += 1) seen.push(organicFrame(GENOMES[tick % GENOMES.length], tick));
  return seen;
}

function checkDiscrete() {
  section('Cache: der Schluessel ist diskret');
  clearFrames();
  const seen = drive(FRAMES);
  const keys = cacheKeys();
  const expected = GENOMES.length * ORG.phaseCount;
  check('Jeder Schluessel endet auf ein ganzzahliges _f0 bis _f3', keys.every((key) => /_f[0-3]$/.test(key)), `${keys.length} Schluessel`);
  check('Kein Schluessel traegt einen Takt ueber drei', keys.every((key) => Number(key.split('_f')[1]) < ORG.phaseCount));
  check('Alle vier Phasen sind vertreten', new Set(keys.map((key) => key.slice(-2))).size === ORG.phaseCount);
  check(`${GENOMES.length} Genome mal ${ORG.phaseCount} Phasen ergeben ${expected} Objekte`, frameCount() === expected, `${frameCount()} statt ${expected}`);
  check(`${FRAMES} Frames liefern nur ${expected} verschiedene Objekte`, new Set(seen).size === expected, `${new Set(seen).size}`);
  check('Ein roher Takt als Schluessel waechst mit jedem Frame', naiveKeys() === FRAMES, `${naiveKeys()} Eintraege bei ${FRAMES} Frames`);
}

function checkIdentity() {
  section('Cache: dieselbe Identitaet ueber die Frames');
  clearFrames();
  const seen = Array.from({ length: 100 }, (unused, tick) => organicFrame(GENOMES[0], tick));
  check('Hundert Frames liefern genau vier Objekte', new Set(seen).size === ORG.phaseCount, `${new Set(seen).size}`);
  check('Der fuenfte Frame ist dasselbe Objekt wie der erste', seen[4] === seen[0]);
  check('Der neunte Frame teilt sich die Ringe mit dem ersten', seen[8].rings === seen[0].rings);
  check('Verschiedene Genome ergeben verschiedene Objekte', organicFrame(GENOMES[0], 0) !== organicFrame(GENOMES[1], 0));
  drive(FRAMES);
  const warm = frameCount();
  drive(FRAMES);
  organicFrame(GENOMES[0], 13);
  check('Weitere Jahre Frames wachsen den warmen Cache nicht', frameCount() === warm, `${frameCount()} gegen ${warm}`);
}

function checkFollowsPhase() {
  section('Cache: der Schluessel folgt der Phase');
  clearFrames();
  const genome = GENOMES[1];
  const keys = Array.from({ length: 16 }, (unused, tick) => frameKey(organicFrame(genome, tick).phenotype, phaseOf(tick)));
  const frame = organicFrame(genome, 7);
  check('Jeder der sechzehn Takte bildet auf seinen Schluessel ab', keys.every((key) => cacheKeys().includes(key)), keys.slice(0, 4).join(', '));
  check('Der Schluessel traegt die Phase, nie den Takt', keys.every((key, tick) => key.endsWith(`_f${phaseOf(tick)}`)));
  check('Sechzehn Takte belegen nur vier Schluessel', cacheKeys().length === ORG.phaseCount, `${cacheKeys().length}`);
  check('Die Phase ist eine ganze Zahl von 0 bis 3', Number.isInteger(frame.phase) && frame.phase === phaseOf(7), `${frame.phase}`);
  check('frameKey baut genau denselben Schluessel', frameKey(frame.phenotype, 3) === `${frame.phenotype.hash.toString(36)}_f3`);
  check('Ein negativer Takt landet in derselben Phase', organicFrame(genome, -1) === organicFrame(genome, ORG.phaseCount - 1));
}

export function checkOrganicCache() {
  checkDiscrete();
  checkIdentity();
  checkFollowsPhase();
}
