/** Die Hülle der Verwurzelung über einem Feld. */
import { memo } from 'react';
import { TILE_KIND } from '../../domain/world/tile.js';
import { rootingCoverage } from '../../domain/world/rooting.js';
import { earthGeometry } from '../earth/earth-geometry.js';
import { floorGeometry } from '../floor/floor-geometry.js';
import { tendrilsOf } from './tendrils.js';

function massOf({ tile, size }) {
  return tile.kind === TILE_KIND.EARTH
    ? earthGeometry({ tile, size }).mass
    : floorGeometry({ tile, size }).mass;
}

function grownOf({ coverage, delay }) {
  const span = Math.max(0.001, 1 - delay);
  return Math.max(0, Math.min(1, (coverage - delay) / span));
}

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
