// @doc: docs/daten/brutelord/organic-cache.md#organic-cache
import { ORGANIC_CONFIG } from './genome-config.js';
import { phaseOf, skeletonOf } from './organic-bones.js';
import { fieldOf } from './organic-field.js';
import { phenotypeOf } from './phenotype.js';
import { anchorsOf } from './organic-anchors.js';

const ORG = ORGANIC_CONFIG;
const CAP = 128;
const frames = new Map();
const views = new Map();

function fitOf(skeleton) {
  const halfX = Math.max(...skeleton.joints.map((joint) => Math.abs(joint.x) + joint.r)) + ORG.pad;
  const top = Math.max(...skeleton.joints.map((joint) => joint.y + joint.r)) + ORG.pad;
  const bottom = Math.min(...skeleton.joints.map((joint) => joint.y - joint.r)) - ORG.pad;
  return { scale: Math.min(66 / halfX, 74 / ((top - bottom) / 2)), midY: (top + bottom) / 2 };
}

function viewOf(phenotype) {
  const hit = views.get(phenotype.hash);
  if (hit) return hit;
  const peak = ORG.breathe.indexOf(Math.max(...ORG.breathe));
  const view = fitOf(skeletonOf(phenotype, peak));
  if (views.size >= CAP) views.clear();
  views.set(phenotype.hash, view);
  return view;
}

export function frameKey(phenotype, phase) {
  return `${phenotype.hash.toString(36)}_f${phase}`;
}

function build(genome, phase) {
  const phenotype = phenotypeOf(genome);
  const field = fieldOf(phenotype, phase);
  return Object.freeze({
    phase,
    phenotype,
    view: viewOf(phenotype),
    skeleton: field.skeleton,
    rings: field.rings,
    anchors: anchorsOf(field),
  });
}

export function organicFrame(genome, tick) {
  const phenotype = phenotypeOf(genome);
  const phase = phaseOf(tick);
  const key = frameKey(phenotype, phase);
  const hit = frames.get(key);
  if (hit) return hit;
  const frame = build(genome, phase);
  if (frames.size >= CAP) frames.clear();
  frames.set(key, frame);
  return frame;
}

export function frameCount() {
  return frames.size;
}

export function cacheKeys() {
  return Array.from(frames.keys());
}

export function clearFrames() {
  frames.clear();
  views.clear();
}
