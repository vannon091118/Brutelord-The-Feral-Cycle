import { memo } from 'react';
import { worldView } from './world-view.js';
import { WorldContext, WorldVignette } from './WorldContext.jsx';
import { TileLayer } from './TileLayer.jsx';
import { HiveNode } from './HiveNode.jsx';
import { WorkerLayer } from './WorkerLayer.jsx';
import { EntranceLadder } from './entrance/EntranceLadder.jsx';

// @doc: docs/daten/world/dungeonworld.md#dungeonworld
export const DungeonWorld = memo(function DungeonWorld({ game, actions, tileSize, scale }) {
  const view = worldView({ game, tileSize });
  const kick = view.workingTileId ? view.workingStep : null;
  return (
    <div key={kickKey(kick)} {...kickProps(kick)}>
      <svg {...worldSvgProps(view.camera, scale)}>
        <WorldContext view={view} onBackgroundClick={actions.clearSelection} />
        <TileLayer {...tileLayerProps({ game, view, tileSize, actions })} />
        <EntranceLadder
          world={game.world}
          camera={view.camera}
          tileSize={tileSize}
          cycle={game.economy}
          buildings={game.buildings}
          onClimb={actions.climbLadder}
        />
        <HiveNode {...hiveProps(game, tileSize, actions)} />
        <WorkerLayer workers={view.workers} popups={view.popups} tileSize={tileSize} />
        <WorldVignette camera={view.camera} />
      </svg>
    </div>
  );
});

function kickKey(kick) {
  return kick === null ? 'still' : `kick-${kick}`;
}

function kickProps(kick) {
  return {
    className: kick === null ? undefined : 'dl-camera-kick',
    style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  };
}

function worldSvgProps(camera, scale) {
  return {
    viewBox: `${camera.x} ${camera.y} ${camera.width} ${camera.height}`,
    width: camera.width,
    height: camera.height,
    style: { position: 'absolute', top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: 'top left' },
    role: 'img',
    'aria-label': 'Brutelord: The Feral Cycle — Spielfeld',
  };
}

function tileLayerProps({ game, view, tileSize, actions }) {
  return {
    view,
    tileSize,
    selectedTileId: game.selectedTileId,
    highlightedTileId: game.highlightedTileId,
    onSelect: actions.clickTile,
    onPlace: actions.placeBuild,
    onSelectBuilding: actions.selectBuilding,
  };
}

function hiveProps(game, tileSize, actions) {
  return {
    hive: game.hive,
    tileSize,
    onboardingState: game.onboarding.state,
    onClick: actions.clickHive,
  };
}
