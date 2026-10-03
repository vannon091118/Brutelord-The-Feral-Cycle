/**
 * Das Labor des Brutlords: Inventar, belegte Slots und der Pity-Zähler.
 * Steine werden über ihren Seed identifiziert, nicht über ihre Position.
 */
import { BUILDING_TYPE } from '../buildings/building-config.js';
import { STONE_CONFIG, SLOT_ORDER } from './stone-config.js';
import { createStone, withSlot } from './stone-roll.js';

export function createLab() {
  return { stones: [], pityMisses: 0, purchased: 0, open: false };
}

export function stoneOf(lab, seed) {
  return lab.stones.find((stone) => stone.seed === seed) ?? null;
}

export function labIsFull(lab) {
  return lab.stones.length >= STONE_CONFIG.inventoryMax;
}

export function canAffordStone(essence) {
  return essence >= STONE_CONFIG.cost;
}

export function canOpenLab(buildings, selectedBuildingId) {
  return buildings.some(
    (building) => building.id === selectedBuildingId && building.type === BUILDING_TYPE.BRUTE_LORD,
  );
}

/** Der Kauf erzeugt den Seed und schreibt den Stein sofort fest. */
export function buyStone(lab, seed) {
  if (labIsFull(lab)) return lab;
  const stone = createStone({ seed, pityMisses: lab.pityMisses });
  return { ...lab, stones: [...lab.stones, stone], pityMisses: stone.pityMisses, purchased: lab.purchased + 1 };
}

export function nextSeed(lab) {
  return (lab.purchased + 1) * 2654435761 % 4294967296;
}

export function isDiscovered(lab, seed) {
  return Boolean(stoneOf(lab, seed)?.discovered);
}

export function stoneLabel(lab, stone) {
  return isDiscovered(lab, stone.seed) ? stoneName(stone) : '???';
}

function stoneName(stone) {
  return `${stone.rarity} ${stone.trait ?? 'ohne Trait'}`;
}

export function placeStone(lab, seed, slot) {
  if (!SLOT_ORDER.includes(slot)) return lab;
  const stone = stoneOf(lab, seed);
  if (!stone) return lab;
  return {
    ...lab,
    stones: lab.stones.map((entry) => (entry.seed === seed ? withSlot(entry, slot) : entry)),
  };
}

export function placedStones(lab) {
  return lab.stones.filter((stone) => stone.slot !== null);
}

export function labStoneCount(lab) {
  return lab.stones.length;
}