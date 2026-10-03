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
    }),
    [dispatch],
  );
}
