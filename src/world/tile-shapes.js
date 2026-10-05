// @doc: docs/daten/world/tile-shapes.md#tile-shapes
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

function smoothClosedPath(points) {
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

function blobPlaces(points) {
  const corners = [0, 0.25, 0.5, 0.75];
  const alongEdge = Array.from({ length: points }, (_, index) => (index + 0.5) / points);
  return [...corners, ...alongEdge].sort((left, right) => left - right);
}

function blobPoint({ place, rng, inset, jitter, wobble, outward }, { x, y, size }) {
  const t = place + (rng() - 0.5) * 0.03;
  const p = perimeterPoint({
    t,
    minX: x + inset,
    minY: y + inset,
    maxX: x + size - inset,
    maxY: y + size - inset,
  });
  const inward = jitter * (0.35 + rng() * 0.65) + wobble * rng() - outward;
  return { x: p.x + p.nx * inward, y: p.y + p.ny * inward };
}

export function soilBlob({ x, y, size, inset = 3, jitter = 3.2, points = 7, seed = 1, wobble = 0, outward = 0 }) {
  const rng = makeRng(seed);
  const tuning = { rng, inset, jitter, wobble, outward };
  return smoothClosedPath(blobPlaces(points).map((place) => blobPoint({ place, ...tuning }, { x, y, size })));
}

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

const SIDE_ORIGIN = Object.freeze({ N: 0.125, E: 0.375, S: 0.625, W: 0.875 });
const CORNER_PLACE = Object.freeze({ NE: 0.25, SE: 0.5, SW: 0.75, NW: 0 });
const CORNER_IN = Object.freeze({ NE: [-1, 1], SE: [-1, -1], SW: [1, -1], NW: [1, 1] });
const SIDES = Object.freeze(['N', 'E', 'S', 'W']);

function sideSpan(side) {
  return [SIDE_ORIGIN[side] - 0.125, SIDE_ORIGIN[side] + 0.125];
}

export function soilMaskBlob({ x, y, size, open, seed, notch = null, inset = 4, jitter = 2.6, points = 16, outward = 10, overlap = 2.5 }) {
  const rng = makeRng(seed);
  const tuning = { rng, inset, jitter, wobble: 0, outward, points };
  const border = (t) => perimeterPoint({ t, minX: x + inset, minY: y + inset, maxX: x + size - inset, maxY: y + size - inset });
  const pts = maskPoints({ x, y, size, open, notch, rng, overlap, tuning, border });
  pts.sort((a, b) => a.place - b.place);
  return smoothClosedPath(pts.map((entry) => entry.point));
}

function maskPoints({ x, y, size, open, notch, rng, overlap, tuning }) {
  const border = (t) => perimeterPoint({ t, minX: x + tuning.inset, minY: y + tuning.inset, maxX: x + size - tuning.inset, maxY: y + size - tuning.inset });
  const seamPoint = (side, t) => { const p = border(t); const o = tuning.inset + (0.55 + rng() * 0.45) * overlap; return { x: p.x - p.nx * o, y: p.y - p.ny * o } };
  const seamCorner = (corner) => { const p = border(CORNER_PLACE[corner]); const [dx, dy] = CORNER_IN[corner]; const o = tuning.inset + overlap * 2; return { x: p.x - dx * o, y: p.y - dy * o } };
  const notchPoint = (corner) => { const p = border(CORNER_PLACE[corner]); const [dx, dy] = CORNER_IN[corner]; return { x: p.x + dx * 2.2, y: p.y + dy * 2.2 } };
  const openSides = SIDES.filter((side) => open[side]);
  const per = Math.max(2, Math.round(tuning.points / Math.max(1, openSides.length)));
  const pts = [];
  for (const side of openSides) {
    const [from, to] = sideSpan(side);
    for (let i = 0; i < per; i += 1) {
      const place = from + ((i + 0.5) / per) * (to - from);
      pts.push({ place, point: blobPoint({ place, ...tuning }, { x, y, size }) });
    }
  }
  const seam = 0.03;
  for (const side of SIDES) {
    if (open[side]) continue;
    const [from, to] = sideSpan(side);
    pts.push({ place: from + seam, point: seamPoint(side, from + seam) });
    pts.push({ place: to - seam, point: seamPoint(side, to - seam) });
  }
  for (const corner of ['NE', 'SE', 'SW', 'NW']) {
    if (open[corner[0]] && open[corner[1]]) pts.push({ place: CORNER_PLACE[corner] || 0.999, point: blobPoint({ place: CORNER_PLACE[corner], ...tuning }, { x, y, size }) });
    else if (notch && notch[corner]) pts.push({ place: CORNER_PLACE[corner] || 0.999, point: notchPoint(corner) });
    else if (!open[corner[0]] && !open[corner[1]]) pts.push({ place: CORNER_PLACE[corner] || 0.999, point: seamCorner(corner) });
  }
  return pts;
}

export function wallBand({ x, y, size, hidden, seed, depth = 18, outset = 0.8 }) {
  const rng = makeRng(seed ^ 0x5e11);
  const anchor = (t) => perimeterPoint({ t, minX: x, minY: y, maxX: x + size, maxY: y + size });
  const bands = [];
  for (const side of SIDES) {
    if (!hidden[side]) continue;
    const [from, to] = sideSpan(side);
    const steps = 4;
    const outer = [];
    const inner = [];
    for (let i = 0; i <= steps; i += 1) {
      const p = anchor(from + ((i / steps) * (to - from)));
      const d = depth * (0.55 + rng() * 0.9);
      outer.push({ x: p.x - p.nx * outset, y: p.y - p.ny * outset });
      inner.push({ x: p.x + p.nx * d, y: p.y + p.ny * d });
    }
    const head = `M${round(outer[0].x)},${round(outer[0].y)}`;
    const top = outer.slice(1).map((pt) => `L${round(pt.x)},${round(pt.y)}`).join('');
    const tail = inner.slice().reverse().map((pt) => `L${round(pt.x)},${round(pt.y)}`).join('');
    bands.push({ key: `band-${side}`, d: `${head}${top}${tail}Z`, lip: `${head}${top}`, lipWidth: round(1.6 + rng() * 1.2) });
  }
  return bands;
}
