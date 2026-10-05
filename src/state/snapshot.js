/** Die Tür zum Speichern: gespeichert wird der Spielstand, nicht die Welt. */
import { createWorld } from '../domain/world/grid.js';
import { parseTileId } from '../domain/world/tile.js';
import { SNAPSHOT_KEY, SNAPSHOT_VERSION } from './snapshot-config.js';

/** Die abgeleitete Welt hängt nur an Seed und Maß, also wird sie gehalten. */
function seedWorld(world) {
  const spawnTile = world.spawnTileId ? parseTileId(world.spawnTileId) : null;
  const key = `${world.seed}/${world.width}x${world.height}/${world.hiveOrigin.x},${world.hiveOrigin.y}`;
  if (!WORLD_CACHE.has(key)) {
    WORLD_CACHE.set(key, createWorld({ width: world.width, height: world.height, hiveOrigin: world.hiveOrigin, spawnTile, seed: world.seed }));
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

/** Gepackt wird gegen die frisch abgeleitete Welt, nicht nach Sichtbarkeit:
 *  333 Vorrats-Zellen liegen im Raster, davon sind die meisten noch verborgen. */
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

function isMap(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSavedShape(state) {
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
    Number.isInteger(state.world?.hiveOrigin?.x)
  );
}

export function packState(state) {
  return { ...state, world: { ...state.world, tiles: packTiles(state.world) } };
}

export function unpackState(state) {
  return { ...state, world: { ...state.world, tiles: unpackTiles(state.world, state.world.tiles) } };
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

/** Was Konsole und Szenarienlauf brauchen: denselben Zugang, aber nur im Dev-Bau. */
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