// @doc: docs/daten/brutelord/organic-field.md#organic-field
import { ORGANIC_CONFIG } from './genome-config.js';
import { skeletonOf } from './organic-bones.js';

const ORG = ORGANIC_CONFIG;
const EPS = 1e-6;

function clamp(value, low, high) {
  return Math.min(high, Math.max(low, value));
}

function reachOf(bone, x, y) {
  const dx = bone.x2 - bone.x1;
  const dy = bone.y2 - bone.y1;
  const span = dx * dx + dy * dy;
  const part = span > EPS ? clamp(((x - bone.x1) * dx + (y - bone.y1) * dy) / span, 0, 1) : 0;
  return { x: bone.x1 + dx * part, y: bone.y1 + dy * part, r: bone.r1 + (bone.r2 - bone.r1) * part };
}

function blobValue(source, x, y) {
  const dx = x - source.x;
  const dy = y - source.y;
  return (source.r * source.r) / (dx * dx + dy * dy + EPS);
}

export function sampleField(skeleton, point) {
  const overBones = skeleton.bones.reduce(
    (sum, bone) => sum + blobValue(reachOf(bone, point.x, point.y), point.x, point.y),
    0,
  );
  const overJoints = skeleton.joints.reduce((sum, joint) => sum + blobValue(joint, point.x, point.y), 0);
  return overBones + overJoints;
}

function lobesOf(skeleton) {
  const ends = skeleton.bones.flatMap((bone) => [
    { x: bone.x1, y: bone.y1, r: bone.r1 },
    { x: bone.x2, y: bone.y2, r: bone.r2 },
  ]);
  return [...skeleton.joints, ...ends];
}

function tightBounds(skeleton) {
  const lobes = lobesOf(skeleton);
  return {
    halfX: Math.max(...lobes.map((lobe) => Math.abs(lobe.x) + lobe.r)) + ORG.pad,
    minY: Math.min(...lobes.map((lobe) => lobe.y - lobe.r)) - ORG.pad,
    maxY: Math.max(...lobes.map((lobe) => lobe.y + lobe.r)) + ORG.pad,
  };
}

function sealed(skeleton, bounds) {
  const { halfX, minY, maxY } = bounds;
  const across = Math.ceil((2 * halfX) / ORG.cell);
  const down = Math.ceil((maxY - minY) / ORG.cell);
  for (let index = 0; index <= across; index += 1) {
    const x = -halfX + (2 * halfX * index) / across;
    if (sampleField(skeleton, { x, y: minY }) > ORG.iso) return false;
    if (sampleField(skeleton, { x, y: maxY }) > ORG.iso) return false;
  }
  for (let index = 0; index <= down; index += 1) {
    const y = minY + ((maxY - minY) * index) / down;
    if (sampleField(skeleton, { x: -halfX, y }) > ORG.iso) return false;
    if (sampleField(skeleton, { x: halfX, y }) > ORG.iso) return false;
  }
  return true;
}

function boundsOf(skeleton) {
  let bounds = tightBounds(skeleton);
  for (let round = 0; round < ORG.sealRounds && !sealed(skeleton, bounds); round += 1) {
    bounds = {
      halfX: bounds.halfX + ORG.pad,
      minY: bounds.minY - ORG.pad,
      maxY: bounds.maxY + ORG.pad,
    };
  }
  return bounds;
}

function gridOf(bounds) {
  const half = Math.ceil(bounds.halfX / ORG.cell);
  const step = bounds.halfX / half;
  const columns = half * 2;
  const rows = Math.ceil((bounds.maxY - bounds.minY) / step);
  return {
    columns,
    rows,
    step,
    xs: Array.from({ length: columns + 1 }, (unused, index) => (index - half) * step),
    ys: Array.from({ length: rows + 1 }, (unused, index) => bounds.minY + index * step),
    vBase: (rows + 1) * (columns + 1),
  };
}

function valuesOf(skeleton, grid) {
  const stride = grid.columns + 1;
  const half = grid.columns / 2;
  const values = new Array(stride * (grid.rows + 1)).fill(0);
  for (let row = 0; row <= grid.rows; row += 1) {
    for (let column = 0; column <= grid.columns; column += 1) {
      const mirrored = column > half;
      const source = mirrored ? grid.columns - column : column;
      values[row * stride + column] = mirrored
        ? values[row * stride + source]
        : sampleField(skeleton, { x: grid.xs[column], y: grid.ys[row] });
    }
  }
  return values;
}

