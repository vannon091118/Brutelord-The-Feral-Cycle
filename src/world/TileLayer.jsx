import { EarthTile } from './EarthTile.jsx';
import { DungeonFloorTile } from './DungeonFloorTile.jsx';
import { TILE_KIND } from '../domain/world/tile.js';

/**
 * Das Feld: Erde und fertiger Boden. Hive-Tiles werden vom Hive selbst
 * überdeckt. Kein Tile kennt seinen Zustand doppelt — er kommt aus der Welt.
 */
function EarthCell({ tile, view, tileSize, selectedTileId, highlightedTileId, onSelect }) {
  return (
    <EarthTile
      key={tile.id}
      tile={tile}
      size={tileSize}
      highlighted={highlightedTileId === tile.id}
      selected={selectedTileId === tile.id}
      working={view.workingTileId === tile.id}
      interactive={view.canSelect && view.frontier.has(tile.id)}
      softHint={view.softHint && view.frontier.has(tile.id)}
      onSelect={onSelect}
    />
  );
}

export function TileLayer({ view, tileSize, selectedTileId, highlightedTileId, onSelect }) {
  return view.tiles.map((tile) => {
    if (tile.kind === TILE_KIND.EARTH) {
      return (
        <EarthCell
          key={tile.id}
          tile={tile}
          view={view}
          tileSize={tileSize}
          selectedTileId={selectedTileId}
          highlightedTileId={highlightedTileId}
          onSelect={onSelect}
        />
      );
    }
    if (tile.kind === TILE_KIND.DUNGEON_FLOOR) {
      return (
        <DungeonFloorTile
          key={tile.id}
          tile={tile}
          size={tileSize}
          isNew={view.showArrival && view.newFloorTileId === tile.id}
        />
      );
    }
    return null;
  });
}
