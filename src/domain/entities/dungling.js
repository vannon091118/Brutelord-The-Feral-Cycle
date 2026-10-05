// @doc: docs/daten/entities/dungling.md#dungling
import { TILE_SIZE } from '../world/world-config.js';
import { jobTrip } from '../labour/jobs.js';

export const DUNGLING_STATE = Object.freeze({
  NONE: 'NONE',
  SPAWNING: 'SPAWNING',
  IDLE: 'IDLE',
  MOVING: 'MOVING',
  WORKING: 'WORKING',
});

export function createDungling({ tile, facing = 1, id = 'dungling-1' }) {
  return {
    id,
    tile: { ...tile },
    facing,
    state: DUNGLING_STATE.NONE,
    targetTileId: null,
    job: null,
    stones: [],
    invested: 0,
    battleEp: 0,
  };
}

export function nextDunglingId(dunglings) {
  return `dungling-${dunglings.length + 1}`;
}

export function tilePositionPx(tile, tileSize = TILE_SIZE) {
  return { x: (tile.x + 0.5) * tileSize, y: (tile.y + 0.5) * tileSize };
}

export function workerPositionPx(worker, tileSize = TILE_SIZE) {
  const trip = jobTrip(worker.job);
  if (!trip) return tilePositionPx(worker.tile, tileSize);
  return tilePositionPx(
    { x: trip.from.x + (trip.to.x - trip.from.x) * trip.progress, y: trip.from.y + (trip.to.y - trip.from.y) * trip.progress },
    tileSize,
  );
}

export function startSpawning(dungling) {
  return { ...dungling, state: DUNGLING_STATE.SPAWNING };
}

export function idle(dungling) {
  return { ...dungling, state: DUNGLING_STATE.IDLE, targetTileId: null };
}

export function walkTo(dungling, targetTile) {
  const facing = targetTile.x >= dungling.tile.x ? 1 : -1;
  return {
    ...dungling,
    state: DUNGLING_STATE.MOVING,
    tile: { x: targetTile.x, y: targetTile.y },
    targetTileId: targetTile.id,
    facing,
  };
}

export function startWork(dungling) {
  return { ...dungling, state: DUNGLING_STATE.WORKING };
}

const JOB_STATE = Object.freeze({
  FETCH: DUNGLING_STATE.WORKING,
  ATTEND: DUNGLING_STATE.WORKING,
  WORK: DUNGLING_STATE.WORKING,
  TRAVEL: DUNGLING_STATE.MOVING,
  RETURN: DUNGLING_STATE.MOVING,
});

export function withJob(worker, job) {
  if (!job) return { ...idle(worker), job: null };
  const trip = jobTrip(job);
  return {
    ...worker,
    job,
    state: JOB_STATE[job.phase] ?? DUNGLING_STATE.IDLE,
    tile: { x: trip.to.x, y: trip.to.y },
    targetTileId: null,
    facing: trip.to.x >= trip.from.x ? 1 : -1,
  };
}
