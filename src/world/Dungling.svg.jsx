import { TILE_SIZE } from '../domain/world/world-config.js';
import { ONBOARDING_CONFIG } from '../domain/onboarding/onboarding-config.js';
import { blobFromSeed } from './hand.js';

const cfg = ONBOARDING_CONFIG;

const BODY = blobFromSeed('dungling:body', 0, -11, 8.8, 10, 0.2, 1.04);
const BACK = blobFromSeed('dungling:back', -3.5, -11.5, 5.6, 8, 0.26, 1);
const BELLY = blobFromSeed('dungling:belly', 0.5, -7.5, 5.6, 8, 0.28, 0.85);
const EAR = blobFromSeed('dungling:ear', -5.5, -18.5, 2.6, 6, 0.4, 1.1);

/**
 * The dungling: small, round, handmade, a little alien, friendly, alive.
 * Feet sit on y = 0 so it can simply be placed on a tile.
 */
export default function DunglingSvg({ position, activity, facing = 1 }) {
  const x = position.x * TILE_SIZE;
  const y = position.y * TILE_SIZE;
  const walking = activity === 'move';
  const working = activity === 'work';

  return (
    <g
      className="dl-reduce-motion"
      style={{
        transform: `translate(${x}px, ${y}px)`,
        transition: `transform ${cfg.workerMoveDurationMs}ms cubic-bezier(0.35, 0.05, 0.3, 1)`,
      }}
    >
      <defs>
        <linearGradient id="dl-dungling-skin" x1="0%" y1="0%" x2="20%" y2="100%">
          <stop offset="0%" stopColor="#c2935f" />
          <stop offset="55%" stopColor="#a9774a" />
          <stop offset="100%" stopColor="#7d5734" />
        </linearGradient>
      </defs>

      {/* shadow */}
      <ellipse cx={1} cy={1.5} rx={9.5} ry={3.6} fill="#120c06" opacity={0.5} />

      <g transform={`scale(${facing} 1)`}>
        {/* back arm and ear first so they sit behind the body */}
        <g
          className="dl-origin-right dl-reduce-motion"
          style={{
            animation: working
              ? `dl-dungling-arm-work ${Math.round(cfg.miningDurationMs / 9)}ms ease-in-out infinite`
              : `dl-dungling-breathe ${cfg.idleLoopMs}ms ease-in-out infinite`,
          }}
        >
          <ellipse cx={-6.5} cy={-12} rx={3.1} ry={2.4} fill="#8a6039" />
        </g>
        <path d={EAR} fill="#b08050" />

        {/* feet */}
        <g
          className="dl-origin-bottom dl-reduce-motion"
          style={{
            animation: walking
              ? `dl-dungling-walk ${Math.round(cfg.workerMoveDurationMs / 2)}ms ease-in-out infinite`
              : undefined,
          }}
        >
          <ellipse cx={-4.2} cy={-1.2} rx={3.4} ry={2.1} fill="#6b4a2c" />
          <ellipse cx={4.6} cy={-1.2} rx={3.4} ry={2.1} fill="#6b4a2c" />
        </g>

        {/* body */}
        <g
          className="dl-origin-bottom dl-reduce-motion"
          style={{
            animation: working
              ? `dl-dungling-lean-work ${Math.round(cfg.miningDurationMs / 10)}ms ease-in-out infinite`
              : walking
                ? `dl-dungling-walk ${Math.round(cfg.workerMoveDurationMs / 2)}ms ease-in-out infinite`
                : `dl-dungling-bob ${cfg.idleLoopMs}ms ease-in-out infinite`,
          }}
        >
          <path d={BACK} fill="#8a6039" />
          <path d={BODY} fill="url(#dl-dungling-skin)" />
          <path d={BELLY} fill="#d3ab7c" opacity={0.85} />
          <path
            d={BODY}
            fill="none"
            stroke="#5c3f26"
            strokeWidth={1.1}
            opacity={0.55}
          />
          {/* dust on the back - this one works in the dirt */}
          <ellipse cx={-3} cy={-15} rx={2.6} ry={1.4} fill="#6d4b2c" opacity={0.5} transform="rotate(-18 -3 -15)" />

          {/* antennae */}
          <g stroke="#8a6039" strokeWidth={1.1} strokeLinecap="round" fill="none" opacity={0.9}>
            <path d="M 1 -19 Q 0 -25 -3 -27" />
            <path d="M 4.5 -18.5 Q 6 -24 4 -26.5" />
          </g>
          <circle cx={-3} cy={-27} r={1.3} fill="#e0b070" />
          <circle cx={4} cy={-26.5} r={1.2} fill="#e0b070" />

          {/* face */}
          <ellipse cx={2.2} cy={-13.5} rx={2.5} ry={2.7} fill="#f4e6cf" />
          <ellipse cx={6.4} cy={-12.6} rx={1.9} ry={2.1} fill="#f4e6cf" />
          <circle cx={2.9} cy={-13.2} r={1.2} fill="#241608" />
          <circle cx={6.9} cy={-12.3} r={1} fill="#241608" />
          <circle cx={2.5} cy={-13.8} r={0.42} fill="#fff6e6" opacity={0.9} />
          <circle cx={6.6} cy={-12.8} r={0.35} fill="#fff6e6" opacity={0.9} />
          <path
            d="M 1.5 -8.6 Q 4 -7.2 6.6 -8.8"
            fill="none"
            stroke="#4a3020"
            strokeWidth={0.9}
            strokeLinecap="round"
            opacity={0.8}
          />
        </g>

        {/* front arm - this is the one that breaks ground */}
        <g
          className="dl-origin-left dl-reduce-motion"
          style={{
            animation: working
              ? `dl-dungling-arm-work ${Math.round(cfg.miningDurationMs / 9)}ms ease-in-out infinite`
              : `dl-dungling-breathe ${cfg.idleLoopMs}ms ease-in-out infinite`,
          }}
        >
          <ellipse cx={7.2} cy={-9.4} rx={3.6} ry={2.6} fill="#a9774a" />
          <ellipse cx={9.6} cy={-8.2} rx={2.1} ry={1.7} fill="#c2935f" />
        </g>
      </g>
    </g>
  );
}