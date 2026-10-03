/** Vorräte unter der Erde: Zustände, Größen, Kapazität, Weltbudget. */
export const DEPOSIT_PHASE = Object.freeze({
  BURIED: 'BURIED',
  HINTED: 'HINTED',
  FOUND: 'FOUND',
  SPENT: 'SPENT',
});

export const DEPOSIT_CONFIG = Object.freeze({
  blockStride: 4,
  innerInset: 1,
  sizeMin: 1,
  sizeMax: 3,
  capacityPerTile: 40,
  capacityPerExtraTile: 20,
  capacityMax: 100,
  skipPerMille: 350,
  hiveExclusion: 6,
});

export const CLUSTER_COUNT_MIN = 120;
export const CLUSTER_COUNT_MAX = 200;
export const WORLD_ESSENCE_BUDGET = 8860;

export function hiveDistance({ x, y, hiveOrigin, hiveSize }) {
  const dx = Math.max(hiveOrigin.x - x, x - (hiveOrigin.x + hiveSize.width - 1), 0);
  const dy = Math.max(hiveOrigin.y - y, y - (hiveOrigin.y + hiveSize.height - 1), 0);
  return Math.max(dx, dy);
}
