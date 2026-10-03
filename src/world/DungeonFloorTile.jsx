/** Nutzbarer Boden: Masse, Untergrund, Spuren, Lichtschein. */
import { memo } from 'react';
import { floorGeometry } from './floor/floor-geometry.js';
import { FloorGround } from './floor/FloorGround.jsx';
import { FloorSubstrate } from './floor/FloorSubstrate.jsx';
import { FloorTraces } from './floor/FloorTraces.jsx';
import { NewFloorFx } from './floor/NewFloorFx.jsx';

export const DungeonFloorTile = memo(function DungeonFloorTile({ tile, size, isNew }) {
  const geometry = floorGeometry({ tile, size });

  return (
    <g>
      <FloorGround geometry={geometry} />
      {geometry.burrow ? null : <FloorSubstrate geometry={geometry} />}
      <FloorTraces geometry={geometry} />
      {isNew ? <NewFloorFx geometry={geometry} /> : null}
    </g>
  );
});
