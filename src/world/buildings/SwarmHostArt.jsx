import { soilBlob } from '../tile-shapes.js';
import { buildingBox } from './building-geometry.js';

// @doc: docs/daten/buildings/swarmhostart.md#swarmhostart
function podPath(size) {
  const r = size * 0.3;
  return [
    `M0,${-r * 1.5}`,
    `C${r * 0.98},${-r * 1.32} ${r * 1.12},${-r * 0.28} ${r * 0.86},${r * 0.42}`,
    `C${r * 0.55},${r * 1.2} ${-r * 0.55},${r * 1.2} ${-r * 0.86},${r * 0.42}`,
    `C${-r * 1.12},${-r * 0.28} ${-r * 0.98},${-r * 1.32} 0,${-r * 1.5} Z`,
  ].join(' ');
}

function BroodBuds({ size }) {
  const r = size * 0.3;
  const buds = [
    { x: -r * 0.42, y: r * 0.1, s: 0.3 },
    { x: r * 0.34, y: -r * 0.16, s: 0.26 },
    { x: r * 0.14, y: r * 0.5, s: 0.22 },
  ];
  return (
    <g>
      {buds.map((bud, index) => (
        <circle
          key={`bud-${index}`}
          className="dl-anim dl-core-pulse"
          style={{ animationDelay: `${index * 320}ms` }}
          cx={bud.x * size}
          cy={bud.y * size}
          r={bud.s * size}
          fill="var(--color-core-500)"
          opacity="0.75"
        />
      ))}
    </g>
  );
}

export function SwarmHostArt({ building, tileSize }) {
  const box = buildingBox(building, tileSize);
  const nest = soilBlob({
    x: box.x + 3,
    y: box.y + 7,
    size: box.size - 6,
    inset: 8,
    jitter: 3,
    outward: 4,
    points: 12,
    seed: 0x51a7,
  });
  return (
    <g>
      <path d={nest} fill="url(#dl-earthMass)" opacity="0.95" />
      <g transform={`translate(${box.cx} ${box.cy - 2})`}>
        <g className="dl-anim dl-breathe">
          <path d={podPath(box.size)} fill="var(--color-hive-700)" stroke="var(--color-hive-400)" strokeWidth="1.8" />
          <BroodBuds size={box.size} />
        </g>
        <ellipse cx="0" cy={box.size * 0.3} rx={box.size * 0.16} ry={box.size * 0.09} fill="var(--color-hive-800)" />
      </g>
    </g>
  );
}
