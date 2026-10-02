/**
 * All timing of the slice is configuration.
 * Components must never invent durations - they read them from here.
 */
export const ONBOARDING_CONFIG = {
  /** Hive mutation reaction after the first click. */
  hiveMutationMs: 1100,

  /** The first dungling appears exactly this long after the hive finished mutating. */
  dunglingSpawnDelayMs: 5000,

  /** The dungling walks to the selected tile. */
  workerMoveDurationMs: 500,

  /** How long the worker digs one earth block. */
  miningDurationMs: 3500,

  /** Simulation step used to advance mining. */
  miningTickMs: 100,

  /** The crumbled earth block falls apart... */
  tileDestroyedPauseMs: 700,

  /** ...before it counts as usable dungeon floor. */
  gridExpandDelayMs: 260,

  /** Small beat before the build menu slides in. */
  buildMenuDelayMs: 420,

  /** Ambient life. */
  idleLoopMs: 2600,
};