// @doc: docs/daten/brutelord/organic-bones.md#organic-bones
import { FEATURE_ANCHOR, ORGANIC_CONFIG, ORGANIC_SALT } from './genome-config.js';
import { mixSeed, unitOf } from './stone-seed.js';

const ORG = ORGANIC_CONFIG;
const RIGHT = Math.PI / 2;

function draw(seed, salt) {
  return unitOf(mixSeed(seed, salt));
}

function spread(seed, salt, width) {
  return 1 + (draw(seed, salt) - 0.5) * width;
}

function clamp(value, low, high) {
  return Math.min(high, Math.max(low, value));
}

function limbBreath(breath) {
  return 1 + (breath - 1) / 2;
}

function arcOf(offset) {
  return Math.sqrt(Math.max(0, 1 - offset * offset));
}

export function phaseOf(tick) {
  return ((Math.floor(tick) % ORG.phaseCount) + ORG.phaseCount) % ORG.phaseCount;
}

function planOf(phenotype) {
  const { traits } = phenotype;
  const seed = mixSeed(phenotype.hash, ORGANIC_SALT.plan);
  return {
    seed,
    spine: ORG.spineLength * traits.bodyScale,
    tail: ORG.tailLength * traits.bodyScale * spread(seed, ORGANIC_SALT.spine, 0.6),
    girth: ORG.bodyGirth * traits.bodyScale,
    limbStep: ORG.limbLength * traits.limbLength * spread(seed, ORGANIC_SALT.limb, 0.3),
    limbGirth: ORG.limbGirth * traits.limbThickness * spread(seed, ORGANIC_SALT.limb + 7, 0.25),
    limbRounds: clamp(Math.round(traits.limbLength * 1.7), 2, 4),
    splay: ORG.limbSplay * spread(seed, ORGANIC_SALT.limb + 13, 0.45),
    curl: clamp(traits.limbCurl, -0.4, 0.4),
    head: ORG.headRadius * traits.headScale * spread(seed, ORGANIC_SALT.head, 0.2),
    eyes: phenotype.eyes,
    horns: phenotype.horns,
  };
}

const RULES = Object.freeze({ S: 'F[L]', L: 'FL' });

function rewrite(word, rounds) {
  let grown = word;
  for (let round = 0; round < rounds; round += 1) {
    grown = grown.split('').map((symbol) => RULES[symbol] ?? symbol).join('');
  }
  return grown;
}

function wordOf(plan) {
  return rewrite(`T${'S'.repeat(ORG.spineNodes)}H`, plan.limbRounds);
}

function bone({ x1, y1, x2, y2, r1, r2, limb }) {
  return { x1, y1, x2, y2, r1, r2, limb };
}

function joint({ x, y, r, role }) {
  return { x, y, r, role };
}

function bag() {
  return { bones: [], joints: [] };
}

function mirrorBone(source) {
  return { x1: -source.x1, y1: source.y1, x2: -source.x2, y2: source.y2, r1: source.r1, r2: source.r2, limb: source.limb };
}

function mirrorJoint(source) {
  return { x: -source.x, y: source.y, r: source.r, role: source.role };
}

function bothSides(items, mirror) {
  return items.flatMap((item) => [item, mirror(item)]);
}

function limbOf(node, splay) {
  const arm = node >= ORG.spineNodes - 1;
  return { angle: arm ? Math.PI : -RIGHT - splay * 0.5, bend: arm ? splay * 0.5 : -splay * 0.95 };
}

function advance(symbol, pose, env) {
  const limb = symbol === 'L' || pose.inside;
  if (!limb) pose.node += 1;
  const length = limb ? env.plan.limbStep * limbBreath(env.breath) : env.plan.spine * env.breath;
  const girth = limb ? env.plan.limbGirth * limbBreath(env.breath) : env.plan.girth * env.breath;
  const r1 = limb && pose.fresh ? girth * ORG.limbPinch : girth;
  const next = { x: pose.x + Math.cos(pose.angle) * length, y: pose.y + Math.sin(pose.angle) * length };
  const store = pose.inside ? pose.sided : pose.axis;
  store.bones.push(bone({ x1: pose.x, y1: pose.y, x2: next.x, y2: next.y, r1, r2: girth * 0.88, limb }));
  const end = joint({ x: next.x, y: next.y, r: girth * (limb ? ORG.limbJoint : ORG.jointBulge), role: limb ? null : FEATURE_ANCHOR.BACK });
  store.joints.push(end);
  pose.x = next.x;
  pose.y = next.y;
  pose.angle += limb ? pose.bend : 0;
  if (limb) {
    pose.tip = end;
    pose.fresh = false;
  }
}

