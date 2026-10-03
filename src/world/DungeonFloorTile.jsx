import { memo } from 'react';
import { floorGeometry } from './floor/floor-geometry.js';
import { FloorGround } from './floor/FloorGround.jsx';
import { FloorSubstrate } from './floor/FloorSubstrate.jsx';
import { FloorTraces } from './floor/FloorTraces.jsx';
import { NewFloorFx } from './floor/NewFloorFx.jsx';

/**
 * Nutzbarer Boden: vorher Erde, jetzt ein Stück Höhle, das ein Objekt
 * aufnehmen kann. Frisch abgebauter Boden bleibt dauerhaft erkennbar — heller
 * Lichtschein und Moosspitzen setzen ihn vom Hive-Eingang ab. Darunter liegt
 * der Untergrund: heller Stein.
 */
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