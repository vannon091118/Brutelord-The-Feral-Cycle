function activateOnKey(event, onClick) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  onClick();
}

function hiveHitProps({ hive, tileSize, clickable, onClick }) {
  const side = tileSize * hive.size.width + 24;
  return {
    x: hive.origin.x * tileSize - 12,
    y: hive.origin.y * tileSize - 12,
    width: side,
    height: side,
    rx: '22',
    fill: 'transparent',
    role: clickable ? 'button' : undefined,
    'aria-label': clickable ? 'Hive anklicken' : undefined,
    tabIndex: clickable ? 0 : -1,
    style: { pointerEvents: clickable ? 'auto' : 'none', cursor: clickable ? 'pointer' : 'default' },
    onClick: clickable ? onClick : undefined,
    onKeyDown: clickable ? (event) => activateOnKey(event, onClick) : undefined,
  };
}

// @doc: docs/daten/hive/hivehitarea.md#hivehitarea
export function HiveHitArea(props) {
  return <rect {...hiveHitProps(props)} />;
}
