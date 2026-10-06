// @doc: docs/daten/brutelord/organic-anchors.md#organic-anchors
import { FEATURE_ANCHOR } from './genome-config.js';

const ROLES = Object.freeze(Object.values(FEATURE_ANCHOR));

function nearest(ring, point) {
  let best = Infinity;
  let index = 0;
  for (let at = 0; at < ring.length; at += 1) {
    const dx = ring[at].x - point.x;
    const dy = ring[at].y - point.y;
    const span = dx * dx + dy * dy;
    if (span < best) {
      best = span;
      index = at;
    }
  }
  return { index, gap: Math.sqrt(best) };
}

function normalOf(ring, index, center) {
  const point = ring[index];
  const before = ring[(index - 1 + ring.length) % ring.length];
  const after = ring[(index + 1) % ring.length];
  const tx = after.x - before.x;
  const ty = after.y - before.y;
  const scale = Math.hypot(tx, ty) || 1;
  const out = { x: -ty / scale, y: tx / scale };
  const dot = out.x * (point.x - center.x) + out.y * (point.y - center.y);
  return dot < 0 ? { x: -out.x, y: -out.y } : out;
}

function anchorFor(joint, field) {
  let found = null;
  field.rings.forEach((ring, ringIndex) => {
    const probe = nearest(ring, joint);
    if (found === null || probe.gap < found.gap) found = { ringIndex, ...probe };
  });
  const source = field.rings[found.ringIndex][found.index];
  return {
    role: joint.role,
    joint: { x: joint.x, y: joint.y },
    point: { x: source.x, y: source.y },
    ring: found.ringIndex,
    index: found.index,
    gap: found.gap,
    normal: normalOf(field.rings[found.ringIndex], found.index, field.skeleton.center),
  };
}

export function anchorsOf(field) {
  return field.skeleton.joints
    .filter((joint) => ROLES.includes(joint.role))
    .map((joint) => anchorFor(joint, field));
}
