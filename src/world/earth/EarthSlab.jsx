function EarthDetails({ lines, speckles }) {
  return (
    <>
      {lines.map((line) => (
        <path
          key={line.key}
          d={line.d}
          fill="none"
          stroke={line.stroke}
          strokeWidth={line.width}
          strokeLinecap="round"
          opacity={line.opacity}
        />
      ))}
      {speckles.map((grain) => (
        <circle
          key={`grain-${grain.cx}-${grain.cy}`}
          cx={grain.cx}
          cy={grain.cy}
          r={grain.r}
          fill={grain.tone === 'light' ? 'var(--color-soil-300)' : 'var(--color-soil-900)'}
          opacity={grain.tone === 'light' ? 0.32 : 0.4}
        />
      ))}
    </>
  );
}

function rockFill(rock) {
  if (rock === 'OBSIDIAN') return 'url(#dl-obsidian)';
  if (rock === 'STONE') return 'url(#dl-hardStone)';
  return 'url(#dl-earthMass)';
}

// @doc: docs/daten/earth/earthslab.md#earthslab
export function EarthSlab({ geometry }) {
  return (
    <>
      <path d={geometry.mass} fill={rockFill(geometry.rock)} />
      <EarthDetails lines={geometry.handLines} speckles={geometry.speckles} />
    </>
  );
}
