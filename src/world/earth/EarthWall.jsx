/** Die Kantenwand: Felsfläche zur unbekannten Seite, helle Abrisskante davor. */
export function EarthWall({ walls }) {
  if (walls.length === 0) return null;
  return (
    <g style={{ pointerEvents: 'none' }}>
      {walls.map((band) => (
        <g key={band.key}>
          <path d={band.d} fill="url(#dl-wallFace)" />
          <path d={band.lip} fill="none" stroke="var(--color-rock-200)" strokeWidth={band.lipWidth} opacity="0.5" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}
