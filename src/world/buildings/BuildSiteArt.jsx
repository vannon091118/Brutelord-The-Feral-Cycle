// @doc: docs/daten/buildings/buildsiteart.md#buildsiteart
import { buildingBox } from './building-geometry.js';

function pipPath(x, y) {
  return `M${x},${y - 3.4} L${x + 3.4},${y} L${x},${y + 3.4} L${x - 3.4},${y} Z`;
}

function EssencePoints({ building, box }) {
  const step = box.width / (building.required + 1);
  return (
    <g>
      {Array.from({ length: building.required }, (_, index) => (
        <path
          key={`pip-${index}`}
          d={pipPath(box.x + step * (index + 1), box.y + box.height - 8)}
          fill={index < building.delivered ? 'var(--color-core-400)' : 'none'}
          stroke="var(--color-core-500)"
          strokeWidth="1.1"
        />
      ))}
    </g>
  );
}

function Scaffold({ box }) {
  const left = box.x + box.width * 0.3;
  const right = box.x + box.width * 0.7;
  const top = box.y + box.height * 0.28;
  const bottom = box.y + box.height * 0.72;
  return (
    <g stroke="var(--color-clay-500)" strokeWidth="3" strokeLinecap="round" opacity="0.85">
      <path d={`M${left},${bottom} L${right},${top}`} />
      <path d={`M${left},${top} L${right},${bottom}`} />
      <path d={`M${left - 3},${top} h${right - left + 6}`} strokeWidth="2.2" />
    </g>
  );
}

export function BuildSiteArt({ building, tileSize }) {
  const box = buildingBox(building, tileSize);
  const inset = tileSize * 0.08;
  return (
    <g>
      <rect
        x={box.x + inset}
        y={box.y + inset}
        width={box.width - inset * 2}
        height={box.height - inset * 2}
        rx={tileSize * 0.22}
        fill="var(--color-soil-900)"
        opacity="0.6"
        stroke="var(--color-core-500)"
        strokeWidth="2"
        strokeDasharray="7 7"
      />
      <Scaffold box={box} />
      <EssencePoints building={building} box={box} />
    </g>
  );
}
