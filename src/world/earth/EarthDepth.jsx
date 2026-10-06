// @doc: docs/daten/earth/earthdepth.md#earthdepth
import { tileSeed } from '../tile-shapes.js';
import { earthGeometry } from './earth-geometry.js';

const DEPTH_MIN = 0.05;
const DEPTH_SPAN = 0.18;

export function depthOf(tile) {
  return DEPTH_MIN + ((tileSeed(tile.x, tile.y) % 1024) / 1024) * DEPTH_SPAN;
}

export function EarthDepth({ earth, size, world = null }) {
  return (
    <g className="dl-anim dl-earth-depth" style={{ pointerEvents: 'none' }}>
      {earth.map((tile) => (
        <path
          key={tile.id}
          d={earthGeometry({ tile, size, world }).mass}
          fill="var(--color-soil-950)"
          opacity={depthOf(tile)}
        />
      ))}
    </g>
  );
}
