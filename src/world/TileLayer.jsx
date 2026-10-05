/** Das Feld in vier Durchgängen: Erde, Boden, Wurzeln, Vorräte, Bauten. */
import { EarthTile } from './EarthTile.jsx';
import { DungeonFloorTile } from './DungeonFloorTile.jsx';
import { RootingVeil } from './rooting/RootingVeil.jsx';
import { BuildingLayer } from './buildings/BuildingLayer.jsx';
import { DepositLayer } from './deposits/DepositLayer.jsx';
import { TILE_KIND } from '../domain/world/tile.js';
import { ROOTING_PHASE } from '../domain/world/rooting.js';

function EarthCell({ tile, view, tileSize, world, selectedTileId, highlightedTileId, onSelect }) {
  return (
    <EarthTile
      key={tile.id}
      tile={tile}
      size={tileSize}
      world={world}
      highlighted={highlightedTileId === tile.id}
      selected={selectedTileId === tile.id}
      working={view.workingTileId === tile.id}
      interactive={view.canSelect && view.frontier.has(tile.id)}
      softHint={view.softHint && view.frontier.has(tile.id)}
      onSelect={onSelect}
    />
  );
}

function earthTiles(view, props) {
  return view.tiles
    .filter((tile) => tile.kind === TILE_KIND.EARTH)
    .map((tile) => <EarthCell key={tile.id} tile={tile} view={view} {...props} />);
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

function rootedTiles(view, tileSize) {
  return view.tiles
    .filter((tile) => tile.rooting.phase !== ROOTING_PHASE.DARK)
    .map((tile) => <RootingVeil key={`root-${tile.id}`} tile={tile} size={tileSize} world={view.world} />);
}

export function TileLayer({ view, tileSize, selectedTileId, highlightedTileId, onSelect, onPlace, onSelectBuilding }) {
  const shared = { tileSize, selectedTileId, highlightedTileId, onSelect, world: view.world };
  return (
    <>
      {earthTiles(view, shared)}
      {floorTiles(view, tileSize)}
      {rootedTiles(view, tileSize)}
      <DepositLayer view={view} tileSize={tileSize} />
      <BuildingLayer view={view} tileSize={tileSize} onPlace={onPlace} onSelect={onSelectBuilding} />
    </>
  );
}
