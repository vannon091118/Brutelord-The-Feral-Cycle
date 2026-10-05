import { soilBlob } from '../tile-shapes.js';
import { buildingBox } from './building-geometry.js';

// @doc: docs/daten/buildings/brutelordart.md#brutelordart
function Carapace({ size }) {
  const widths = [0.74, 0.6, 0.44];
  return (
    <g>
      {widths.map((width, index) => {
        const y = -size * 0.3 + index * size * 0.13;
        const half = (size * width) / 2;
        return (
          <path
            key={`plate-${index}`}
            d={`M${-half},${y} Q0,${y - size * 0.09} ${half},${y}`}
            fill="none"
            stroke="var(--color-hive-400)"
            strokeWidth={size * 0.028}
            strokeLinecap="round"
            opacity={0.85 - index * 0.15}
          />
        );
      })}
    </g>
  );
}

function Horns({ size }) {
  const half = size * 0.31;
  return (
    <g fill="var(--color-soil-700)">
      <path d={`M${-half},${-size * 0.22} q${-size * 0.09},${-size * 0.16} ${size * 0.03},${-size * 0.26} q${size * 0.02},${size * 0.12} ${size * 0.05},${size * 0.2} Z`} />
      <path d={`M${half},${-size * 0.22} q${size * 0.09},${-size * 0.16} ${-size * 0.03},${-size * 0.26} q${-size * 0.02},${size * 0.12} ${-size * 0.05},${size * 0.2} Z`} />
    </g>
  );
}

function Eye({ size }) {
  return (
    <g>
      <ellipse cx="0" cy={size * 0.06} rx={size * 0.2} ry={size * 0.1} fill="var(--color-hive-800)" />
      <path d={`M${-size * 0.19},${size * 0.05} Q0,${size * 0.14} ${size * 0.19},${size * 0.05}`} fill="none" stroke="var(--color-core-500)" strokeWidth={size * 0.025} opacity="0.8" />
      <circle className="dl-anim dl-core-pulse" cx="0" cy={size * 0.05} r={size * 0.05} fill="var(--color-core-400)" opacity="0.5" />
    </g>
  );
}

export function BruteLordArt({ building, tileSize }) {
  const box = buildingBox(building, tileSize);
  const nest = soilBlob({
    x: box.x + 6,
    y: box.y + 6,
    size: box.width - 12,
    inset: 14,
    jitter: 4,
    outward: 4,
    points: 16,
    seed: 0x7c19,
  });
  return (
    <g>
      <path d={nest} fill="url(#dl-earthMass)" opacity="0.95" />
      <g transform={`translate(${box.cx} ${box.cy})`}>
        <g className="dl-anim dl-breathe">
          <path d={shell(box.size)} fill="var(--color-hive-700)" stroke="var(--color-hive-500)" strokeWidth="2" />
          <Carapace size={box.size} />
          <Horns size={box.size} />
          <Eye size={box.size} />
        </g>
      </g>
    </g>
  );
}

function shell(size) {
  const r = size * 0.42;
  return [
    `M${-r},${r * 0.35}`,
    `C${-r * 1.05},${-r * 0.5} ${-r * 0.6},${-r * 0.95} 0,${-r * 0.95}`,
    `C${r * 0.6},${-r * 0.95} ${r * 1.05},${-r * 0.5} ${r},${r * 0.35}`,
    `C${r * 0.7},${r * 0.95} ${-r * 0.7},${r * 0.95} ${-r},${r * 0.35} Z`,
  ].join(' ');
}
