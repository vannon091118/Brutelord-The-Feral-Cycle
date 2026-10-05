// @doc: docs/daten/economy/essence-economy.md#essence-economy
export const ESSENCE_ECONOMY = Object.freeze({
  miningCost: 1,
  hiveEveryMs: 10000,
  hiveYield: 1,
  hiveBudget: 25,
});

export function canPayForMining(essence) {
  return essence >= ESSENCE_ECONOMY.miningCost;
}

export function hiveHasBudget(hive) {
  return hive.pressed < ESSENCE_ECONOMY.hiveBudget;
}

export function hiveYieldFor(hive, dtMs) {
  if (!hiveHasBudget(hive)) return 0;
  const ticks = Math.floor(Math.max(0, dtMs) / ESSENCE_ECONOMY.hiveEveryMs);
  return Math.min(ticks, ESSENCE_ECONOMY.hiveBudget - hive.pressed) * ESSENCE_ECONOMY.hiveYield;
}

export function hiveRemainderMs(dtMs) {
  return Math.max(0, dtMs) % ESSENCE_ECONOMY.hiveEveryMs;
}