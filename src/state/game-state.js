/**
 * Der Startzustand des Slices: eine Wahrheit pro Ding — Welt, Hive, noch kein
 * Dungling, kein Bau, kein Abbau, Onboarding am Anfang. Der Hive beginnt mit
 * genau einem Extraktor Vorrat Essenz; sonst käme er nie in Gang.
 */
import { countFloorTiles, createWorld } from '../domain/world/grid.js';
import { createHive } from '../domain/entities/hive.js';
import { createOnboarding } from '../domain/onboarding/onboarding-state.js';
import { START_ESSENCE } from '../domain/buildings/building-config.js';

export function createInitialGameState() {
  const world = createWorld();
  return {
    world,
    hive: createHive(),
    /** Der Schwarm: erst einer, später viele — in Reihenfolge. */
    dunglings: [],
    /** Essenz im Hive: die Währung jedes Baus. */
    essence: START_ESSENCE,
    buildings: [],
    buildChoice: null,
    selectedBuildingId: null,
    popups: [],
    popupSeq: 0,
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
