// @doc: docs/daten/floor/newfloorfx.md#newfloorfx
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
      <path
        className="dl-anim dl-ring-pulse"
        d={geometry.mass}
        fill="none"
        stroke="var(--color-core-400)"
        strokeWidth="2"
      />
    </>
  );
}