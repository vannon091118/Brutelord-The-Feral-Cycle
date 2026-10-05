// @doc: docs/daten/brutelord/mutation-formula.md#mutation-formula
import { SLOT_ORDER, STONE_DEFS } from './stone-config.js';

const MAX_POWER = 4;
const FORM_BY_SLOT = Object.freeze({
  HEAD: ['horn', 'crest', 'antenna', 'crown', 'bud'],
  TORSO: ['shell', 'hump', 'ribcage', 'sac', 'plate'],
  ARMS: ['whip', 'fist', 'tendril', 'claw', 'fan'],
  LEGS: ['snailfoot', 'stilt', 'root', 'talon', 'column'],
});

function slotPower(stone) {
  return STONE_DEFS[stone.rarity].power;
}

export function formFor(stone) {
  const forms = FORM_BY_SLOT[stone.slot] ?? FORM_BY_SLOT.TORSO;
  return forms[stone.visual.variant % forms.length];
}

export function counterScales(stones) {
  const total = stones.reduce((sum, stone) => sum + slotPower(stone), 0);
  const peak = stones.reduce((max, stone) => Math.max(max, slotPower(stone)), 0);
  return Object.fromEntries(
    stones.map((stone) => {
      const share = total > 0 ? slotPower(stone) / total : 0;
      const balance = peak > 0 ? slotPower(stone) / peak : 0;
      return [stone.slot, { share, balance, grow: 0.8 + balance * 0.6 }];
    }),
  );
}

export function torsoScale(stones, scales) {
  const load = stones.reduce((sum, stone) => sum + (scales[stone.slot]?.balance ?? 0), 0);
  return 0.85 + Math.min(0.5, load * 0.12);
}

export function visualPower(stones) {
  if (stones.length === 0) return 0;
  return Math.min(MAX_POWER, stones.reduce((sum, stone) => sum + slotPower(stone), 0) / stones.length + 0.5);
}

export function emptySlots(stones) {
  const used = new Set(stones.map((stone) => stone.slot).filter(Boolean));
  return SLOT_ORDER.filter((slot) => !used.has(slot));
}