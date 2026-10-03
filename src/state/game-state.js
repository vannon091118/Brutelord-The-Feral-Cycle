/** Der Startzustand des Slices. */
import { countFloorTiles, createWorld } from '../domain/world/grid.js';
import { createHive } from '../domain/entities/hive.js';
import { createOnboarding } from '../domain/onboarding/onboarding-state.js';
import { START_ESSENCE } from '../domain/buildings/building-config.js';

export function createInitialGameState() {
  const world = createWorld();
  return {
    world,
    hive: createHive(),
    dunglings: [],
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
    lastHarvest: null,
    usableTileCount: countFloorTiles(world),
    buildMenuVisible: false,
  };
}
