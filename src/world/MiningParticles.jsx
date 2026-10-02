import { createRng } from '../domain/world/random.js';
import { TILE_SIZE } from '../domain/world/world-config.js';
import { tileCenter } from '../domain/world/tile.js';
import { ONBOARDING_CONFIG } from '../domain/onboarding/onboarding-config.js';
import { round } from './hand.js';

const cfg = ONBOARDING_CONFIG;

const TONES = ['#8a6039', '#9a7247', '#6b4a2c', '#c2935f', '#33210f'];

/** Deterministic little bursts of dirt, kicked loose where the dungling digs. */
const PARTICLES = (() => {
  const rng = createRng('mining:particles');
  const items = [];
  for (let i = 0; i < 14; i += 1) {
    const angle = -Math.PI / 2 + (rng() - 0.5) * 2.4;
    const distance = 7 + rng() * 13;
    items.push({
      dx: round(Math.cos(angle) * distance),
      dy: round(Math.sin(angle) * distance * 0.8 + 5),
      delay: round(-rng() * 900),
      life: 620 + Math.round(rng() * 520),
      r: round(0.9 + rng() * 1.7),
      tone: TONES[Math.floor(rng() * TONES.length)],
      shape: Math.floor(rng() * 3),
      rotate: round(rng() * 360),
    });
  }
  return items;
})();

/**
 * Small, earthy, irregular, short lived particles. They look like material
 * being loosened from the ground - not an explosion.
 */
export default function MiningParticles({ tile, workerPosition }) {
  const center = tileCenter(tile);
  const dx = workerPosition.x - center.x;
  const dy = workerPosition.y - center.y;
  const length = Math.hypot(dx, dy) || 1;
  const contactX = (center.x + (dx / length) * 0.44) * TILE_SIZE;
  const contactY = (center.y + (dy / length) * 0.44) * TILE_SIZE;

  return (
    <g transform={`translate(${round(contactX)} ${round(contactY)})`} pointerEvents="none">
      {PARTICLES.map((p, i) => (
        <g
          key={`particle-${i}`}
          className="dl-reduce-motion"
          style={{
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
            animation: `dl-particle ${p.life}ms ease-out ${p.delay}ms infinite`,
          }}
        >
          {p.shape === 0 ? (
            <circle r={p.r} fill={p.tone} />
          ) : p.shape === 1 ? (
            <rect
              x={-p.r}
              y={-p.r * 0.8}
              width={p.r * 2}
              height={p.r * 1.6}
              rx={0.6}
              fill={p.tone}
              transform={`rotate(${p.rotate})`}
            />
          ) : (
            <path
              d={`M ${-p.r} ${p.r * 0.7} L ${p.r} ${p.r * 0.5} L 0 ${-p.r} Z`}
              fill={p.tone}
              transform={`rotate(${p.rotate})`}
            />
          )}
        </g>
      ))}

      {/* a few heavier crumbs with a longer, tumbling fall */}
      {PARTICLES.slice(0, 4).map((p, i) => (
        <rect
          key={`crumb-${i}`}
          x={-p.r * 0.7}
          y={-p.r * 0.7}
          width={p.r * 1.4}
          height={p.r * 1.4}
          rx={0.8}
          fill="#5c3f21"
          className="dl-reduce-motion"
          style={{
            '--dx': `${round(p.dx * 1.35)}px`,
            '--dy': `${round(p.dy * 1.7 + 8)}px`,
            animation: `dl-debris ${Math.round(cfg.miningDurationMs / 3)}ms linear ${p.delay}ms infinite`,
          }}
        />
      ))}
    </g>
  );
}