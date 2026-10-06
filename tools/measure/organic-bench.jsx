import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { createGenome } from '../../src/domain/brutelord/genome-roll.js';
import { organicFrame } from '../../src/domain/brutelord/organic-cache.js';
import { MutantSvg } from '../../src/world/dungling/MutantSvg.jsx';

// Dieselbe Komponente, die WorkerLayer im Weltbild montiert: der Messaufbau
// spiegelt den Weltpfad, statt eine zweite Zeichenroutine daneben zu stellen.
const COUNT = 20;
const TILE = 64;
const WINDOW = 13 * TILE + 2 * 0.75 * TILE;
const SIZE = TILE * 0.9;
const genomes = Array.from({ length: COUNT }, (unused, index) => createGenome(index * 7919 + 3));

function Element({ genome, index, variant }) {
  const col = index % 5;
  const row = Math.floor(index / 5);
  const x = (col + 0.5) * (WINDOW / 5);
  const y = (row + 0.5) * (WINDOW / 4);
  return (
    <g transform={`translate(${x} ${y})`}>
      <MutantSvg genome={genome} size={SIZE} id={`bench-${variant}-${index}`} />
    </g>
  );
}

function Bench({ genomes, variant = 0 }) {
  return (
    <svg width={WINDOW} height={WINDOW} viewBox={`0 0 ${WINDOW} ${WINDOW}`}>
      {genomes.map((genome, index) => <Element key={index} genome={genome} index={index} variant={variant} />)}
    </svg>
  );
}

function host() {
  const node = document.createElement('div');
  document.body.append(node);
  return node;
}

function mountTimed() {
  const node = host();
  const root = createRoot(node);
  const start = performance.now();
  flushSync(() => root.render(<Bench genomes={genomes} />));
  const ms = performance.now() - start;
  root.unmount();
  node.remove();
  return ms;
}

function median(times) {
  const sorted = times.slice().sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

// Der Atemtakt tickt alle 420ms und zeichnet zwanzig Mutanten neu; faellt ein
// Takt in eine Messung, misst sie den Takt mit. Fuer die Messung steht die Uhr
// still, fuer die Identitaetsprobe laeuft sie wieder.
function withoutClock(run) {
  const real = window.setInterval;
  window.setInterval = () => 0;
  try {
    return run();
  } finally {
    window.setInterval = real;
  }
}

function timesOf(times) {
  return { median: median(times), min: Math.min(...times), max: Math.max(...times), runs: times.length, window: WINDOW };
}

function renderTime({ runs = 25, warmup = 5 } = {}) {
  return withoutClock(() => {
    for (let index = 0; index < warmup; index += 1) mountTimed();
    return timesOf(Array.from({ length: runs }, () => mountTimed()));
  });
}

function rerenderTime({ runs = 25 } = {}) {
  return withoutClock(() => {
    const node = host();
    const root = createRoot(node);
    const view = (value) => <Bench genomes={genomes} variant={value} />;
    flushSync(() => root.render(view(0)));
    const times = Array.from({ length: runs }, (unused, index) => {
      const start = performance.now();
      flushSync(() => root.render(view(index + 1)));
      return performance.now() - start;
    });
    root.unmount();
    node.remove();
    return timesOf(times);
  });
}

function counts() {
  return genomes.map((genome, index) => {
    const frame = organicFrame(genome, 0);
    const bones = frame.skeleton.bones.length;
    const joints = frame.skeleton.joints.length;
    const rings = frame.rings.length;
    return { index, bones, joints, rings, elements: bones + joints + rings };
  });
}

function snapshot(node) {
  return [...node.querySelectorAll('svg[data-unit]')].map((svg) => ({ id: svg.dataset.unit, phase: svg.dataset.phase, html: svg.outerHTML }));
}

function summarize(samples) {
  const units = new Map();
  for (const rows of samples) {
    for (const row of rows) {
      const phases = units.get(row.id) ?? new Map();
      units.set(row.id, phases);
      const htmls = phases.get(row.phase) ?? new Set();
      phases.set(row.phase, htmls);
      htmls.add(row.html);
    }
  }
  const report = [...units].map(([id, phases]) => ({
    id,
    phases: phases.size,
    unstable: [...phases.values()].filter((htmls) => htmls.size !== 1).length,
    distinct: new Set([...phases.values()].map((htmls) => htmls.values().next().value)).size,
  }));
  return {
    samples: samples.length,
    units: report.length,
    unstable: report.reduce((sum, row) => sum + row.unstable, 0),
    phaseCounts: report.map((row) => row.phases),
    distinctCounts: report.map((row) => row.distinct),
  };
}

async function identity({ span = 3600, step = 30 } = {}) {
  const node = host();
  const root = createRoot(node);
  flushSync(() => root.render(<Bench genomes={genomes} />));
  const samples = [];
  await new Promise((done) => {
    const timer = setInterval(() => samples.push(snapshot(node)), step);
    setTimeout(() => { clearInterval(timer); done(); }, span);
  });
  root.unmount();
  node.remove();
  return summarize(samples);
}

function show({ count = 4, size = 260 } = {}) {
  const box = document.getElementById('bench');
  createRoot(box).render(
    <div style={{ display: 'flex', gap: 6, background: '#2a2118', padding: 6 }}>
      {genomes.slice(0, count).map((genome, index) => <MutantSvg key={index} genome={genome} size={size} id={`show-${index}`} />)}
    </div>,
  );
}

window.__bench = { window: WINDOW, size: SIZE, count: COUNT, counts, renderTime, rerenderTime, identity, show };
