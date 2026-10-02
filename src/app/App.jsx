import { ACTION_TYPES } from '../domain/actions/action-types.js';
import { STAGE } from '../domain/onboarding/onboarding-state.js';
import { usableTileCount } from '../domain/world/grid.js';
import { useGame, useGameClock } from '../state/game-reducer.js';
import BuildMenu from '../ui/BuildMenu.jsx';
import OnboardingHint from '../ui/OnboardingHint.jsx';
import TileActionMenu from '../ui/TileActionMenu.jsx';
import DungeonWorld from '../world/DungeonWorld.jsx';

/**
 * Composition only.
 * The UI dispatches actions, the reducer decides, the world renders.
 */
export default function App() {
  const [state, dispatch] = useGame();
  useGameClock(state, dispatch);

  const selectedTile = state.selectedTileId ? state.grid.tiles[state.selectedTileId] : null;
  const buildTile = state.buildTileId ? state.grid.tiles[state.buildTileId] : null;

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-[#0b0906]">
      <div className="absolute inset-0 flex items-center justify-center px-3 pb-20 sm:pb-16">
        <div className="relative aspect-square w-[min(92vw,82vh,34rem)]">
          <DungeonWorld state={state} dispatch={dispatch} />

          {state.stage === STAGE.ACTION_MENU && selectedTile ? (
            <TileActionMenu
              tile={selectedTile}
              onMine={() => dispatch({ type: ACTION_TYPES.MINING_COMMAND })}
              onClose={() => dispatch({ type: ACTION_TYPES.ACTION_MENU_CLOSED })}
            />
          ) : null}

          {state.buildMenuOpen && buildTile ? (
            <BuildMenu
              tile={buildTile}
              usableTiles={usableTileCount(state.grid)}
              onClose={() => dispatch({ type: ACTION_TYPES.BUILD_MENU_CLOSED })}
            />
          ) : null}
        </div>
      </div>

      <OnboardingHint
        stage={state.stage}
        onReset={
          state.stage === STAGE.BUILD_MENU_VISIBLE || state.stage === STAGE.SLICE_COMPLETE
            ? () => dispatch({ type: ACTION_TYPES.RESET })
            : undefined
        }
      />
    </main>
  );
}