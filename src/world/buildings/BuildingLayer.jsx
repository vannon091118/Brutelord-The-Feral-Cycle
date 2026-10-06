// @doc: docs/daten/buildings/buildinglayer.md#buildinglayer
import { BuildingNode } from './BuildingNode.jsx';

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
      {view.buildSpots.map((spot) => (
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
