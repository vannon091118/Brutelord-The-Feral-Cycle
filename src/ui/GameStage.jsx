import { TILE_SIZE, viewportPixelSize } from '../domain/world/world-config.js';
import { ONBOARDING_STATE } from '../domain/onboarding/onboarding-state.js';
import { DungeonWorld } from '../world/DungeonWorld.jsx';
import { cameraBox } from '../world/world-view.js';
import { useStageScale } from './use-stage-scale.js';
import { TileActionMenu } from './TileActionMenu.jsx';
import { menuPositionFor } from './menu-position.js';

// @doc: docs/daten/ui/gamestage.md#gamestage
export function GameStage({ game, actions }) {
  const { attach, scale, stage } = useStageScale(TILE_SIZE);
  const menuOpen =
    game.onboarding.state === ONBOARDING_STATE.ACTION_MENU && Boolean(game.selectedTileId);
  const camera = menuOpen
    ? cameraBox({ world: game.world, tileSize: TILE_SIZE, viewport: viewportPixelSize(TILE_SIZE) })
    : null;

  return (
    <div ref={attach} className="relative flex min-h-0 w-full flex-1 items-center justify-center p-2">
      <div className="relative" style={{ width: stage.width * scale, height: stage.height * scale }}>
        <DungeonWorld game={game} actions={actions} tileSize={TILE_SIZE} scale={scale} />

        {menuOpen ? (
          <TileActionMenu
            {...menuPositionFor({ tileId: game.selectedTileId, camera, scale, tileSize: TILE_SIZE })}
            onMine={actions.orderMining}
            onClose={actions.clearSelection}
          />
        ) : null}
      </div>
    </div>
  );
}