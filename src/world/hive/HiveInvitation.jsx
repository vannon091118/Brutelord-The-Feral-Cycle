/**
 * Die Einladung: solange der Hive noch nichts geboren hat, lädt er sichtbar
 * zum Klick ein — ohne Pfeil, ohne Text.
 */
export function HiveInvitation({ hive, tileSize }) {
  return (
    <>
      <circle
        className="dl-anim dl-glow-pulse"
        cx={(hive.origin.x + hive.size.width / 2) * tileSize}
        cy={(hive.origin.y + hive.size.height / 2) * tileSize}
        r={tileSize * 1.15}
        fill="url(#dl-coreHalo)"
        opacity="0.55"
        style={{ pointerEvents: 'none' }}
      />
      <rect
        className="dl-anim dl-ring-pulse"
        x={hive.origin.x * tileSize - 6}
        y={hive.origin.y * tileSize - 6}
        width={tileSize * hive.size.width + 12}
        height={tileSize * hive.size.height + 12}
        rx="20"
        fill="none"
        stroke="var(--color-core-400)"
        strokeWidth="1.6"
        opacity="0.5"
        style={{ pointerEvents: 'none' }}
      />
    </>
  );
}
