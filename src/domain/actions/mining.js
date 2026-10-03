/**
 * Abbau-Logik: Wer darf was abbauen, wie weit ist der Abbau, welchen Zustand
 * zeigt die Erde dabei. Alles hier ist reine Domänenlogik.
 */
import { ONBOARDING_CONFIG } from '../onboarding/onboarding-config.js';
import {
  EARTH_HEALTH,
  FLOOR_ORIGIN,
  createFloorTile,
  isEarth,
  isUsable,
  isVisible,
} from '../world/tile.js';
import { getTile, neighborIds } from '../world/grid.js';

export const MINING_PHASE = Object.freeze({
  IDLE: 'IDLE',
  MOVING: 'MOVING',
  WORKING: 'WORKING',
  COMPLETE: 'COMPLETE',
});

/** Die Sim-Uhr tickt in definierten Schritten — kein Date.now() als Wahrheit. */
export function miningTotalTicks(config = ONBOARDING_CONFIG) {
  return Math.max(1, Math.round(config.miningDurationMs / config.miningTickMs));
}

/**
 * Fortschritt → sichtbarer Erd-Zustand.
 * 0–45 % HEALTHY, 45–80 % TOUCHED, 80–100 % CRITICAL.
 */
export function earthHealthForProgress(progress, config = ONBOARDING_CONFIG) {
  const { touched, critical } = config.earthStateThresholds;
  if (progress >= 1) return EARTH_HEALTH.DESTROYED;
  if (progress >= critical) return EARTH_HEALTH.CRITICAL;
  if (progress >= touched) return EARTH_HEALTH.TOUCHED;
  return EARTH_HEALTH.HEALTHY;
}

export function createMiningJob(tileId, config = ONBOARDING_CONFIG) {
  return {
    tileId,
    phase: MINING_PHASE.MOVING,
    progress: 0,
    tick: 0,
    totalTicks: miningTotalTicks(config),
    /** Zählt die sichtbaren Partikel-Bursts (rein visuell, deterministisch). */
    burstCount: 0,
  };
}

/** Ein Tick Arbeit. Fortschritt entsteht aus Ticks, nicht aus der Uhr. */
export function advanceMiningJob(job) {
  const tick = Math.min(job.tick + 1, job.totalTicks);
  return { ...job, tick, progress: tick / job.totalTicks };
}

export function isMiningFinished(job) {
  return job.tick >= job.totalTicks || job.progress >= 1;
}

/** Erde, die sichtbar ist und deshalb abgebaut werden kann. */
export function isMineableEarth(world, id) {
  const tile = getTile(world, id);
  return Boolean(tile) && isEarth(tile) && isVisible(tile);
}

/** Grenzt der Block an nutzbaren Raum? Nur dann ist er erreichbar. */
export function touchesUsableSpace(world, id) {
  return neighborIds(world, id).some((nid) => {
    const neighbor = getTile(world, nid);
    return Boolean(neighbor) && isUsable(neighbor);
  });
}

export function canMineTile(world, id) {
  return isMineableEarth(world, id) && touchesUsableSpace(world, id);
}

/** Erdblöcke, die für den Spieler gerade eine sinnvolle Aktion sind. */
export function mineableFrontierIds(world) {
  return Object.keys(world.tiles).filter((id) => canMineTile(world, id));
}

export function minedFloorTile(tile) {
  return createFloorTile(tile.x, tile.y, FLOOR_ORIGIN.MINED);
}
