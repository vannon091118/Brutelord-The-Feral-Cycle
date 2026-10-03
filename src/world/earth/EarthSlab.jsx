function EarthFaces({ geometry }) {
  return (
    <>
      <path
        d={geometry.crust}
        transform={`translate(0 ${geometry.underEdgeOffset})`}
        fill="var(--color-soil-950)"
        opacity="0.55"
      />
      <path d={geometry.crust} fill="url(#dl-crust)" />
      <path d={geometry.topFace} fill="url(#dl-crustTop)" opacity="0.92" />
    </>
  );
}

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

export function EarthSlab({ geometry }) {
  return (
    <>
      <EarthFaces geometry={geometry} />
      <EarthDetails lines={geometry.handLines} speckles={geometry.speckles} />
    </>
  );
}
