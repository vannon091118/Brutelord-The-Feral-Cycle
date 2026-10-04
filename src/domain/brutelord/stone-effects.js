/**
 * Die Wirkung der Steine hängt an der Einheit, nicht am Labor: ein Mutant trägt
 * seine eigenen Aufträge und seine Tragekraft, und er strahlt auf die anderen.
 * Ohne Stein ist ein Dungling neutral.
 */
import { STONE_TRAIT_DEFS } from './stone-config.js';
import { unitStones } from './mutant.js';
import { jobTrip } from '../labour/jobs.js';

export const NEUTRAL_EFFECTS = Object.freeze({
  buildOrders: true,
  auraRadius: 0,
  speedBonus: 0,
  trailSlow: 0,
  carryBonus: 0,
});

export function unitEffects(worker) {
  return unitStones(worker).reduce(fold, NEUTRAL_EFFECTS);
}

function fold(effects, stone) {
  const def = stone.trait ? STONE_TRAIT_DEFS[stone.trait] : null;
  if (!def) return effects;
  return {
    buildOrders: effects.buildOrders && def.buildOrders,
    auraRadius: Math.max(effects.auraRadius, def.auraRadius),
    speedBonus: Math.max(effects.speedBonus, def.speedBonus),
    trailSlow: Math.max(effects.trailSlow, def.trailSlow),
    carryBonus: Math.max(effects.carryBonus, def.carryBonus),
  };
}

export function tileUnder(worker) {
  const trip = jobTrip(worker.job);
  if (!trip) return worker.tile;
  return {
    x: Math.floor(trip.from.x + (trip.to.x - trip.from.x) * trip.progress),
    y: Math.floor(trip.from.y + (trip.to.y - trip.from.y) * trip.progress),
  };
}

function sourceOf(worker) {
  return { id: worker.id, tile: tileUnder(worker), ...unitEffects(worker) };
}

export function tickScale(worker, dunglings) {
  const tile = tileUnder(worker);
  const others = dunglings.filter((entry) => entry.id !== worker.id).map(sourceOf);
  const boost = peak(others, (source) => (within(source, tile) ? source.speedBonus : 0));
  const slow = peak(others, (source) => (sameTile(source.tile, tile) ? source.trailSlow : 0));
  return (1 + boost) * (1 - slow);
}

function within(source, tile) {
  return source.auraRadius > 0 && manhattan(source.tile, tile) <= source.auraRadius;
}

function sameTile(left, right) {
  return left.x === right.x && left.y === right.y;
}

function manhattan(left, right) {
  return Math.abs(left.x - right.x) + Math.abs(left.y - right.y);
}

function peak(sources, pick) {
  return sources.reduce((max, source) => Math.max(max, pick(source)), 0);
}