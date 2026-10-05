// @doc: docs/daten/floor/substrate.md#substrate
import { crackPath, makeRng, soilSpeckles } from '../tile-shapes.js';

const STYLE = Object.freeze({
  facet: 'var(--color-rock-500)',
  shard: 'var(--color-rock-700)',
  seam: 'var(--color-rock-300)',
  grain: 'var(--color-bone-300)',
});

function n(value) {
  return Math.round(value * 10) / 10;
}

function dot({ key, grain: { cx, cy, r }, fill, opacity }) {
  return { kind: 'dot', key, cx, cy, r: n(r), fill, opacity };
}

function shardPoints({ cx, cy, radius, seed, count }) {
  const rng = makeRng(seed);
  const corners = Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2 + rng() * 0.6;
    const reach = radius * (0.55 + rng() * 0.8);
    return `${n(cx + Math.cos(angle) * reach)},${n(cy + Math.sin(angle) * reach * 1.3)}`;
  });
  return corners.join(' ');
}

function facetsOf({ key, cx, cy, radius, seed }) {
  return Array.from({ length: 5 }, (_, index) => {
    const angle = (index / 5) * Math.PI * 2;
    return {
      kind: 'poly',
      key: `${key}-${index}`,
      points: shardPoints({
        cx: cx + Math.cos(angle) * radius * 1.5,
        cy: cy + Math.sin(angle) * radius * 1.5,
        radius: radius * 0.8,
        seed: seed + index * 7,
        count: 4,
      }),
      fill: index % 2 ? STYLE.facet : STYLE.shard,
      opacity: 0.07 + (index % 3) * 0.035,
    };
  });
}

function seamsOf({ x, y, size, seed }) {
  return [0, 1].map((index) => ({
    kind: 'line',
    key: `seam-${index}`,
    d: crackPath({ x, y, size, seed: seed ^ 0x9a, index: index + 5, spread: 0.6 }),
    stroke: STYLE.seam,
    width: 0.7,
    opacity: 0.12,
  }));
}

export function stoneMarks({ x, y, size, seed }) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const grains = soilSpeckles({ x, y, size, count: 6, seed: seed ^ 0x2b, inset: 6 }).map((grain) =>
    dot({ key: `grain-${grain.cx}-${grain.cy}`, grain, fill: STYLE.grain, opacity: 0.35 }),
  );
  return [...facetsOf({ key: 'facet', cx, cy, radius: 9, seed }), ...seamsOf({ x, y, size, seed }), ...grains];
}
