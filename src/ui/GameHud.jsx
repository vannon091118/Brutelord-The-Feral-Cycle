import { BuildMenu } from './BuildMenu.jsx';
import { BuildingPanel } from './BuildingPanel.jsx';
import { OnboardingHint } from './OnboardingHint.jsx';

// @doc: docs/daten/ui/gamehud.md#gamehud
function SelectedBuilding({ building, game, actions }) {
  return (
    <div className="pointer-events-auto">
      <BuildingPanel
        building={building}
        lab={game.lab}
        essence={game.essence}
        dunglings={game.dunglings}
        freeWorkers={game.dunglings.filter((worker) => !worker.job).length}
        onAssign={() => actions.assignWorker(building.id)}
        onRelease={() => actions.releaseWorker(building.id)}
        onOpenLab={actions.openLab}
        onBuyStone={actions.buyStone}
        onPlaceStone={actions.placeStone}
        onCreateMutant={actions.createMutant}
        onRevertMutant={actions.revertMutant}
        onClose={actions.clearBuilding}
      />
    </div>
  );
}

function BuildMenuSlot({ game, actions }) {
  return (
    <div className="pointer-events-auto">
      <BuildMenu
        essence={game.essence}
        usableTileCount={game.usableTileCount}
        buildings={game.buildings}
        buildChoice={game.buildChoice}
        onChoose={actions.chooseBuild}
      />
    </div>
  );
}

export function GameHud({ game, actions }) {
  const selected = game.buildings.find((building) => building.id === game.selectedBuildingId) ?? null;

  return (
    <div className="pointer-events-none relative z-10 flex w-full flex-col items-center gap-2 px-3 pb-3">
      {selected ? <SelectedBuilding building={selected} game={game} actions={actions} /> : null}
      {game.buildMenuVisible ? <BuildMenuSlot game={game} actions={actions} /> : null}
      <div className="pointer-events-auto">
        <OnboardingHint
          onboarding={game.onboarding}
          usableTileCount={game.usableTileCount}
          essence={game.essence}
          depth={game.world.depth}
          cycle={game.economy}
          onDescend={actions.descend}
        />
      </div>
    </div>
  );
}
