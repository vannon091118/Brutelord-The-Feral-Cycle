import { memo } from 'react';
import { buildingDef } from '../../domain/buildings/building-config.js';
import { BuildingArt } from './BuildingArt.jsx';

function SelectionRing({ box, tileSize }) {
  return (
    <rect
      x={box.x + 2}
      y={box.y + 2}
      width={box.width - 4}
      height={box.height - 4}
      rx={tileSize * 0.2}
      fill="none"
      stroke="var(--color-core-300)"
      strokeWidth="2"
      opacity="0.85"
    />
  );
}

// @doc: docs/daten/buildings/buildingnode.md#buildingnode
function HitArea({ id, box, label, onSelect }) {
  const onKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onSelect(id);
  };
  return (
    <rect
      x={box.x}
      y={box.y}
      width={box.width}
      height={box.height}
      fill="transparent"
      role="button"
      aria-label={`${label} anklicken`}
      tabIndex={0}
      style={{ cursor: 'pointer' }}
      onClick={() => onSelect(id)}
      onKeyDown={onKeyDown}
    />
  );
}

export const BuildingNode = memo(function BuildingNode({ building, tileSize, selected, onSelect }) {
  const def = buildingDef(building.type);
  const box = {
    x: building.anchor.x * tileSize,
    y: building.anchor.y * tileSize,
    width: def.width * tileSize,
    height: def.height * tileSize,
  };

  return (
    <g>
      <BuildingArt building={building} tileSize={tileSize} />
      {selected ? <SelectionRing box={box} tileSize={tileSize} /> : null}
      <HitArea id={building.id} box={box} label={def.label} onSelect={onSelect} />
    </g>
  );
});
