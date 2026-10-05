/** Ein Erdblock als Ganzes: Masse, Wand zur Unbekannten, Spuren, Klickfläche. */
import { memo, useState } from 'react';
import { earthGeometry } from './earth/earth-geometry.js';
import { EarthSlab } from './earth/EarthSlab.jsx';
import { EarthDamage } from './earth/EarthDamage.jsx';
import { EarthWall } from './earth/EarthWall.jsx';
import { TileRing } from './earth/TileRing.jsx';
import { HitArea } from './earth/HitArea.jsx';

/** Die Masse federt beim Einschlag — der Key zwingt die Animation je Tick neu. */
function EarthMass({ geometry, working, step }) {
  const className = working ? 'dl-anim dl-hit-punch' : geometry.shiver ? 'dl-anim dl-shiver' : undefined;
  return (
    <g key={working ? `mass-${step}` : 'mass'} className={className}>
      <EarthSlab geometry={geometry} />
      <EarthDamage geometry={geometry} />
    </g>
  );
}

export const EarthTile = memo(function EarthTile({ tile, size, world, highlighted, selected, working, step, interactive, softHint, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const geometry = earthGeometry({ tile, size, world });
  const ring = { highlighted, selected, working, interactive, hovered, softHint };

  return (
    <g>
      <EarthMass geometry={geometry} working={working} step={step} />
      <EarthWall walls={geometry.walls} />
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