// @doc: docs/daten/deposits/deposithint.md#deposithint
import { depositHalo, hintTiles } from './deposit-visuals.js';

const HINT_GLOW = 'dl-essence-hint-glow';

function HintGradient() {
  return (
    <radialGradient id={HINT_GLOW}>
      <stop offset="0" stopColor="var(--color-essence-400)" stopOpacity="0.52" />
      <stop offset="0.5" stopColor="var(--color-essence-400)" stopOpacity="0.18" />
      <stop offset="1" stopColor="var(--color-essence-400)" stopOpacity="0" />
    </radialGradient>
  );
}

export function DepositHint({ view, size }) {
  return (
    <g>
      <HintGradient />
      {hintTiles(view.world, view.tiles).map((tile) => (
        <path
          key={`hint-${tile.id}`}
          className="dl-anim dl-essence-hint"
          d={depositHalo(tile, size)}
          fill={`url(#${HINT_GLOW})`}
        />
      ))}
    </g>
  );
}