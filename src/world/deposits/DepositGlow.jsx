/** Der grüne Schimmer über einem geöffneten Vorrat — weich, ohne Kante. */
import { DEPOSIT_PHASE } from '../../domain/deposits/deposit-config.js';
import { depositHalo, haloStops } from './deposit-visuals.js';

const GLOW_PREFIX = 'dl-essence-glow';

// Jeder Vorrat braucht einen eigenen Verlauf: ein gemeinsamer Gradient würde
// allen Kacheln die Helligkeit des ersten Vorrats aufzwingen.
function Halo({ tile, size }) {
  const gradientId = `${GLOW_PREFIX}-${tile.id}`;
  return (
    <g>
      <radialGradient id={gradientId}>
        {haloStops(tile.deposit).map((stop, index) => (
          <stop key={index} offset={stop.offset} stopColor="var(--color-essence-400)" stopOpacity={stop.opacity} />
        ))}
      </radialGradient>
      <path className="dl-anim dl-essence-breathe" d={depositHalo(tile, size)} fill={`url(#${gradientId})`} />
    </g>
  );
}

export function DepositGlow({ view, size }) {
  return view.tiles
    .filter((tile) => tile.deposit?.phase === DEPOSIT_PHASE.FOUND)
    .map((tile) => <Halo key={`glow-${tile.id}`} tile={tile} size={size} />);
}