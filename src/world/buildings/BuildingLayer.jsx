import { buildingDef } from '../../domain/buildings/building-config.js';
import { canPlaceBuilding } from '../../domain/buildings/building.js';
import { BuildingNode } from './BuildingNode.jsx';

// @doc: docs/daten/buildings/buildinglayer.md#buildinglayer
function placementSpots(view, tileSize) {
  if (!view.buildChoice) return [];
  const def = buildingDef(view.buildChoice);
  const context = { world: view.world, buildings: view.buildings, type: view.buildChoice };
  return view.tiles
    .filter((tile) => canPlaceBuilding({ ...context, anchor: tile }))
    .map((tile) => ({
      id: tile.id,
      label: def.label,
      x: tile.x * tileSize,
      y: tile.y * tileSize,
      width: def.width * tileSize,
      height: def.height * tileSize,
    }));
}

function onSpotKeyDown(event, onPlace, id) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  onPlace(id);
}

function PlacementSpot({ spot, tileSize, onPlace }) {
  return (
    <rect
      x={spot.x}
      y={spot.y}
      width={spot.width}
      height={spot.height}
      rx={tileSize * 0.2}
      fill="var(--color-core-400)"
      opacity="0.1"
      stroke="var(--color-core-400)"
      strokeWidth="2"
      strokeDasharray="6 8"
      className="dl-anim dl-place-hint"
      role="button"
      aria-label={`Bauplatz für ${spot.label} bei ${spot.id}`}
      tabIndex={0}
      style={{ cursor: 'pointer' }}
      onKeyDown={(event) => onSpotKeyDown(event, onPlace, spot.id)}
      onClick={() => onPlace(spot.id)}
    />
  );
}

export function BuildingLayer({ view, tileSize, onPlace, onSelect }) {
  return (
    <>
      {placementSpots(view, tileSize).map((spot) => (
        <PlacementSpot key={`spot-${spot.id}`} spot={spot} tileSize={tileSize} onPlace={onPlace} />
      ))}
      {view.buildings.map((building) => (
        <BuildingNode
          key={building.id}
          building={building}
          tileSize={tileSize}
          selected={view.selectedBuildingId === building.id}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}
