/**
 * Der Eingang: eine Leiter in einen dunklen Schacht, erst sichtbar, wenn die
 * Verwurzelung herangewachsen ist. [FUTURE] Kulisse, kein Uebergang — Handler,
 * State und Etagenwechsel kommen mit der Vertikalitaet als Task in der ROADMAP_OPEN.
 */
function isInView({ entrance, camera, tileSize }) {
  const x = entrance.x * tileSize;
  const y = entrance.y * tileSize;
  return x >= camera.x - tileSize && x <= camera.x + camera.width && y >= camera.y - tileSize && y <= camera.y + camera.height;
}

function LadderRungs({ height, width }) {
  return Array.from({ length: 4 }, (_, index) => {
    const y = (height / 5) * (index + 1);
    return (
      <g key={`rung-${index}`}>
        <path d={`M${-width / 2},${y} h${width}`} stroke="var(--color-clay-600)" strokeWidth="3.4" strokeLinecap="round" />
        <path d={`M${-width / 2},${y - 1.1} h${width}`} stroke="var(--color-bone-300)" strokeWidth="1.1" strokeLinecap="round" opacity="0.55" />
      </g>
    );
  });
}

function LadderShaft({ height, width }) {
  return (
    <>
      <rect x={-width / 2 - 4} y={-height / 2} width={width + 8} height={height} rx="9" fill="var(--color-soil-950)" opacity="0.92" />
      <circle cx="0" cy={-height / 2} r={width * 0.9} fill="url(#dl-coreHalo)" opacity="0.55" />
    </>
  );
}

export function EntranceLadder({ entrance, camera, tileSize }) {
  if (!isInView({ entrance, camera, tileSize })) return null;
  const width = tileSize * 0.44;
  const height = tileSize * 1.7;
  return (
    <g
      transform={`translate(${entrance.x * tileSize + tileSize / 2} ${entrance.y * tileSize + tileSize / 2}) rotate(-7)`}
      opacity="0.95"
    >
      <LadderShaft height={height} width={width} />
      <path d={`M${-width / 2},${-height / 2} v${height}`} stroke="var(--color-bone-300)" strokeWidth="3.6" strokeLinecap="round" />
      <path d={`M${width / 2},${-height / 2} v${height}`} stroke="var(--color-clay-500)" strokeWidth="3.6" strokeLinecap="round" />
      <LadderRungs height={height} width={width} />
    </g>
  );
}