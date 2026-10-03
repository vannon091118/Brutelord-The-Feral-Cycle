import { BuildMenu } from './BuildMenu.jsx';
import { BuildingPanel } from './BuildingPanel.jsx';
import { OnboardingHint } from './OnboardingHint.jsx';

/**
 * Das HUD unten: das ausgewählte Bauwerk, das Baumenü (erst nach dem ersten
 * freien Boden) und die Hinweiszeile. Alle drei lesen nur, was im Reducer
 * passiert ist — keiner von ihnen entscheidet etwas.
 */
function SelectedBuilding({ building, freeWorkers, actions }) {
  return (
    <div className="pointer-events-auto">
      <BuildingPanel
        building={building}
        freeWorkers={freeWorkers}
        onAssign={() => actions.assignWorker(building.id)}
        onRelease={() => actions.releaseWorker(building.id)}
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
  const freeWorkers = game.dunglings.filter((worker) => !worker.job).length;

  return (
    <div className="pointer-events-none relative z-10 flex w-full flex-col items-center gap-2 px-3 pb-3">
      {selected ? (
        <SelectedBuilding building={selected} freeWorkers={freeWorkers} actions={actions} />
      ) : null}
      {game.buildMenuVisible ? <BuildMenuSlot game={game} actions={actions} /> : null}
      <div className="pointer-events-auto">
        <OnboardingHint
          onboarding={game.onboarding}
          usableTileCount={game.usableTileCount}
          essence={game.essence}
        />
      </div>
    </div>
  );
}
