// @doc: docs/daten/entrance/entranceladder.md#entranceladder
import { descendOpen } from '../../domain/economy/resource-cycle.js';
import { getTile } from '../../domain/world/grid.js';
import { isUsable, tileId } from '../../domain/world/tile.js';
function isInView({ entrance, camera, tileSize }) {
  const x = entrance.x * tileSize;
  const y = entrance.y * tileSize;
  return x >= camera.x - tileSize && x <= camera.x + camera.width && y >= camera.y - tileSize && y <= camera.y + camera.height;
}

function LadderRungs({ height, width }) {
  return Array.from({ length: 4 }, (_, index) => {
    const y = (height / 5) * (index + 1);
    return (
      <g key={`rung-${index}`}>
        <path d={`M${-width / 2},${y} h${width}`} stroke="var(--color-clay-600)" strokeWidth="3.4" strokeLinecap="round" />
        <path d={`M${-width / 2},${y - 1.1} h${width}`} stroke="var(--color-bone-300)" strokeWidth="1.1" strokeLinecap="round" opacity="0.55" />
      </g>
    );
  });
}

function LadderShaft({ height, width }) {
  return (
    <>
      <rect x={-width / 2 - 4} y={-height / 2} width={width + 8} height={height} rx="9" fill="var(--color-soil-950)" opacity="0.92" />
      <circle cx="0" cy={-height / 2} r={width * 0.9} fill="url(#dl-coreHalo)" opacity="0.55" />
    </>
  );
}

function OpenHint({ height, width, open }) {
  if (!open) return null;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <path
        d={`M${-width / 3},${height / 2 + 6} l${width / 3},${width * 0.6} l${width / 3},${-width * 0.6}`}
        fill="none"
        stroke="var(--color-core-300)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function LadderHitArea({ height, width, open, onClimb }) {
  const label = open ? 'In die naechste Etage steigen' : 'Der Schacht endet hier';
  return (
    <rect
      x={-width / 2 - 8}
      y={-height / 2}
      width={width + 16}
      height={height + width}
      rx="10"
      fill="transparent"
      onClick={open ? onClimb : undefined}
      style={{ pointerEvents: open ? 'auto' : 'none', cursor: open ? 'pointer' : 'default' }}
      role="button"
      aria-label={label}
    >
      <title>{label}</title>
    </rect>
  );
}

export function EntranceLadder({ world, camera, tileSize, cycle, buildings = [], onClimb }) {
  const entrance = world.entrance;
  if (!isInView({ entrance, camera, tileSize })) return null;
  const depth = world.depth;
  const width = tileSize * 0.44;
  const height = tileSize * 1.7;
  const offen = isUsable(getTile(world, tileId(entrance.x, entrance.y)));
  const open = descendOpen({ depth, cycle, buildings }) && offen;
  return (
    <g
      transform={`translate(${entrance.x * tileSize + tileSize / 2} ${entrance.y * tileSize + tileSize / 2}) rotate(-7)`}
      opacity="0.95"
    >
      <LadderShaft height={height} width={width} />
      <path d={`M${-width / 2},${-height / 2} v${height}`} stroke="var(--color-bone-300)" strokeWidth="3.6" strokeLinecap="round" />
      <path d={`M${width / 2},${-height / 2} v${height}`} stroke="var(--color-clay-500)" strokeWidth="3.6" strokeLinecap="round" />
      <LadderRungs height={height} width={width} />
      <OpenHint height={height} width={width} open={open} />
      <LadderHitArea height={height} width={width} open={open} onClimb={onClimb} />
    </g>
  );
}
