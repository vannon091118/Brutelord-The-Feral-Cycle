/** Ein Erdblock als Ganzes: Masse, Spuren, Klickfläche. */
import { memo, useState } from 'react';
import { earthGeometry } from './earth/earth-geometry.js';
import { EarthSlab } from './earth/EarthSlab.jsx';
import { EarthDamage } from './earth/EarthDamage.jsx';
import { TileRing } from './earth/TileRing.jsx';
import { HitArea } from './earth/HitArea.jsx';

export const EarthTile = memo(function EarthTile({ tile, size, highlighted, selected, working, interactive, softHint, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const geometry = earthGeometry({ tile, size });
  const ring = { highlighted, selected, working, interactive, hovered, softHint };

  return (
    <g>
      <g className={geometry.shiver ? 'dl-anim dl-shiver' : undefined}>
        <EarthSlab geometry={geometry} />
        <EarthDamage geometry={geometry} />
      </g>

      <TileRing geometry={geometry} state={ring} />

      <HitArea
        geometry={geometry}
        interactive={interactive}
        label={`Erdblock bei ${tile.x}, ${tile.y} abbauen`}
        onSelect={() => onSelect(tile.id)}
        onHover={setHovered}
      />
    </g>
  );
});
