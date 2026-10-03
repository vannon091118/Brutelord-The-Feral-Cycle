/**
 * Der Moment, in dem ein Feld nutzbar wird: Lichtschein und Ring, einmalig.
 * Das ist die sichtbare Grid-Erweiterung — genau ein Tile, deutlich markiert.
 */
export function NewFloorFx({ geometry }) {
  return (
    <>
      <circle
        className="dl-anim dl-free-glow"
        cx={geometry.center.x}
        cy={geometry.center.y}
        r={geometry.size * 0.5}
        fill="url(#dl-coreHalo)"
      />
      <rect
        className="dl-anim dl-ring-pulse"
        x={geometry.x + 1}
        y={geometry.y + 1}
        width={geometry.size - 2}
        height={geometry.size - 2}
        rx="7"
        fill="none"
        stroke="var(--color-core-400)"
        strokeWidth="2"
      />
    </>
  );
}
