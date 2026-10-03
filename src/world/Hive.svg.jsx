import { memo } from 'react';
import { hiveVisualState } from './hive/hive-state.js';
import { HiveRoots } from './hive/HiveRoots.jsx';
import { HiveShell } from './hive/HiveShell.jsx';
import { HiveCore } from './hive/HiveCore.jsx';
import { HiveDoor } from './hive/HiveDoor.jsx';
import { HiveBirthMarks, HiveMutationFx } from './hive/HiveFx.jsx';

/**
 * Der Hive: 2x2 Tiles, organisch, massiv, das Herz der Szene. Gezeichnet in
 * einem Nominalsystem von 2x2 Tiles, das auf die echte Tile-Größe skaliert.
 */
export const HiveSvg = memo(function HiveSvg({ hive, tileSize, onboardingState, spawned }) {
  const unit = tileSize / 64;
  const px = hive.origin.x * tileSize + tileSize;
  const py = hive.origin.y * tileSize + tileSize;
  const view = hiveVisualState({ hive, onboardingState });

  return (
    <g transform={`translate(${px} ${py}) scale(${unit})`} style={{ pointerEvents: 'none' }}>
      <g className={view.bodyAnimation}>
        <HiveRoots />
        <HiveShell />
        <HiveCore mutating={view.mutating} />
        <HiveDoor waiting={view.waiting} />
        <HiveMutationFx mutating={view.mutating} />
      </g>
      <HiveBirthMarks spawned={spawned} />
    </g>
  );
});
