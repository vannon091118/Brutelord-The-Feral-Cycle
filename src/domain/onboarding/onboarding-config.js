/** Zeiten und Tuning-Werte des Onboardings. */
export const ONBOARDING_CONFIG = Object.freeze({
  hiveHitDurationMs: 320,

  hiveMutationDurationMs: 900,

  dunglingSpawnDelayMs: 5000,

  dunglingEmergeMs: 600,

  dunglingSettleMs: 500,

  workerMoveDurationMs: 500,

  miningDurationMs: 3500,

  miningTickMs: 100,

  tileDestructionMs: 700,

  gridExpansionMs: 600,

  earthStateThresholds: Object.freeze({ touched: 0.45, critical: 0.8 }),

  dunglingSpawnTile: Object.freeze({ x: 31, y: 33 }),

  firstEarthBlock: Object.freeze({ x: 32, y: 33 }),

  particleBurstIntervalMs: 240,
  particleLifetimeMs: 950,
  particlesPerBurst: 4,
});
