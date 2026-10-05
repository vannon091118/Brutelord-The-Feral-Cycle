// @doc: docs/daten/entities/hive.md#hive
import { HIVE_ORIGIN, HIVE_SIZE } from '../world/world-config.js';

export const HIVE_PHASE = Object.freeze({
  DORMANT: 'DORMANT',
  MUTATING: 'MUTATING',
  SETTLED: 'SETTLED',
});

export function createHive(origin = HIVE_ORIGIN) {
  return {
    id: 'hive-1',
    origin: { ...origin },
    size: { ...HIVE_SIZE },
    phase: HIVE_PHASE.DORMANT,
    spawned: 0,
    pressed: 0,
    progressMs: 0,
  };
}

export function canMutate(hive) {
  return hive.phase === HIVE_PHASE.DORMANT;
}

export function startMutation(hive) {
  return canMutate(hive) ? { ...hive, phase: HIVE_PHASE.MUTATING } : hive;
}

export function settleHive(hive) {
  return { ...hive, phase: HIVE_PHASE.SETTLED };
}
