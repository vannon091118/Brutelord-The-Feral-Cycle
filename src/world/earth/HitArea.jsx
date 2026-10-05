function onTileKeyDown(event, onSelect) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  onSelect();
}

function hitAreaProps({ geometry, interactive, label, onSelect, onHover }) {
  return {
    x: geometry.x,
    y: geometry.y,
    width: geometry.size,
    height: geometry.size,
    rx: '6',
    fill: 'transparent',
    role: interactive ? 'button' : undefined,
    'aria-label': interactive ? label : undefined,
    tabIndex: interactive ? 0 : -1,
    style: { pointerEvents: interactive ? 'auto' : 'none', cursor: interactive ? 'pointer' : 'default' },
    onClick: interactive ? onSelect : undefined,
    onKeyDown: interactive ? (event) => onTileKeyDown(event, onSelect) : undefined,
    onPointerEnter: interactive ? () => onHover(true) : undefined,
    onPointerLeave: interactive ? () => onHover(false) : undefined,
  };
}

// @doc: docs/daten/earth/hitarea.md#hitarea
export function HitArea(props) {
  return <rect {...hitAreaProps(props)} />;
}
