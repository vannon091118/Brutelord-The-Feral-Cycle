// @doc: docs/daten/state/snapshot.md#snapshot
import { createWorld } from '../domain/world/grid.js';
import { parseTileId } from '../domain/world/tile.js';
import { SNAPSHOT_KEY, SNAPSHOT_VERSION } from './snapshot-config.js';

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

export function readSavedState(playerseed) {
  if (typeof window === 'undefined') return null;
  let parsed;
  try {
    parsed = JSON.parse(window.localStorage.getItem(SNAPSHOT_KEY) ?? 'null');
  } catch {
    return null;
  }
  if (parsed?.version !== SNAPSHOT_VERSION || parsed.seed !== playerseed) return null;
  return isSavedShape(parsed.state) ? unpackState(parsed.state) : null;
}

export function saveSnapshot(state, playerseed) {
  window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ version: SNAPSHOT_VERSION, seed: playerseed, state: packState(state) }));
  return state;
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