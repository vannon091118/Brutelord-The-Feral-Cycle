import { createRng } from '../domain/world/random.js';

/**
 * Small hand of helpers to draw organic SVG shapes.
 * Everything is deterministic: same seed, same hand drawn form.
 */

export function round(value) {
  return Math.round(value * 100) / 100;
}

/** Smooth closed blob through the given points (Catmull-Rom style via quadratics). */
export function blobPath(points) {
  const count = points.length;
  if (count < 3) return '';
  let d = `M ${round(points[0].x)} ${round(points[0].y)}`;
  for (let i = 0; i < count; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % count];
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;
    d += ` Q ${round(current.x)} ${round(current.y)} ${round(midX)} ${round(midY)}`;
  }
  return `${d} Z`;
}

/** Irregular blob points around a centre. */
export function blobPoints(rng, cx, cy, radius, count, jitter, squash = 1) {
  const points = [];
  const offset = rng() * Math.PI * 2;
  for (let i = 0; i < count; i += 1) {
    const angle = offset + (i / count) * Math.PI * 2;
    const r = radius * (1 - jitter / 2 + rng() * jitter);
    points.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r * squash,
    });
  }
  return points;
}

export function blobFromSeed(seed, cx, cy, radius, count = 9, jitter = 0.34, squash = 1) {
  return blobPath(blobPoints(createRng(seed), cx, cy, radius, count, jitter, squash));
}

/** A jagged crack that walks inward from a point on the rim. */
export function crackFromRim(rng, cx, cy, rim, angle, length) {
  let x = cx + Math.cos(angle) * rim;
  let y = cy + Math.sin(angle) * rim;
  let a = angle;
  let d = `M ${round(x)} ${round(y)}`;
  const segments = 3;
  for (let i = 0; i < segments; i += 1) {
    a += (rng() - 0.5) * 1.2;
    const step = length * (0.55 + rng() * 0.5);
    x += Math.cos(a) * step;
    y += Math.sin(a) * step;
    d += ` L ${round(x)} ${round(y)}`;
  }
  return d;
}

/** A small missing chunk of material. */
export function chipFromRim(rng, cx, cy, rim, angle) {
  const x = cx + Math.cos(angle) * rim;
  const y = cy + Math.sin(angle) * rim;
  const size = rim * (0.2 + rng() * 0.16);
  const a = angle;
  const b1 = { x: x + Math.cos(a - 1.1) * size, y: y + Math.sin(a - 1.1) * size };
  const b2 = { x: x + Math.cos(a + 0.5) * size, y: y + Math.sin(a + 0.5) * size };
  const mid = {
    x: x + Math.cos(a) * size * 0.35 + (rng() - 0.5) * size,
    y: y + Math.sin(a) * size * 0.35 + (rng() - 0.5) * size,
  };
  return `M ${round(b1.x)} ${round(b1.y)} L ${round(mid.x)} ${round(mid.y)} L ${round(b2.x)} ${round(b2.y)} Z`;
}