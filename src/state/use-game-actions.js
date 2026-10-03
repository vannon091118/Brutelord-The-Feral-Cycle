/**
 * Die Befehle des Spielers. Die UI ruft sie auf — was daraus entsteht,
 * entscheidet der Reducer.
 */
import { useMemo } from 'react';
import { ACTION } from '../domain/actions/action-types.js';

export function useGameActions(dispatch) {
  return useMemo(
    () => ({
      clickHive: () => dispatch({ type: ACTION.HIVE_CLICKED }),
      clickTile: (tileId) => dispatch({ type: ACTION.TILE_SELECTED, tileId }),
      clearSelection: () => dispatch({ type: ACTION.TILE_SELECTION_CLEARED }),
      orderMining: () => dispatch({ type: ACTION.MINING_ORDERED }),
      chooseBuild: (buildingType) => dispatch({ type: ACTION.BUILD_CHOSEN, buildingType }),
      placeBuild: (tileId) => dispatch({ type: ACTION.BUILDING_PLACED, tileId }),
      selectBuilding: (buildingId) => dispatch({ type: ACTION.BUILDING_SELECTED, buildingId }),
      clearBuilding: () => dispatch({ type: ACTION.BUILDING_DESELECTED }),
      assignWorker: (buildingId) => dispatch({ type: ACTION.WORKER_ASSIGNED, buildingId }),
      releaseWorker: (buildingId) => dispatch({ type: ACTION.WORKER_RELEASED, buildingId }),
    }),
    [dispatch],
  );
}
