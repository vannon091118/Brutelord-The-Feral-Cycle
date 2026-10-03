/** Der grüne Schein über einem geöffneten Vorrat — weicher Rand, keine Kante. */
import { DEPOSIT_PHASE } from '../../domain/deposits/deposit-config.js';
import { soilBlob, tileSeed } from '../tile-shapes.js';

const GLOW_GRADIENT = 'dl-essence-glow';

function halo(tile, size) {
  const span = size * 3;
  return soilBlob({
    x: tile.x * size + size * 0.5 - span * 0.5,
    y: tile.y * size + size * 0.5 - span * 0.5,
    size: span,
    inset: 0,
    jitter: 18,
    points: 8,
    seed: tileSeed(tile.x, tile.y),
    outward: 14,
  });
}

function stops() {
  return [0.16, 0.06, 0].map((opacity, index) => (
    <stop key={index} offset={index * 0.5} stopColor="var(--color-essence-400)" stopOpacity={opacity} />
  ));
}

export function DepositGlow({ view, size }) {
  const open = view.tiles.filter(
    (tile) => tile.depositId && view.world.deposits?.[tile.depositId]?.phase === DEPOSIT_PHASE.FOUND,
  );
  return (
    <g>
      <radialGradient id={GLOW_GRADIENT}>{stops()}</radialGradient>
      {open.map((tile) => (
        <path key={`glow-${tile.id}`} d={halo(tile, size)} fill={`url(#${GLOW_GRADIENT})`} />
      ))}
    </g>
  );
}
