function DamageChips({ chips }) {
  return chips.map((path) => (
    <path key={`chip-${path}`} d={path} fill="var(--color-soil-950)" opacity="0.75" />
  ));
}

function DamageCracks({ cracks }) {
  return cracks.map((crack) => (
    <path
      key={crack.key}
      d={crack.d}
      fill="none"
      stroke="var(--color-soil-950)"
      strokeWidth={crack.width}
      strokeLinecap="round"
      opacity={crack.opacity}
    />
  ));
}

function LooseEarth({ pieces }) {
  return pieces.map((path) => (
    <path key={`loose-${path}`} d={path} fill="var(--color-soil-600)" opacity="0.8" />
  ));
}

function DamageShade({ geometry, opacity }) {
  return (
    <rect
      x={geometry.x}
      y={geometry.y}
      width={geometry.size}
      height={geometry.size}
      fill="var(--color-soil-950)"
      opacity={opacity}
    />
  );
}

export function EarthDamage({ geometry }) {
  const damage = geometry.damage;
  if (!damage) return null;
  return (
    <>
      <DamageChips chips={damage.chips} />
      <DamageCracks cracks={damage.cracks} />
      <LooseEarth pieces={damage.loose} />
      <DamageShade geometry={geometry} opacity={damage.darken} />
    </>
  );
}
