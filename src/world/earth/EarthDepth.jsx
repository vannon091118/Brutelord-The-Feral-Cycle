// @doc: docs/daten/earth/earthdepth.md#earthdepth
import { TILE_KIND } from '../../domain/world/tile.js';
import { tileSeed } from '../tile-shapes.js';
import { earthGeometry } from './earth-geometry.js';

const DEPTH_MIN = 0.05;
const DEPTH_SPAN = 0.18;

export function EarthDepth({ tiles, size, world = null }) {
  const earth = tiles.filter((tile) => tile.kind === TILE_KIND.EARTH);
  return (
    <g className="dl-anim dl-earth-depth" style={{ pointerEvents: 'none' }}>
      {earth.map((tile) => (
        <path
          key={tile.id}
          d={earthGeometry({ tile, size, world }).mass}
          fill="var(--color-soil-950)"
          opacity={DEPTH_MIN + ((tileSeed(tile.x, tile.y) % 1024) / 1024) * DEPTH_SPAN}
        />
      ))}
    </g>
  );
}
