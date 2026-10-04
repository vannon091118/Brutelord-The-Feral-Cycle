/**
 * Die Darstellung des mutierten Dunglings: Stein-Seed plus Slot bestimmen die
 * Form, die Gegenpol-Skalen die Proportionen. Reine Geometrie, keine Wahrheit.
 */
import { STONE_SLOT } from '../../domain/brutelord/stone-config.js';
import { counterScales, emptySlots, formFor, torsoScale, visualPower } from '../../domain/brutelord/mutation-formula.js';

const BASE = Object.freeze({ head: 12, torso: 14, arms: 9, legs: 8 });

/** Die Proportionen eines Dunglings — leer ist er der nackte Basisbau. */
export function bodyPlan(stones) {
  const scales = counterScales(stones);
  const grow = (slot) => scales[slot]?.grow ?? 1;
  return {
    power: visualPower(stones),
    torso: torsoScale(stones, scales),
    head: BASE.head * grow(STONE_SLOT.HEAD),
    torsoWidth: BASE.torso * torsoScale(stones, scales),
    arms: BASE.arms * grow(STONE_SLOT.ARMS),
    legs: BASE.legs * grow(STONE_SLOT.LEGS),
    free: emptySlots(stones),
  };
}

export function partFor(stones, slot) {
  const stone = stones.find((entry) => entry.slot === slot);
  if (!stone) return null;
  return { form: formFor(stone), stone };
}