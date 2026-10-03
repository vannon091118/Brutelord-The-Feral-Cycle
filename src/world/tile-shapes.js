/**
 * Deterministische Formgebung für die Weltgrafik.
 *
 * Kein Math.random, kein Date.now: dieselbe Tile-Koordinate ergibt immer
 * dieselbe Erde. Die Variationen sind kontrolliert — kleine Unterschiede in
 * Silhouette, Korn und Rissen, aber dieselbe Grundform.
 *
 * Reine Geometrie (keine React-, DOM- oder Stil-Abhängigkeit).
 */

export function tileSeed(x, y) {
  let h = Math.imul(x + 1013, 73856093) ^ Math.imul(y + 7079, 19349663);
  h ^= h >>> 13;
  h = Math.imul(h, 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

export function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function round(value) {
  return Math.round(value * 100) / 100;
}

/** Weiche, geschlossene Kurve durch alle Punkte (Enden laufen ineinander). */
export function smoothClosedPath(points) {
  const n = points.length;
  if (n < 3) return '';
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const start = mid(points[n - 1], points[0]);
  let d = `M${round(start.x)},${round(start.y)}`;
  for (let i = 0; i < n; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % n];
    const m = mid(current, next);
    d += `Q${round(current.x)},${round(current.y)} ${round(m.x)},${round(m.y)}`;
  }
  return `${d}Z`;
}

/** Punkt auf dem Rechteckumlauf plus Innenrichtung. */
function perimeterPoint({ t, minX, minY, maxX, maxY }) {
  const w = maxX - minX;
  const h = maxY - minY;
  const per = 2 * (w + h);
  const d = (((t % 1) + 1) % 1) * per;
  if (d < w) return { x: minX + d, y: minY, nx: 0, ny: 1 };
  if (d < w + h) return { x: maxX, y: minY + (d - w), nx: -1, ny: 0 };
  if (d < 2 * w + h) return { x: maxX - (d - w - h), y: maxY, nx: 0, ny: -1 };
  return { x: minX, y: maxY - (d - 2 * w - h), nx: 1, ny: 0 };
}

/**
 * Rundliche Erdfläche: ein Rechteck, dessen Rand unregelmäßig nach innen
 * gezogen wird. `inset` bestimmt, wie viel Rand bleibt, `jitter` wie wild.
 */
export function soilBlob({
  x,
  y,
  size,
  inset = 3,
  jitter = 3.2,
  points = 7,
  seed = 1,
  wobble = 0,
}) {
  const rng = makeRng(seed);
  const minX = x + inset;
  const minY = y + inset;
  const maxX = x + size - inset;
  const maxY = y + size - inset;
  const pts = [];
  for (let i = 0; i < points; i += 1) {
    const t = i / points + (rng() - 0.5) * 0.04;
    const p = perimeterPoint({ t, minX, minY, maxX, maxY });
    const inward = jitter * (0.35 + rng() * 0.65) + wobble * rng();
    pts.push({ x: p.x + p.nx * inward, y: p.y + p.ny * inward });
  }
  return smoothClosedPath(pts);
}

/** Kleine Körner und Kiesel im Erdblock. */
export function soilSpeckles({ x, y, size, count = 5, seed = 1, inset = 11 }) {
  const rng = makeRng(seed ^ 0x9e37);
  const grains = [];
  for (let i = 0; i < count; i += 1) {
    grains.push({
      cx: round(x + inset + rng() * (size - inset * 2)),
      cy: round(y + inset + rng() * (size - inset * 2)),
      r: round(0.7 + rng() * 1.5),
      tone: rng() > 0.55 ? 'light' : 'dark',
    });
  }
  return grains;
}

/** Ein Riss: startet am Rand des Blocks und wandert ins Innere. */
export function crackPath({ x, y, size, seed, index = 0, spread = 1 }) {
  const rng = makeRng(seed ^ (0x51ed + index * 977));
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const angle = rng() * Math.PI * 2;
  const startRadius = size * (0.30 + rng() * 0.16);
  let px = centerX + Math.cos(angle) * startRadius * spread;
  let py = centerY + Math.sin(angle) * startRadius * spread;
  let d = `M${round(px)},${round(py)}`;
  const segments = 2 + Math.floor(rng() * 3);
  let dir = angle;
  for (let i = 0; i < segments; i += 1) {
    dir += (rng() - 0.5) * 1.5;
    const len = size * (0.12 + rng() * 0.16);
    const cx = px + Math.cos(dir - 0.5) * len * 0.5;
    const cy = py + Math.sin(dir - 0.5) * len * 0.5;
    px += Math.cos(dir) * len;
    py += Math.sin(dir) * len;
    d += `Q${round(cx)},${round(cy)} ${round(px)},${round(py)}`;
  }
  return d;
}

/** Ausgebrochene Kerbe am Rand des Blocks. */
export function chipBlob({ x, y, size, seed, index = 0, grow = 1 }) {
  const rng = makeRng(seed ^ (0x7a11 + index * 613));
  const side = Math.floor(rng() * 4);
  const along = 0.2 + rng() * 0.6;
  const radius = (2.4 + rng() * 2.2) * grow;
  let cx = x + size * along;
  let cy = y + 2.5;
  if (side === 1) {
    cx = x + size - 2.5;
    cy = y + size * along;
  } else if (side === 2) {
    cx = x + size * along;
    cy = y + size - 2.5;
  } else if (side === 3) {
    cx = x + 2.5;
    cy = y + size * along;
  }
  const n = 6;
  const pts = [];
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    const r = radius * (0.6 + rng() * 0.6);
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return smoothClosedPath(pts);
}

/** Verstreute Brocken außerhalb des Spielfelds — reine Kulisse. */
export function scatterRocks({ seed, minX, minY, maxX, maxY, count = 16 }) {
  const rng = makeRng(seed);
  const rocks = [];
  for (let i = 0; i < count; i += 1) {
    rocks.push({
      cx: round(minX + rng() * (maxX - minX)),
      cy: round(minY + rng() * (maxY - minY)),
      r: round(1.2 + rng() * 3.4),
      sq: round(0.72 + rng() * 0.5),
      rot: Math.round(rng() * 90),
      tone: rng() > 0.5 ? 'light' : 'dark',
      opacity: round(0.12 + rng() * 0.22),
    });
  }
  return rocks;
}
