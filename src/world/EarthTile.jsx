import { EARTH_PHASE, tileCenterPx } from '../domain/world/tile.js';
import { TILE_SIZE } from '../domain/world/world-config.js';
import { ONBOARDING_CONFIG } from '../domain/onboarding/onboarding-config.js';
import { EARTH_ART } from './tile-art.js';

const cfg = ONBOARDING_CONFIG;

/**
 * One earth block. It has exactly three visible states:
 * HEALTHY, TOUCHED, CRITICAL. Then it collapses and becomes free floor.
 */
export default function EarthTile({ tile, isTarget, isActionable, onSelect }) {
  const art = EARTH_ART[tile.variant % EARTH_ART.length];
  const { palette } = art;
  const { x, y } = tileCenterPx(tile);
  const phase = tile.mining.phase;
  const touched = phase === EARTH_PHASE.TOUCHED;
  const critical = phase === EARTH_PHASE.CRITICAL;
  const half = TILE_SIZE / 2;

  return (
    <g
      transform={`translate(${x} ${y})`}
      className={isActionable ? 'dl-cursor-action' : undefined}
      onPointerUp={isActionable ? () => onSelect(tile.id) : undefined}
    >
      {/* generous tap target so a 64px tile is easy to hit on touch */}
      {isActionable ? (
        <rect
          x={-half}
          y={-half}
          width={TILE_SIZE}
          height={TILE_SIZE}
          rx={10}
          fill="transparent"
        />
      ) : null}

      <g
        className={tile.mining.collapsing ? 'dl-reduce-motion' : undefined}
        style={
          tile.mining.collapsing
            ? { animation: `dl-tile-collapse ${cfg.tileDestroyedPauseMs}ms ease-in forwards` }
            : undefined
        }
      >
        {/* ground shadow */}
        <ellipse cx={1.5} cy={4} rx={half * 0.92} ry={half * 0.82} fill="#0a0704" opacity={0.5} />

        <g
          className={`dl-origin-center${critical && !tile.mining.collapsing ? ' dl-reduce-motion' : ''}`}
          style={
            critical && !tile.mining.collapsing
              ? {
                  animation: `dl-earth-tremor ${Math.round(cfg.miningDurationMs / 22)}ms linear infinite`,
                }
              : undefined
          }
        >
          <g
            className="dl-origin-center"
            style={touched || critical ? { transform: 'scale(1.035, 0.965)' } : undefined}
          >
            <path d={art.silhouette} fill={palette.base} />
            <path d={art.lowMass} fill={palette.deep} opacity={0.55} />
            <path d={art.topMass} fill={palette.mid} opacity={0.9} />
            <path d={art.coreMass} fill={palette.light} opacity={0.42} />
            <path
              d={art.silhouette}
              fill="none"
              stroke={palette.edge}
              strokeWidth={1.6}
              opacity={0.85}
            />
            <path
              d={art.silhouette}
              fill="none"
              stroke={palette.light}
              strokeWidth={1}
              opacity={0.18}
              transform="translate(-0.6 -0.9)"
            />

            {art.dust.map((d, i) => (
              <circle key={`dust-${i}`} cx={d.cx} cy={d.cy} r={d.r} fill={palette.light} opacity={d.opacity} />
            ))}
            {art.pebbles.map((p, i) => (
              <ellipse
                key={`pebble-${i}`}
                cx={p.cx}
                cy={p.cy}
                rx={p.rx}
                ry={p.ry}
                fill={p.tone}
                opacity={p.opacity}
              />
            ))}
          </g>

          {/* TOUCHED: a first visible bite, a few cracks */}
          {touched || critical ? (
            <g>
              <path
                d={art.chips[0]}
                fill="#1a1209"
                opacity={0.55}
              />
              {art.cracks.map((d, i) => (
                <path
                  key={`crack-${i}`}
                  d={d}
                  fill="none"
                  stroke={palette.deep}
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.9}
                />
              ))}
            </g>
          ) : null}

          {/* CRITICAL: the block is about to give way */}
          {critical ? (
            <g>
              <path d={art.silhouette} fill={palette.deep} opacity={0.22} />
              {art.chips.slice(1).map((d, i) => (
                <path key={`chip-${i}`} d={d} fill="#140d06" opacity={0.75} />
              ))}
              {art.deepCracks.slice(2).map((d, i) => (
                <path
                  key={`deep-${i}`}
                  d={d}
                  fill="none"
                  stroke="#150e07"
                  strokeWidth={2.1}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.92}
                />
              ))}
              <path
                d={art.silhouette}
                fill="none"
                stroke={palette.light}
                strokeWidth={1}
                opacity={0.12}
              />
            </g>
          ) : null}
        </g>
      </g>

      {/* the one sensible next action: subtle glow, soft pulse, fine contour */}
      {isTarget ? (
        <g
          className="dl-origin-center dl-reduce-motion"
          style={{ animation: `dl-tile-hint ${cfg.idleLoopMs}ms ease-in-out infinite` }}
        >
          <path
            d={art.silhouette}
            fill="#e8b168"
            opacity={0.1}
            transform="scale(1.06)"
          />
          <path
            d={art.silhouette}
            fill="none"
            stroke="#f0c489"
            strokeWidth={1.4}
            strokeDasharray="5 7"
            opacity={0.75}
            transform="scale(1.06)"
          />
        </g>
      ) : null}
    </g>
  );
}