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

/**
 * Die Masse selbst: eine einzige Fläche, die über die Nachbarn hinausragt.
 * Kein Sockel, keine Kante — dadurch verschwindet das Raster.
 */
export function EarthSlab({ geometry }) {
  return (
    <>
      <path d={geometry.mass} fill="url(#dl-earthMass)" />
      <EarthDetails lines={geometry.handLines} speckles={geometry.speckles} />
    </>
  );
}