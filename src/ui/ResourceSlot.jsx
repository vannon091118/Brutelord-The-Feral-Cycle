// @doc: docs/daten/ui/resourceslot.md#resourceslot
export function ResourceSlot({ glyph, label, value, tone = 'bone', rank, state = 'live', hint, children }) {
  const classes = [
    'dl-rail-slot',
    rank ? `dl-rail-slot--${rank}` : '',
    state === 'live' ? '' : `dl-rail-slot--${state}`,
    `dl-tone-${tone}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} title={hint}>
      <span className="dl-rail-label">{label}</span>
      {children ?? (
        <span key={value} className="dl-rail-value dl-rail-tick">
          {glyph} {value}
        </span>
      )}
    </span>
  );
}
