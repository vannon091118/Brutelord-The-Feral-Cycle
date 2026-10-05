function Pebbles({ pebbles }) {
  return pebbles.map((pebble) => (
    <circle
      key={`pebble-${pebble.cx}-${pebble.cy}`}
      cx={pebble.cx}
      cy={pebble.cy}
      r={pebble.r * 0.85}
      fill={pebble.tone === 'light' ? 'var(--color-bone-100)' : 'var(--color-soil-950)'}
      opacity="0.38"
    />
  ));
}

function FloorLight({ geometry }) {
  return (
    <circle
      className="dl-anim dl-floor-light"
      cx={geometry.center.x}
      cy={geometry.center.y}
      r={geometry.size * 0.46}
      fill="url(#dl-floorLight)"
      opacity={geometry.burrow ? 0.28 : 0.42}
    />
  );
}

// @doc: docs/daten/floor/floorground.md#floorground
export function FloorGround({ geometry }) {
  return (
    <>
      <path d={geometry.mass} fill={geometry.fill} />
      <Pebbles pebbles={geometry.grit} />
      <FloorLight geometry={geometry} />
    </>
  );
}