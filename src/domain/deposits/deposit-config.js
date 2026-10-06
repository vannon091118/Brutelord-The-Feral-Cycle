// @doc: docs/daten/deposits/deposit-config.md#deposit-config
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

export const ESSENCE_STAGE = Object.freeze({
  RICH: 'RICH',
  MEDIUM: 'MEDIUM',
  LEAN: 'LEAN',
  DEAD: 'DEAD',
});

export const STAGE_MIN_SHARE = Object.freeze({
  RICH: 0.75,
  MEDIUM: 0.25,
  LEAN: 0.01,
  DEAD: 0,
});

export const CLUSTER_COUNT_MIN = 120;
export const CLUSTER_COUNT_MAX = 200;
const WORLD_ESSENCE_BUDGET = 8860;
const WORLD_ESSENCE_TOLERANCE = 0.25;

export const DEPOSIT_DEPTH = Object.freeze({ gainPerFloor: 0.25 });

export function depthGain(depth = 0) {
  return Number.isInteger(depth) && depth > 0 ? depth * DEPOSIT_DEPTH.gainPerFloor : 0;
}

export function capacityAtDepth(capacity, depth = 0) {
  return Math.round(capacity * (1 + depthGain(depth)));
}

export function capacityCeilingFor(depth = 0) {
  return capacityAtDepth(DEPOSIT_CONFIG.capacityMax, depth);
}

export function essenceBudget(depth = 0) {
  const growth = 1 + depthGain(depth);
  return {
    floor: Math.round(WORLD_ESSENCE_BUDGET * (1 - WORLD_ESSENCE_TOLERANCE) * growth),
    ceiling: Math.round(WORLD_ESSENCE_BUDGET * (1 + WORLD_ESSENCE_TOLERANCE) * growth),
  };
}

export function hiveDistance({ x, y, hiveOrigin, hiveSize }) {
  const dx = Math.max(hiveOrigin.x - x, x - (hiveOrigin.x + hiveSize.width - 1), 0);
  const dy = Math.max(hiveOrigin.y - y, y - (hiveOrigin.y + hiveSize.height - 1), 0);
  return Math.max(dx, dy);
}