const CASES = Object.freeze([
  [], [[3, 0]], [[0, 1]], [[3, 1]], [[1, 2]], null, [[0, 2]], [[2, 3]],
  [[2, 3]], [[0, 2]], null, [[1, 2]], [[1, 3]], [[0, 1]], [[3, 0]], [],
]);

function caseSegments(index, middle) {
  if (index === 5) return middle > ORG.iso ? [[0, 1], [2, 3]] : [[3, 0], [1, 2]];
  if (index === 10) return middle > ORG.iso ? [[3, 0], [1, 2]] : [[0, 1], [2, 3]];
  return CASES[index];
}

function edgeIds(grid, column, row) {
  return [
    row * (grid.columns + 1) + column,
    grid.vBase + (column + 1) * (grid.rows + 1) + row,
    (row + 1) * (grid.columns + 1) + column,
    grid.vBase + column * (grid.rows + 1) + row,
  ];
}

function segmentsOf(grid, values) {
  const stride = grid.columns + 1;
  const segments = [];
  for (let row = 0; row < grid.rows; row += 1) {
    for (let column = 0; column < grid.columns; column += 1) {
      const corners = [
        values[row * stride + column],
        values[row * stride + column + 1],
        values[(row + 1) * stride + column + 1],
        values[(row + 1) * stride + column],
      ];
      const index = corners.reduce((bits, value, at) => bits | (value > ORG.iso ? 1 << at : 0), 0);
      const edges = edgeIds(grid, column, row);
      const middle = (corners[0] + corners[1] + corners[2] + corners[3]) / 4;
      for (const [from, to] of caseSegments(index, middle)) segments.push([edges[from], edges[to]]);
    }
  }
  return segments;
}

function pointOf(id, env) {
  const { grid, values } = env;
  const vertical = id >= grid.vBase;
  const local = vertical ? id - grid.vBase : id;
  const column = vertical ? Math.floor(local / (grid.rows + 1)) : local % (grid.columns + 1);
  const row = vertical ? local % (grid.rows + 1) : Math.floor(local / (grid.columns + 1));
  const corner = row * (grid.columns + 1) + column;
  const ahead = vertical ? corner + grid.columns + 1 : corner + 1;
  const part = (ORG.iso - values[corner]) / (values[ahead] - values[corner]);
  if (vertical) return { x: grid.xs[column], y: grid.ys[row] + part * grid.step };
  return { x: grid.xs[column] + part * grid.step, y: grid.ys[row] };
}

function stitch(segments) {
  const incident = new Map();
  segments.forEach(([from, to], index) => {
    for (const id of [from, to]) incident.set(id, [...(incident.get(id) ?? []), index]);
  });
  const used = new Array(segments.length).fill(false);
  const loops = [];
  for (let start = 0; start < segments.length; start += 1) {
    if (used[start]) continue;
    used[start] = true;
    const ids = [segments[start][0], segments[start][1]];
    while (true) {
      const tail = ids[ids.length - 1];
      const next = (incident.get(tail) ?? []).find((index) => !used[index]);
      if (next === undefined) break;
      used[next] = true;
      ids.push(segments[next][0] === tail ? segments[next][1] : segments[next][0]);
    }
    loops.push(ids);
  }
  return loops;
}

function areaOf(ring) {
  return ring.reduce((sum, point, index) => {
    const next = ring[(index + 1) % ring.length];
    return sum + point.x * next.y - next.x * point.y;
  }, 0) / 2;
}

function oriented(ring) {
  return areaOf(ring) < 0 ? ring.slice().reverse() : ring;
}

function ringsOf(loops, env) {
  const rings = loops
    .map((ids) => (ids[0] === ids[ids.length - 1] ? ids.slice(0, -1) : ids))
    .map((ids) => ids.map((id) => pointOf(id, env)))
    .filter((ring) => ring.length >= ORG.ringMinPoints)
    .filter((ring) => Math.abs(areaOf(ring)) >= ORG.ringMinArea)
    .map(oriented);
  return rings.sort((left, right) => Math.abs(areaOf(right)) - Math.abs(areaOf(left)) || left[0].y - right[0].y);
}

export function fieldOf(phenotype, phase) {
  const skeleton = skeletonOf(phenotype, phase);
  const grid = gridOf(boundsOf(skeleton));
  const env = { grid, values: valuesOf(skeleton, grid) };
  return { skeleton, rings: ringsOf(stitch(segmentsOf(grid, env.values)), env) };
}
