import { memo, useState } from 'react';
import { earthGeometry } from './earth/earth-geometry.js';
import { EarthSlab } from './earth/EarthSlab.jsx';
import { EarthDamage } from './earth/EarthDamage.jsx';
import { TileRing } from './earth/TileRing.jsx';
import { HitArea } from './earth/HitArea.jsx';

/**
 * Erd-Tile. Sichtbar heißt nicht nutzbar — dieses Tile ist sichtbar und
 * blockiert, bis es abgebaut ist. Die drei Zustände erzählen den Abbau ohne
 * Balken und ohne Zahlen: HEALTHY geschlossen, TOUCHED angekerbt,
 * CRITICAL rissig und instabil.
 */
export const EarthTile = memo(function EarthTile({ tile, size, highlighted, selected, working, interactive, softHint, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const geometry = earthGeometry({ tile, size });
  const ring = { highlighted, selected, working, interactive, hovered, softHint };

  return (
    <g>
      {/* Sockel: schließt Fugen zwischen den Erdschollen */}
      <rect x={geometry.x} y={geometry.y} width={size} height={size} fill="var(--color-soil-850)" />

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
