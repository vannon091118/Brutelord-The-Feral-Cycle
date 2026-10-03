import { TILE_SIZE } from '../domain/world/world-config.js';
import { ONBOARDING_STATE } from '../domain/onboarding/onboarding-state.js';
import { DungeonWorld } from '../world/DungeonWorld.jsx';
import { useStageScale } from './use-stage-scale.js';
import { TileActionMenu } from './TileActionMenu.jsx';
import { menuPositionFor } from './menu-position.js';

/**
 * Die Bühne: Welt plus Kontextmenü. Sie messt die verfügbare Fläche und legt
 * das Menü im DOM über die passende Stelle der skalierten Welt.
 */
export function GameStage({ game, actions }) {
  const { attach, scale, world } = useStageScale(TILE_SIZE);
  const menuOpen =
    game.onboarding.state === ONBOARDING_STATE.ACTION_MENU && Boolean(game.selectedTileId);

  return (
    <div ref={attach} className="relative flex min-h-0 w-full flex-1 items-center justify-center p-2">
      <div className="relative" style={{ width: world.width * scale, height: world.height * scale }}>
        <DungeonWorld game={game} actions={actions} tileSize={TILE_SIZE} scale={scale} />

        {menuOpen ? (
          <TileActionMenu
            {...menuPositionFor({
              tileId: game.selectedTileId,
              size: world,
              scale,
              tileSize: TILE_SIZE,
            })}
            onMine={actions.orderMining}
            onClose={actions.clearSelection}
          />
        ) : null}
      </div>
    </div>
  );
}
