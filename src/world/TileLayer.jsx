// @doc: docs/daten/world/tilelayer.md#tilelayer
import { EarthTile } from './EarthTile.jsx';
import { EarthDepth } from './earth/EarthDepth.jsx';
import { DungeonFloorTile } from './DungeonFloorTile.jsx';
import { RootingLayer } from './rooting/RootingVeil.jsx';
import { BuildingLayer } from './buildings/BuildingLayer.jsx';
import { DepositLayer } from './deposits/DepositLayer.jsx';
import { TILE_KIND } from '../domain/world/tile.js';

function EarthCell({ tile, view, tileSize, world, selectedTileId, highlightedTileId, onSelect }) {
  const working = view.workingTileId === tile.id;
  return (
    <EarthTile
      key={tile.id}
      tile={tile}
      size={tileSize}
      world={world}
      highlighted={highlightedTileId === tile.id}
      selected={selectedTileId === tile.id}
      working={working}
      step={working ? view.workingStep : 0}
      interactive={view.canSelect && view.frontier.has(tile.id)}
      softHint={view.softHint && view.frontier.has(tile.id)}
      onSelect={onSelect}
    />
  );
}

function earthTiles(earth, view, props) {
  return earth.map((tile) => <EarthCell key={tile.id} tile={tile} view={view} {...props} />);
}

function floorTiles(view, tileSize) {
  return view.tiles
    .filter((tile) => tile.kind === TILE_KIND.DUNGEON_FLOOR)
    .map((tile) => (
      <DungeonFloorTile
        key={tile.id}
        tile={tile}
        size={tileSize}
        isNew={view.showArrival && view.newFloorTileId === tile.id}
      />
    ));
}

export function TileLayer({ view, tileSize, selectedTileId, highlightedTileId, onSelect, onPlace, onSelectBuilding }) {
  const shared = { tileSize, selectedTileId, highlightedTileId, onSelect, world: view.world };
  const earth = view.tiles.filter((tile) => tile.kind === TILE_KIND.EARTH);
  return (
    <>
      {earthTiles(earth, view, shared)}
      <EarthDepth earth={earth} size={tileSize} world={view.world} />
      {floorTiles(view, tileSize)}
      <RootingLayer tiles={view.tiles} size={tileSize} world={view.world} />
      <DepositLayer view={view} tileSize={tileSize} />
      <BuildingLayer view={view} tileSize={tileSize} onPlace={onPlace} onSelect={onSelectBuilding} />
    </>
  );
}
