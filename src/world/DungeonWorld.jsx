import { memo } from 'react';
import { worldView } from './world-view.js';
import { WorldDefs } from './WorldDefs.jsx';
import { WorldContext } from './WorldContext.jsx';
import { TileLayer } from './TileLayer.jsx';
import { HiveNode } from './HiveNode.jsx';
import { WorkerNode } from './WorkerNode.jsx';

/**
 * Die Welt: 2D, direkter Vogelblick, handgemachte Flächen.
 * Diese Komponente schichtet nur die Ebenen — sie entscheidet nichts.
 */
export const DungeonWorld = memo(function DungeonWorld({ game, actions, tileSize, scale }) {
  const view = worldView({ game, tileSize });
  return (
    <svg {...worldSvgProps(view, scale)}>
      <WorldDefs />
      <WorldContext view={view} onBackgroundClick={actions.clearSelection} />
      <TileLayer {...tileLayerProps({ game, view, tileSize, actions })} />
      <HiveNode {...hiveProps(game, tileSize, actions)} />
      <WorkerNode {...workerProps(game, view, tileSize)} />
      <WorldVignette size={view.size} />
    </svg>
  );
});

function worldSvgProps(view, scale) {
  const { bleed, width, height } = view.size;
  return {
    viewBox: `${-bleed} ${-bleed} ${width} ${height}`,
    width,
    height,
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

function workerProps(game, view, tileSize) {
  return {
    dungling: game.dungling,
    position: view.dunglingPx,
    tileSize,
    mining: game.mining,
    working: view.workingTileId !== null,
  };
}

function WorldVignette({ size }) {
  return (
    <rect
      x={-size.bleed}
      y={-size.bleed}
      width={size.width}
      height={size.height}
      fill="url(#dl-vignette)"
      style={{ pointerEvents: 'none' }}
    />
  );
}
