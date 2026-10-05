import { soilBlob } from '../tile-shapes.js';
import { buildingBox } from './building-geometry.js';

// @doc: docs/daten/buildings/extractorart.md#extractorart
function Drill({ size }) {
  const r = size * 0.2;
  return (
    <g>
      <path d={`M${-r},${-r * 0.5} L0,${r * 1.5} L${r},${-r * 0.5} Z`} fill="var(--color-rock-700)" stroke="var(--color-rock-500)" strokeWidth="1.2" />
      <path d={`M${-r * 0.5},${-r * 0.2} L0,${r * 0.9} L${r * 0.5},${-r * 0.2} Z`} fill="var(--color-rock-500)" opacity="0.6" />
    </g>
  );
}

function EssenceVeins({ size }) {
  const r = size * 0.34;
  return (
    <g stroke="var(--color-core-600)" strokeWidth="2.4" strokeLinecap="round" opacity="0.8">
      <path d={`M${-r},${-r * 0.1} C${-r * 1.1},${r * 0.5} ${-r * 0.5},${r * 0.85} 0,${r * 0.5}`} fill="none" />
      <path d={`M${r},${-r * 0.1} C${r * 1.1},${r * 0.5} ${r * 0.5},${r * 0.85} 0,${r * 0.5}`} fill="none" />
    </g>
  );
}

export function ExtractorArt({ building, tileSize }) {
  const box = buildingBox(building, tileSize);
  const base = soilBlob({
    x: box.x + 5,
    y: box.y + 12,
    size: box.size - 10,
    inset: 10,
    jitter: 2.2,
    outward: 3,
    points: 12,
    seed: 0x2b45,
  });
  return (
    <g>
      <path d={base} fill="var(--color-rock-600)" stroke="var(--color-rock-400)" strokeWidth="1.4" />
      <g transform={`translate(${box.cx} ${box.cy})`}>
        <EllipseRing size={box.size} />
        <Drill size={box.size} />
        <EssenceVeins size={box.size} />
        <circle className="dl-anim dl-core-pulse" cx="0" cy={-box.size * 0.16} r={box.size * 0.09} fill="var(--color-core-400)" />
      </g>
    </g>
  );
}

function EllipseRing({ size }) {
  return (
    <ellipse cx="0" cy={size * 0.02} rx={size * 0.32} ry={size * 0.26} fill="var(--color-rock-800)" stroke="var(--color-rock-500)" strokeWidth="1.6" />
  );
}
