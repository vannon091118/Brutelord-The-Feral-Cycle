/** Die Messbank der Organik: Elemente je Mutant, Renderzeit von zwanzig
 *  Mutanten im 13x13-Fenster und die Frame-Identitaet im Weltbild. Die
 *  Frame-Konstruktion wird in Node gemessen, das Zeichnen im echten Browser,
 *  der dieselbe MutantSvg montiert, die WorkerLayer im Weltbild montiert. */
import { chromium } from 'playwright';
import { startServer, stopServer } from '../browser/server.mjs';
import { baseUrl } from '../browser/config.mjs';
import { createGenome } from '../../src/domain/brutelord/genome-roll.js';
import { clearFrames, organicFrame } from '../../src/domain/brutelord/organic-cache.js';

const BENCH = 'tools/measure/organic-bench.html';
const COUNT = 20;
const PHASES = [0, 1, 2, 3];
export const FRAME_BUDGET_MS = 16.7;

function watch(page) {
  const problems = [];
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(`console: ${message.text()}`);
  });
  return problems;
}

async function readBench(page) {
  await page.waitForFunction(() => Boolean(window.__bench), null, { timeout: 30000 });
  return {
    counts: await page.evaluate(() => window.__bench.counts()),
    mount: await page.evaluate(() => window.__bench.renderTime()),
    rerender: await page.evaluate(() => window.__bench.rerenderTime()),
    identity: await page.evaluate(() => window.__bench.identity()),
  };
}

/** Die Arbeit, die jeder Phasentakt ausloest: zwanzig Mutanten, vier Phasen. */
function domainCost() {
  const genomes = Array.from({ length: COUNT }, (unused, index) => createGenome(index * 7919 + 3));
  const frames = () => genomes.forEach((genome) => PHASES.forEach((phase) => organicFrame(genome, phase)));
  frames();
  clearFrames();
  const kalt = performance.now();
  frames();
  const cold = performance.now() - kalt;
  const warmLaeufe = 10;
  const warm = performance.now();
  for (let run = 0; run < warmLaeufe; run += 1) frames();
  return { cold, warm: (performance.now() - warm) / warmLaeufe, frames: COUNT * PHASES.length };
}

function writeCounts(log, counts) {
  const elements = counts.map((row) => row.elements);
  const mean = elements.reduce((sum, value) => sum + value, 0) / counts.length;
  log.write('Elemente je Mutant (Knochen + Gelenke + Ringe)\n');
  log.write(`  ${counts.length} Mutanten: min ${Math.min(...elements)}, max ${Math.max(...elements)}, Mittel ${mean.toFixed(1)} Elemente\n`);
  log.write(`  Beispiel Mutant 0: ${counts[0].bones} Knochen, ${counts[0].joints} Gelenke, ${counts[0].rings} Ringe\n`);
}

function writeDomain(log, cost) {
  log.write('\nFrame-Konstruktion in Node (Konturen aller vier Phasen)\n');
  log.write(`  kalt  ${cost.cold.toFixed(1)}ms fuer ${cost.frames} Frames — ${(cost.cold / cost.frames).toFixed(2)}ms je Frame\n`);
  log.write(`  warm  ${cost.warm.toFixed(2)}ms fuer ${cost.frames} Frames — ${(cost.warm / cost.frames).toFixed(3)}ms je Frame (Cache)\n`);
}

function line(log, { label, time }) {
  log.write(`  ${label}: Median ${time.median.toFixed(1)}ms (min ${time.min.toFixed(1)}, max ${time.max.toFixed(1)}, ${time.runs} Laeufe) = ${(time.median / COUNT).toFixed(2)}ms je Mutant, ${time.median <= FRAME_BUDGET_MS ? 'unter' : 'ueber'} ${FRAME_BUDGET_MS}ms\n`);
}

function writeTimes(log, mount, rerender) {
  log.write(`\nZeichnen im Browser (Vite-Dev), Fenster ${mount.window.toFixed(0)}px\n`);
  line(log, { label: 'Einmal aufbauen', time: mount });
  line(log, { label: 'Neuzeichnen   ', time: rerender });
}

function writeIdentity(log, identity) {
  const phases = [...new Set(identity.phaseCounts)];
  const distinct = [...new Set(identity.distinctCounts)];
  const stabil = identity.unstable === 0 && phases.length === 1 && phases[0] === 4 && distinct.length === 1 && distinct[0] === 4;
  log.write(`\nFrame-Identitaet im Weltbild: ${identity.samples} Proben ueber ${identity.units} Einheiten\n`);
  log.write(`  instabile Einheiten ${identity.unstable} — ${identity.unstable === 0 ? 'byte-gleich innerhalb der Phase' : 'wechselt innerhalb der Phase'}\n`);
  log.write(`  Phasen je Einheit ${phases.join('/')}, verschiedene Markup je Einheit ${distinct.join('/')}\n`);
  return stabil;
}

export async function benchOrganic({ log = process.stdout } = {}) {
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const problems = watch(page);
    await page.goto(`${baseUrl()}${BENCH}`, { waitUntil: 'load' });
    const gemessen = await readBench(page);
    const cost = domainCost();
    writeCounts(log, gemessen.counts);
    writeDomain(log, cost);
    writeTimes(log, gemessen.mount, gemessen.rerender);
    const identisch = writeIdentity(log, gemessen.identity);
    log.write(`\nSeitenfehler ${problems.length}\n`);
    return { ...gemessen, cost, identisch, problems };
  } finally {
    await browser.close().catch(() => {});
    stopServer(server);
  }
}

if (import.meta.filename === process.argv[1]) {
  const { identisch, problems } = await benchOrganic();
  const gruen = identisch && problems.length === 0;
  process.stdout.write(`\n${gruen ? 'OK' : 'FAIL'}: Frame-Identitaet ${identisch ? 'haelt' : 'bricht'}, Seitenfehler ${problems.length}.\n`);
  process.exitCode = gruen ? 0 : 1;
}
