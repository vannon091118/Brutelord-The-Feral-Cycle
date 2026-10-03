import { memo } from 'react';
import { TILE_KIND } from '../../domain/world/tile.js';
import { rootingCoverage } from '../../domain/world/rooting.js';
import { earthGeometry } from '../earth/earth-geometry.js';
import { floorGeometry } from '../floor/floor-geometry.js';
import { tendrilsOf } from './tendrils.js';

/** Die Fläche des Feldes — sie hängt an der Art, nicht an der Verwurzelung. */
function massOf({ tile, size }) {
  return tile.kind === TILE_KIND.EARTH
    ? earthGeometry({ tile, size }).mass
    : floorGeometry({ tile, size }).mass;
}

/** Wie weit ist dieser Strang schon gewachsen? */
function grownOf({ coverage, delay }) {
  const span = Math.max(0.001, 1 - delay);
  return Math.max(0, Math.min(1, (coverage - delay) / span));
}

/**
 * Ein Strang. `pathLength="100"` macht die Bahn messbar unabhängig von ihrer
 * Länge: der Fortschritt wird direkt zur Strichlänge.
 */
function Tendril({ tendril, coverage }) {
  return (
    <path
      d={tendril.d}
      pathLength="100"
      fill="none"
      stroke={tendril.tone === 'bright' ? 'var(--color-hive-400)' : 'var(--color-hive-600)'}
      strokeWidth={tendril.width}
      strokeLinecap="round"
      strokeDasharray="100"
      strokeDashoffset={100 - grownOf({ coverage, delay: tendril.delay }) * 100}
      opacity="0.95"
    />
  );
}

/**
 * Die Verwurzelung über einem Feld: die Farbe des Hive fadet hinein, während
 * die Tentakel von den Rändern nach innen wachsen. Erst wenn das Feld ganz
 * eingenommen ist, bleibt der Schleier liegen.
 */
export const RootingVeil = memo(function RootingVeil({ tile, size }) {
  const coverage = rootingCoverage(tile.rooting);
  if (coverage <= 0) return null;
  const mass = massOf({ tile, size });

  return (
    <g>
      <path d={mass} fill="url(#dl-hiveVeil)" opacity={coverage * 0.78} />
      {tendrilsOf({ tile, size }).map((tendril) => (
        <Tendril key={tendril.key} tendril={tendril} coverage={coverage} />
      ))}
      <path d={mass} fill="url(#dl-coreHalo)" opacity={coverage * 0.2} />
    </g>
  );
});