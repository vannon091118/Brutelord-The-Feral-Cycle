import { makeRng } from '../tile-shapes.js';

// @doc: docs/daten/floor/floortraces.md#floortraces
function traceSpots({ geometry, count }) {
  const rng = makeRng(geometry.seed ^ 0x2f31);
  return Array.from({ length: count }, () => ({
    dx: (rng() - 0.5) * geometry.size * 0.52,
    dy: (rng() - 0.5) * geometry.size * 0.52,
    scale: 0.75 + rng() * 0.55,
    flip: rng() > 0.5 ? 1 : -1,
  }));
}

function BurrowPrints({ geometry }) {
  return traceSpots({ geometry, count: 4 }).map((spot, index) => (
    <ellipse
      key={`print-${index}`}
      cx={geometry.center.x + spot.dx}
      cy={geometry.center.y + spot.dy}
      rx={2.2 * spot.scale}
      ry={1.6 * spot.scale}
      fill="var(--color-soil-950)"
      opacity="0.3"
    />
  ));
}

function MossTufts({ geometry }) {
  return traceSpots({ geometry, count: 3 }).map((spot, index) => (
    <g key={`tuft-${index}`} opacity="0.55">
      <path
        d={`M0,0 q${2 * spot.flip},-5 ${4.6 * spot.flip},-0.6`}
        transform={`translate(${geometry.center.x + spot.dx} ${geometry.center.y + spot.dy})`}
        fill="none"
        stroke="var(--color-moss-500)"
        strokeWidth={1.4 * spot.scale}
        strokeLinecap="round"
      />
    </g>
  ));
}

export function FloorTraces({ geometry }) {
  return (
    <g>
      {geometry.burrow ? <BurrowPrints geometry={geometry} /> : <MossTufts geometry={geometry} />}
    </g>
  );
}