// @doc: docs/daten/earth/tilering.md#tilering
function ringAppearance({ highlighted, selected, working, interactive, hovered, softHint }) {
  if (selected) return { stroke: 'var(--color-core-300)', opacity: 0.5, width: 1.1 };
  if (highlighted || working) return { stroke: 'var(--color-core-400)', opacity: 0.45, width: 1.2 };
  if (interactive && hovered) return { stroke: 'var(--color-bone-300)', opacity: 0.34, width: 1.2 };
  return softHint ? { stroke: 'var(--color-bone-300)', opacity: 0.16, width: 1.2 } : null;
}

function SelectionGlow({ geometry }) {
  return (
    <>
      <path d={geometry.mass} fill="url(#dl-coreHalo)" opacity="0.55" />
      <path
        d={geometry.mass}
        fill="none"
        stroke="var(--color-core-300)"
        strokeWidth="1.1"
        opacity="0.45"
      />
    </>
  );
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
      {state.selected ? <SelectionGlow geometry={geometry} /> : null}
      {state.highlighted ? <PulseRing geometry={geometry} /> : null}
      <StaticRing geometry={geometry} appearance={appearance} />
      {state.highlighted || state.working ? <GlowHalo geometry={geometry} working={state.working} /> : null}
    </>
  );
}
