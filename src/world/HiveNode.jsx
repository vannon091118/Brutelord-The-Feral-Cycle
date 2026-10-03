import { memo } from 'react';
import { canMutate } from '../domain/entities/hive.js';
import { HiveSvg } from './Hive.svg.jsx';
import { HiveInvitation } from './hive/HiveInvitation.jsx';
import { HiveHitArea } from './hive/HiveHitArea.jsx';

/**
 * Der Hive als Ganzes: Untergrund, Zeichnung, Einladung und Klickfläche.
 * Er ist nur klickbar, solange er noch nichts geboren hat.
 */
export const HiveNode = memo(function HiveNode({ hive, tileSize, onboardingState, onClick }) {
  const clickable = canMutate(hive);

  return (
    <>
      <rect
        x={hive.origin.x * tileSize}
        y={hive.origin.y * tileSize}
        width={tileSize * hive.size.width}
        height={tileSize * hive.size.height}
        fill="var(--color-soil-800)"
      />
      <HiveSvg
        hive={hive}
        tileSize={tileSize}
        onboardingState={onboardingState}
        spawned={hive.spawned}
      />
      {clickable ? <HiveInvitation hive={hive} tileSize={tileSize} /> : null}
      <HiveHitArea
        hive={hive}
        tileSize={tileSize}
        clickable={clickable}
        onClick={onClick}
      />
    </>
  );
});
