/**
 * Der Dungling: kleines arbeitendes Wesen. Kennt seinen Zustand, sein Tile und
 * seinen Auftrag — aber keine Grafik und keine Timings.
 */
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
    /** Was er gerade tut: ein Auftrag oder nichts. */
    job: null,
  };
}

/** Der Schwarm zählt seine Arbeiter — die Nummer ist der nächste freie Platz. */
export function nextDunglingId(dunglings) {
  return `dungling-${dunglings.length + 1}`;
}

export function tilePositionPx(tile, tileSize = TILE_SIZE) {
  return { x: (tile.x + 0.5) * tileSize, y: (tile.y + 0.5) * tileSize };
}

export function dunglingPositionPx(dungling, tileSize = TILE_SIZE) {
  return tilePositionPx(dungling.tile, tileSize);
}

/**
 * Wo der Dungling gerade steht: mitten auf dem Weg, wenn er läuft. Die
 * Wahrheit ist das Tile — die Zwischenposition ist Darstellung, und sie kommt
 * aus dem Auftrag, nicht aus einer Uhr.
 */
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

/** Laufbefehl: Der Dungling übernimmt das Ziel-Tile sichtbar als Position. */
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

/** Ein neuer Auftrag: Zustand, Tile und Blickrichtung folgen der Phase. */
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