function enter(pose, env) {
  pose.stack.push({ x: pose.x, y: pose.y, angle: pose.angle, inside: pose.inside, tip: pose.tip, bend: pose.bend, fresh: pose.fresh });
  if (pose.inside) {
    pose.angle += pose.bend;
  } else {
    const limb = limbOf(pose.node, env.plan.splay);
    pose.angle = limb.angle;
    pose.bend = limb.bend;
    pose.fresh = true;
    pose.x += Math.cos(limb.angle) * env.plan.girth * ORG.limbRoot;
    pose.y += Math.sin(limb.angle) * env.plan.girth * ORG.limbRoot;
  }
  pose.inside = true;
  pose.tip = null;
}

function leave(pose) {
  if (pose.tip) pose.tip.role = FEATURE_ANCHOR.LIMB_TIP;
  const frame = pose.stack.pop();
  pose.x = frame.x;
  pose.y = frame.y;
  pose.angle = frame.angle;
  pose.inside = frame.inside;
  pose.tip = frame.tip;
  pose.bend = frame.bend;
  pose.fresh = frame.fresh;
}

function tail(pose, env) {
  const girth = env.plan.girth * env.breath;
  const tip = joint({ x: pose.x, y: pose.y - env.plan.tail, r: girth * 0.7, role: null });
  pose.axis.joints.push(tip);
  pose.axis.bones.push(bone({ x1: pose.x, y1: pose.y, x2: tip.x, y2: tip.y, r1: girth, r2: tip.r, limb: false }));
}

function sockets({ pose, env, radius }) {
  const { eyes, horns } = env.plan;
  if (eyes % 2 === 1) pose.axis.joints.push(joint({ x: pose.x, y: pose.y + radius * 0.82, r: ORG.featureGirth, role: FEATURE_ANCHOR.EYE_SOCKET }));
  for (let index = 0; index < Math.floor(eyes / 2); index += 1) {
    const apart = 0.36 + index * 0.28;
    pose.sided.joints.push(joint({ x: pose.x - apart * radius, y: pose.y + arcOf(apart) * radius * 0.72, r: ORG.featureGirth, role: FEATURE_ANCHOR.EYE_SOCKET }));
  }
  if (horns % 2 === 1) pose.axis.joints.push(joint({ x: pose.x, y: pose.y + radius * 1.04, r: ORG.featureGirth, role: FEATURE_ANCHOR.HEAD_TIP }));
  for (let index = 0; index < Math.floor(horns / 2); index += 1) {
    const apart = 0.2 + index * 0.34;
    pose.sided.joints.push(joint({ x: pose.x - apart * radius, y: pose.y + arcOf(apart) * radius * 1.04, r: ORG.featureGirth, role: FEATURE_ANCHOR.HEAD_TIP }));
  }
  pose.axis.joints.push(joint({ x: pose.x, y: pose.y - radius * 0.9, r: ORG.featureGirth, role: FEATURE_ANCHOR.JAW }));
}

function head(pose, env) {
  const radius = env.plan.head * env.breath;
  pose.axis.joints.push(joint({ x: pose.x, y: pose.y, r: radius * ORG.jointBulge, role: null }));
  sockets({ pose, env, radius });
}

function step(symbol, pose, env) {
  if (symbol === 'F' || symbol === 'L') advance(symbol, pose, env);
  else if (symbol === '[') enter(pose, env);
  else if (symbol === ']') leave(pose);
  else if (symbol === 'T') tail(pose, env);
  else if (symbol === 'H') head(pose, env);
}

function walkWord(plan, breath) {
  const pose = { x: 0, y: 0, angle: RIGHT, stack: [], axis: bag(), sided: bag(), tip: null, inside: false, node: -1, bend: 0, fresh: false };
  for (const symbol of wordOf(plan)) step(symbol, pose, { plan, breath });
  return pose;
}

function centerOf(joints) {
  const heights = joints.map((entry) => entry.y);
  return { x: 0, y: (Math.min(...heights) + Math.max(...heights)) / 2 };
}

export function skeletonOf(phenotype, phase) {
  const plan = planOf(phenotype);
  const index = phaseOf(phase);
  const breath = ORG.breathe[index];
  const pose = walkWord(plan, breath);
  const joints = [...pose.axis.joints, ...bothSides(pose.sided.joints, mirrorJoint)];
  const bones = [...pose.axis.bones, ...bothSides(pose.sided.bones, mirrorBone)];
  return { seed: plan.seed, phase: index, breath, center: centerOf(joints), bones, joints };
}
