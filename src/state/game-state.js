/**
 * Der Startzustand des Slices: eine Wahrheit pro Ding —
 * Welt, Hive, kein Dungling, kein Abbau, Onboarding am Anfang.
 */
import { countFloorTiles, createWorld } from '../domain/world/grid.js';
import { createHive } from '../domain/entities/hive.js';
import { createOnboarding } from '../domain/onboarding/onboarding-state.js';

export function createInitialGameState() {
  const world = createWorld();
  return {
    world,
    hive: createHive(),
    dungling: null,
    mining: null,
    onboarding: createOnboarding(),
    selectedTileId: null,
    highlightedTileId: null,
    expansion: null,
    lastDestroyedTileId: null,
    usableTileCount: countFloorTiles(world),
    buildMenuVisible: false,
  };
}
