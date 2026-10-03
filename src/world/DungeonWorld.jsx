import { memo } from 'react';
import { worldView } from './world-view.js';
import { WorldContext, WorldVignette } from './WorldContext.jsx';
import { TileLayer } from './TileLayer.jsx';
import { HiveNode } from './HiveNode.jsx';
import { WorkerLayer } from './WorkerLayer.jsx';
import { EntranceLadder } from './entrance/EntranceLadder.jsx';

/**
 * Die Welt: 2D, direkter Vogelblick, handgemachte Flächen.
 * Diese Komponente schichtet nur die Ebenen — sie entscheidet nichts.
 * Das Bild ist ein Ausschnitt: die Kamera folgt dem, was der Hive gebaut hat.
 */
export const DungeonWorld = memo(function DungeonWorld({ game, actions, tileSize, scale }) {
  const view = worldView({ game, tileSize });
  return (
    <svg {...worldSvgProps(view.camera, scale)}>
      <WorldContext view={view} onBackgroundClick={actions.clearSelection} />
      <TileLayer {...tileLayerProps({ game, view, tileSize, actions })} />
      <EntranceLadder entrance={game.world.entrance} camera={view.camera} tileSize={tileSize} />
      <HiveNode {...hiveProps(game, tileSize, actions)} />
      <WorkerLayer workers={view.workers} popups={view.popups} tileSize={tileSize} />
      <WorldVignette camera={view.camera} />
    </svg>
  );
});

function worldSvgProps(camera, scale) {
  return {
    viewBox: `${camera.x} ${camera.y} ${camera.width} ${camera.height}`,
    width: camera.width,
    height: camera.height,
    style: { position: 'absolute', top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: 'top left' },
    role: 'img',
    'aria-label': 'Dungeon Lord — Spielfeld',
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
