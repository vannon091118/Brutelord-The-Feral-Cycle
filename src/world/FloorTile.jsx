import { tileCenterPx } from '../domain/world/tile.js';
import { TILE_SIZE } from '../domain/world/world-config.js';
import { ONBOARDING_CONFIG } from '../domain/onboarding/onboarding-config.js';
import { FLOOR_ART } from './tile-art.js';

const cfg = ONBOARDING_CONFIG;

/**
 * Free dungeon floor. This is what one mined earth block turns into -
 * nothing more, nothing less. It reads as "this space is usable now".
 */
export default function FloorTile({ tile, isBuildTile, justRevealed }) {
  const { x, y } = tileCenterPx(tile);
  const half = TILE_SIZE / 2;

  return (
    <g
      transform={`translate(${x} ${y})`}
      className={justRevealed ? 'dl-reduce-motion' : undefined}
      style={
        justRevealed
          ? { animation: `dl-floor-reveal ${cfg.gridExpandDelayMs + 320}ms cubic-bezier(0.2, 0.9, 0.25, 1) both` }
          : undefined
      }
    >
      <ellipse cx={0} cy={2} rx={half * 0.96} ry={half * 0.86} fill="#0d0904" opacity={0.65} />

      <path d={FLOOR_ART.silhouette} fill="#241b12" />
      <path d={FLOOR_ART.silhouette} fill="none" stroke="#120c06" strokeWidth={1.8} opacity={0.9} />
      <path d={FLOOR_ART.inner} fill="#2f2417" opacity={0.95} />
      <path d={FLOOR_ART.inner} fill="none" stroke="#3d2f1d" strokeWidth={1} opacity={0.7} />

      {/* warm pool of light: this space belongs to the player now */}
      <ellipse cx={0} cy={1} rx={half * 0.5} ry={half * 0.42} fill="#d79a4e" opacity={0.11} />
      <ellipse cx={-3} cy={-3} rx={half * 0.3} ry={half * 0.2} fill="#e8b168" opacity={0.06} />

      {FLOOR_ART.specks.map((s, i) => (
        <circle key={`speck-${i}`} cx={s.cx} cy={s.cy} r={s.r} fill="#8b6c42" opacity={s.opacity} />
      ))}

      {isBuildTile ? (
        <g>
          <path
            d={FLOOR_ART.silhouette}
            fill="none"
            stroke="#e0a75a"
            strokeWidth={1.3}
            strokeDasharray="6 8"
            opacity={0.6}
            transform="scale(0.94)"
          />
          {FLOOR_ART.flags.map((f, i) => (
            <path
              key={`flag-${i}`}
              d={`M ${f.x - 2.6} ${f.y} L ${f.x} ${f.y - 2.6} L ${f.x + 2.6} ${f.y}`}
              fill="none"
              stroke="#e0a75a"
              strokeWidth={1.1}
              strokeLinecap="round"
              opacity={0.55}
            />
          ))}
          {justRevealed ? (
            <path
              d={FLOOR_ART.silhouette}
              fill="none"
              stroke="#f2c78c"
              strokeWidth={2}
              className="dl-origin-center dl-reduce-motion"
              style={{
                animation: `dl-floor-ring ${cfg.gridExpandDelayMs + 700}ms ease-out forwards`,
              }}
            />
          ) : null}
        </g>
      ) : null}
    </g>
  );
}