// @doc: docs/daten/dungling/dungling-look.md#dungling-look
import { makeRng } from '../tile-shapes.js';

const STEPS = 11;
const CENTER_Y = -4;
const HALF_WIDTH = 13.4;
const HALF_HEIGHT = 15;
const RING_TOP = -Math.PI / 2;

function creatureSeed(id) {
  let hash = 0x811c9dc5;
  const text = String(id);
  for (let index = 0; index < text.length; index += 1) {
    hash = Math.imul(hash ^ text.charCodeAt(index), 0x01000193);
  }
  return hash >>> 0;
}

const round1 = (value) => Math.round(value * 10) / 10;

const midpoint = (a, b) => `${round1((a.x + b.x) / 2)},${round1((a.y + b.y) / 2)}`;

function ringPoint(rng, spot) {
  const angle = RING_TOP + (spot.index / STEPS) * Math.PI * 2;
  const foot = Math.sin(angle) > 0.4;
  const wobble = 1 + (rng() - 0.5) * spot.slack * (foot ? 0.05 : 0.13);
  return {
    x: round1(Math.cos(angle) * HALF_WIDTH * spot.scale * wobble),
    y: round1(CENTER_Y + Math.sin(angle) * HALF_HEIGHT * spot.scale * wobble),
  };
}

function shellPath(rng, scale, slack) {
  const ring = Array.from({ length: STEPS }, (_, index) => ringPoint(rng, { index, scale, slack }));
  let d = `M${midpoint(ring[STEPS - 1], ring[0])}`;
  for (let index = 0; index < STEPS; index += 1) {
    const next = ring[(index + 1) % STEPS];
    d += `Q${ring[index].x},${ring[index].y} ${midpoint(ring[index], next)}`;
  }
  return `${d}Z`;
}

function lobePlaces(rng, scale) {
  const count = 3 + Math.floor(rng() * 3);
  const step = 14 / Math.max(count - 1, 1);
  return Array.from({ length: count }, (_, index) => ({
    cx: round1((-7 + index * step + (rng() - 0.5) * 2.2) * scale),
    cy: round1(-13 + rng() * 6),
    r: round1((2.4 + rng() * 1.8) * scale),
    opacity: round1(0.4 + rng() * 0.3),
    tone: rng() > 0.55 ? 'var(--color-hive-400)' : 'var(--color-hive-500)',
  }));
}

function veinPaths(rng, scale) {
  const count = 2 + Math.floor(rng() * 3);
  return Array.from({ length: count }, () => {
    const start = { x: round1((rng() - 0.5) * 7 * scale), y: round1(-15 + rng() * 3) };
    const end = { x: round1((rng() - 0.5) * 13 * scale), y: round1(-8 + rng() * 5) };
    const waist = round1((start.y + end.y) / 2);
    const bow = round1((rng() - 0.5) * 7 * scale);
    return `M${start.x},${start.y} C${round1(start.x + bow)},${waist} ${round1(end.x - bow)},${waist} ${end.x},${end.y}`;
  });
}

function crownPaths(rng, scale) {
  const count = rng() > 0.62 ? 3 : 2;
  const step = 11.2 / (count - 1);
  return Array.from({ length: count }, (_, index) => {
    const root = round1((-5.6 + index * step) * scale);
    const tipX = round1(root + (rng() - 0.5) * 3.4);
    const tipY = round1((-23 - rng() * 4) * scale);
    const bendX = round1(root + (tipX - root) * 0.45);
    const liftY = round1(tipY + 3);
    return { at: root, d: `M${root},-17.2 C${bendX},-20.8 ${round1(tipX + (root - tipX) * 0.3)},${liftY} ${tipX},${tipY}` };
  });
}

function porePlaces(rng, scale) {
  const count = 3 + Math.floor(rng() * 4);
  return Array.from({ length: count }, () => {
    const side = rng() > 0.5 ? 1 : -1;
    return { cx: round1(side * (4 + rng() * 4.4) * scale), cy: round1(-9.5 + rng() * 7), r: round1(0.6 + rng() * 0.4) };
  });
}

function seamPaths(rng) {
  const width = round1(3 + rng() * 1.2);
  const top = round1(-4.4 + rng() * 0.8);
  const curve = (depth) => `M${-width},${top} C${round1(-width / 2)},${round1(top + depth)} ${round1(width / 2)},${round1(top + depth)} ${width},${top}`;
  return { rest: curve(round1(2.4 + rng() * 1.2)), work: curve(1.2) };
}

function shineSpot(rng, scale) {
  return {
    cx: round1((-6 + rng() * 2.6) * scale),
    cy: round1(-11 + rng() * 2),
    rx: round1((3.8 + rng() * 1.2) * scale),
    ry: round1((2.2 + rng() * 0.9) * scale),
    rot: round1(-34 + rng() * 18),
  };
}

export function materialIds(id) {
  const base = `dl-cr-${String(id).replace(/[^A-Za-z0-9_-]/g, '_')}`;
  return { shell: `${base}-shell`, core: `${base}-core`, air: `${base}-air`, ground: `${base}-ground` };
}

export function lookOf(id) {
  const rng = makeRng(creatureSeed(id));
  const scale = 0.94 + rng() * 0.12;
  const slack = 0.6 + rng() * 0.8;
  return {
    ids: materialIds(id),
    scale: Math.round(scale * 100) / 100,
    shell: shellPath(rng, scale, slack),
    lobes: lobePlaces(rng, scale),
    veins: veinPaths(rng, scale),
    crown: crownPaths(rng, scale),
    pores: porePlaces(rng, scale),
    seam: seamPaths(rng),
    shine: shineSpot(rng, scale),
  };
}
