// @doc: docs/daten/hive/hiveinvitation.md#hiveinvitation
function InvitationGlow({ cx, cy, tileSize }) {
  return (
    <circle
      className="dl-anim dl-glow-pulse"
      cx={cx}
      cy={cy}
      r={tileSize * 1.15}
      fill="url(#dl-coreHalo)"
      opacity="0.55"
      style={{ pointerEvents: 'none' }}
    />
  );
}

function InvitationRing({ cx, cy, radius }) {
  return (
    <ellipse
      className="dl-anim dl-ring-pulse"
      cx={cx}
      cy={cy}
      rx={radius}
      ry={radius * 0.86}
      fill="none"
      stroke="var(--color-core-400)"
      strokeWidth="1.6"
      opacity="0.5"
      style={{ pointerEvents: 'none' }}
    />
  );
}

export function HiveInvitation({ hive, tileSize }) {
  const cx = (hive.origin.x + hive.size.width / 2) * tileSize;
  const cy = (hive.origin.y + hive.size.height / 2) * tileSize;

  return (
    <>
      <InvitationGlow cx={cx} cy={cy} tileSize={tileSize} />
      <InvitationRing cx={cx} cy={cy} radius={tileSize * hive.size.width * 0.92} />
    </>
  );
}