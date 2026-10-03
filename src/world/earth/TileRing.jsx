/** Visuelle Darstellung der Auswahl, des Arbeitsziels und des Hinweises. */
function ringAppearance({ highlighted, selected, working, interactive, hovered, softHint }) {
  if (selected) return { stroke: 'var(--color-bone-100)', opacity: 0.85, width: 1.8, dashed: true };
  if (highlighted || working) return { stroke: 'var(--color-core-400)', opacity: 0.45, width: 1.2, dashed: false };
  if (interactive && hovered) return { stroke: 'var(--color-bone-300)', opacity: 0.34, width: 1.2, dashed: false };
  return softHint ? { stroke: 'var(--color-bone-300)', opacity: 0.16, width: 1.2, dashed: false } : null;
}

function PulseRing({ geometry }) {
  return (
    <path
      className="dl-anim dl-ring-pulse"
      d={geometry.mass}
      fill="none"
      stroke="var(--color-core-400)"
      strokeWidth="1.5"
      opacity="0.6"
    />
  );
}

function StaticRing({ geometry, appearance }) {
  return (
    <path
      d={geometry.mass}
      fill="none"
      stroke={appearance.stroke}
      strokeWidth={appearance.width}
      strokeDasharray={appearance.dashed ? '6 4' : undefined}
      opacity={appearance.opacity}
    />
  );
}

function GlowHalo({ geometry, working }) {
  return (
    <circle
      className="dl-anim dl-glow-pulse"
      cx={geometry.center.x}
      cy={geometry.center.y}
      r={geometry.size * 0.62}
      fill="url(#dl-coreHalo)"
      opacity={working ? 0.4 : 0.5}
    />
  );
}

export function TileRing({ geometry, state }) {
  const appearance = ringAppearance(state);
  if (!appearance) return null;
  return (
    <>
      {state.highlighted ? <PulseRing geometry={geometry} /> : null}
      <StaticRing geometry={geometry} appearance={appearance} />
      {state.highlighted || state.working ? <GlowHalo geometry={geometry} working={state.working} /> : null}
    </>
  );
}
