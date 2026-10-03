/**
 * Die Aktionen, die der zentrale Reducer versteht.
 * UI löst Aktionen aus — sie entscheidet nicht selbst über Spielzustand.
 */
export const ACTION = Object.freeze({
  /** Spieleraktionen */
  HIVE_CLICKED: 'HIVE_CLICKED',
  TILE_SELECTED: 'TILE_SELECTED',
  TILE_SELECTION_CLEARED: 'TILE_SELECTION_CLEARED',
  MINING_ORDERED: 'MINING_ORDERED',

  /** Von der Sim-Uhr ausgelöste Übergänge (Timings kommen aus der Config) */
  HIVE_MUTATION_SETTLED: 'HIVE_MUTATION_SETTLED',
  DUNGLING_SPAWNED: 'DUNGLING_SPAWNED',
  DUNGLING_EMERGED: 'DUNGLING_EMERGED',
  DUNGLING_READY: 'DUNGLING_READY',
  DUNGLING_REACHED_TILE: 'DUNGLING_REACHED_TILE',
  MINING_PROGRESS: 'MINING_PROGRESS',
  MINING_COMPLETED: 'MINING_COMPLETED',
  GRID_EXPANDED: 'GRID_EXPANDED',
  BUILD_MENU_SHOWN: 'BUILD_MENU_SHOWN',
  /** Takt der Verwurzelung: Farbe fadet, Tentakel kriechen, Felder werden frei. */
  ROOTING_TICK: 'ROOTING_TICK',

  /** Bauen: Bau wählen, Bauplatz setzen, Bauwerk auswählen, Dunglinge zuweisen. */
  BUILD_CHOSEN: 'BUILD_CHOSEN',
  BUILDING_PLACED: 'BUILDING_PLACED',
  BUILDING_SELECTED: 'BUILDING_SELECTED',
  BUILDING_DESELECTED: 'BUILDING_DESELECTED',
  WORKER_ASSIGNED: 'WORKER_ASSIGNED',
  WORKER_RELEASED: 'WORKER_RELEASED',

  /** Takt der Arbeit: Aufträge, Essenz, Brut und Bauplätze. */
  WORK_TICK: 'WORK_TICK',
});
