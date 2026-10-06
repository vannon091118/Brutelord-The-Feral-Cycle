// @doc: docs/daten/state/snapshot.md#snapshot
import { createWorld } from '../domain/world/grid.js';
import { parseTileId } from '../domain/world/tile.js';
import { SNAPSHOT_KEY, SNAPSHOT_MAX_BYTES, SNAPSHOT_REVISION_FIELD, SNAPSHOT_REVISION_KEY, SNAPSHOT_VERSION } from './snapshot-config.js';
import { SNAPSHOT_WRITE, envelopeBytes, writeDecision } from './snapshot-rule.js';

let lastPayload = null;

function seedWorld(world) {
  const spawnTile = world.spawnTileId ? parseTileId(world.spawnTileId) : null;
  const key = `${world.seed}/${world.width}x${world.height}/${world.hiveOrigin.x},${world.hiveOrigin.y}/${world.depth}`;
  if (!WORLD_CACHE.has(key)) {
    WORLD_CACHE.set(key, createWorld({ width: world.width, height: world.height, hiveOrigin: world.hiveOrigin, spawnTile, seed: world.seed, depth: world.depth }));
  }
  return WORLD_CACHE.get(key);
}

const WORLD_CACHE = new Map();

function sameValue(left, right) {
  if (left === right) return true;
  if (typeof left !== 'object' || typeof right !== 'object' || left === null || right === null) return false;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length && keys.every((key) => sameValue(left[key], right[key]));
}

function packTiles(world) {
  const fresh = seedWorld(world).tiles;
  const changed = {};
  world.tiles.forEach((tile, index) => {
    if (tile && !sameValue(tile, fresh[index])) changed[tile.id] = tile;
  });
  return changed;
}

function unpackTiles(world, changed) {
  const tiles = seedWorld(world).tiles.slice();
  for (const id of Object.keys(changed)) {
    const { x, y } = parseTileId(id);
    tiles[y * world.width + x] = changed[id];
  }
  return tiles;
}

function packDeposits(world) {
  const fresh = seedWorld(world).deposits;
  const changed = {};
  for (const id of Object.keys(world.deposits ?? {})) {
    const deposit = world.deposits[id];
    const base = fresh[id];
    if (deposit.phase !== base?.phase || deposit.pool !== base?.pool) {
      changed[id] = { phase: deposit.phase, pool: deposit.pool };
    }
  }
  return changed;
}

function unpackDeposits(world, changed) {
  const deposits = { ...seedWorld(world).deposits };
  for (const id of Object.keys(changed ?? {})) {
    deposits[id] = { ...deposits[id], ...changed[id] };
  }
  return deposits;
}

function isMap(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isSavedShape(state) {
  return (
    Number.isInteger(state.essence) &&
    Array.isArray(state.dunglings) &&
    Array.isArray(state.buildings) &&
    Array.isArray(state.popups) &&
    Boolean(state.onboarding?.state) &&
    Array.isArray(state.onboarding?.trail) &&
    isMap(state.world?.tiles) &&
    isMap(state.world?.deposits) &&
    Number.isInteger(state.world?.seed) &&
    Number.isInteger(state.world?.depth) &&
    Number.isInteger(state.world?.hiveOrigin?.x)
  );
}

export function packState(state) {
  const world = state.world;
  return { ...state, world: { ...world, tiles: packTiles(world), deposits: packDeposits(world) } };
}

export function unpackState(state) {
  const world = state.world;
  return {
    ...state,
    world: {
      ...world,
      tiles: unpackTiles(world, world.tiles),
      deposits: unpackDeposits(world, world.deposits),
    },
  };
}

export function buildEnvelope({ state, playerseed, revision = 1 }) {
  return { version: SNAPSHOT_VERSION, seed: playerseed, [SNAPSHOT_REVISION_FIELD]: revision, state: packState(state) };
}

export function unpackEnvelope(envelope, playerseed) {
  if (envelope?.version !== SNAPSHOT_VERSION || envelope.seed !== playerseed) return null;
  return isSavedShape(envelope.state) ? unpackState(envelope.state) : null;
}

function storedRevision() {
  const stored = Number(window.localStorage.getItem(SNAPSHOT_REVISION_KEY) ?? '0');
  return Number.isInteger(stored) && stored > 0 ? stored : null;
}

function nextRevision() {
  const stored = storedRevision();
  return stored === null ? 1 : stored + 1;
}

function payloadOf(envelope) {
  return JSON.stringify(envelope.state);
}

function store(envelope) {
  window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(envelope));
  window.localStorage.setItem(SNAPSHOT_REVISION_KEY, String(envelope.revision));
  lastPayload = payloadOf(envelope);
  return true;
}

function saveEnvelope(envelope) {
  const decision = writeDecision({
    bytes: envelopeBytes(envelope),
    storedRevision: storedRevision(),
    incomingRevision: envelope.revision,
    maxBytes: SNAPSHOT_MAX_BYTES,
  });
  return decision === SNAPSHOT_WRITE.ok ? store(envelope) : false;
}

export function readSavedState(playerseed) {
  if (typeof window === 'undefined') return null;
  let parsed;
  try {
    parsed = JSON.parse(window.localStorage.getItem(SNAPSHOT_KEY) ?? 'null');
  } catch {
    return null;
  }
  lastPayload = parsed?.state ? JSON.stringify(parsed.state) : null;
  return unpackEnvelope(parsed, playerseed);
}

export function saveSnapshot(state, playerseed) {
  if (typeof window === 'undefined') return state;
  saveEnvelope(buildEnvelope({ state, playerseed, revision: nextRevision() }));
  return state;
}

export function writeIfChanged(state, playerseed) {
  const envelope = buildEnvelope({ state, playerseed, revision: nextRevision() });
  if (payloadOf(envelope) === lastPayload) return false;
  return saveEnvelope(envelope);
}

export function clearSnapshot() {
  window.localStorage.removeItem(SNAPSHOT_KEY);
}

export function openTestDoor({ latest, playerseed }) {
  if (!import.meta.env?.DEV) return;
  window.__dl = {
    get state() {
      return latest.current;
    },
    save: () => saveSnapshot(latest.current, playerseed),
    clear: clearSnapshot,
  };
}