function Pebbles({ pebbles }) {
  return pebbles.map((pebble) => (
    <circle
      key={`pebble-${pebble.cx}-${pebble.cy}`}
      cx={pebble.cx}
      cy={pebble.cy}
      r={pebble.r * 0.85}
      fill={pebble.tone === 'light' ? 'var(--color-soil-400)' : 'var(--color-soil-950)'}
      opacity="0.42"
    />
  ));
}

function FloorGlow({ geometry }) {
  return (
    <circle
      className="dl-anim dl-floor-light"
      cx={geometry.center.x}
      cy={geometry.center.y}
      r={geometry.size * 0.38}
      fill="url(#dl-floorLight)"
      opacity="0.4"
    />
  );
}

function FloorBase({ geometry }) {
  return (
    <>
      <rect x={geometry.x} y={geometry.y} width={geometry.size} height={geometry.size} fill="var(--color-soil-850)" />
      <path d={geometry.pack} fill="url(#dl-floor)" />
      <circle cx={geometry.center.x} cy={geometry.center.y} r={geometry.size * 0.44} fill="url(#dl-floorLight)" opacity={geometry.burrow ? 0.3 : 0.5} />
    </>
  );
}

export function FloorGround({ geometry }) {
  return (
    <>
      <FloorBase geometry={geometry} />
      <Pebbles pebbles={geometry.pebbles} />
      {geometry.burrow ? null : <FloorGlow geometry={geometry} />}
    </>
  );
}
