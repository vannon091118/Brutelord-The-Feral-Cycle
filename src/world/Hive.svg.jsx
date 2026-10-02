import { createRng } from '../domain/world/random.js';
import { ONBOARDING_CONFIG } from '../domain/onboarding/onboarding-config.js';
import { HIVE_BOUNDS } from '../domain/entities/hive.js';
import { blobFromSeed, chipFromRim, round } from './hand.js';

const cfg = ONBOARDING_CONFIG;

/* The hive is drawn once, deterministically. */
const MASS = blobFromSeed('hive:mass', 0, 0, 50, 11, 0.24);

const LOBES = [
  { d: blobFromSeed('hive:lobe:0', 0, -34, 23, 8, 0.3), tone: '#3d2a19' },
  { d: blobFromSeed('hive:lobe:1', 33, -6, 22, 8, 0.3), tone: '#38260f' },
  { d: blobFromSeed('hive:lobe:2', 4, 33, 24, 8, 0.3), tone: '#33230f' },
  { d: blobFromSeed('hive:lobe:3', -33, 4, 21, 8, 0.3), tone: '#35240f' },
];

const RIDGES = [
  'M -36 -14 Q -4 -26 34 -10',
  'M -40 6 Q -6 -6 38 10',
  'M -30 24 Q 0 12 32 26',
];

const SPINES = (() => {
  const rng = createRng('hive:spines');
  const spines = [];
  for (let i = 0; i < 6; i += 1) {
    const t = i / 5;
    const x = round(-32 + t * 62 + (rng() - 0.5) * 4);
    const y = round(-40 - Math.sin(t * Math.PI) * 9 + rng() * 4);
    const w = round(3 + rng() * 2.4);
    const h = round(7 + rng() * 6);
    spines.push(`M ${round(x - w)} ${round(y + 2)} L ${x} ${round(y - h)} L ${round(x + w)} ${round(y + 2)} Z`);
  }
  return spines;
})();

const ROOTS = (() => {
  const rng = createRng('hive:roots');
  const roots = [];
  for (let i = 0; i < 4; i += 1) {
    const x = round(-24 + i * 16 + (rng() - 0.5) * 5);
    const w = round(5 + rng() * 3);
    const len = round(16 + rng() * 12);
    const bend = round((rng() - 0.5) * 14);
    roots.push(
      `M ${round(x - w)} 38 Q ${round(x + bend)} ${round(38 + len * 0.6)} ${round(x + bend * 1.6)} ${round(40 + len)} ` +
        `Q ${round(x + bend * 0.4)} ${round(40 + len * 0.5)} ${round(x + w)} 38 Z`,
    );
  }
  return roots;
})();

const PORES = (() => {
  const rng = createRng('hive:pores');
  const pores = [];
  for (let i = 0; i < 12; i += 1) {
    const angle = rng() * Math.PI * 2;
    const radius = 14 + rng() * 30;
    pores.push({
      cx: round(Math.cos(angle) * radius * 1.25),
      cy: round(Math.sin(angle) * radius * 0.8),
      r: round(1.2 + rng() * 2.2),
      opacity: round(0.25 + rng() * 0.3),
    });
  }
  return pores;
})();

const BURST = (() => {
  const rng = createRng('hive:burst');
  const items = [];
  for (let i = 0; i < 14; i += 1) {
    const angle = (i / 14) * Math.PI * 2 + rng() * 0.3;
    const distance = 16 + rng() * 26;
    items.push({
      dx: round(Math.cos(angle) * distance),
      dy: round(Math.sin(angle) * distance),
      delay: round(rng() * 260),
      r: round(1.2 + rng() * 2),
      tone: rng() > 0.55 ? '#f0c489' : '#c98c46',
    });
  }
  return items;
})();

const SPORE = chipFromRim(createRng('hive:spore'), 0, 0, 12, 0.4);

/**
 * The hive is the heart of the scene: organic, massive, slightly alive.
 * It is not a button and not an RTS building.
 */
export default function HiveSvg({ isMutating, isInteractive, onSelect }) {
  const half = HIVE_BOUNDS.size / 2;

  return (
    <g
      className={isInteractive ? 'dl-cursor-action' : undefined}
      onPointerUp={isInteractive ? onSelect : undefined}
      role={isInteractive ? 'button' : undefined}
      aria-label={isInteractive ? 'Hive aktivieren' : undefined}
    >
      <defs>
        <radialGradient id="dl-hive-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe6b8" />
          <stop offset="42%" stopColor="#f0ab55" />
          <stop offset="100%" stopColor="#8d4f18" />
        </radialGradient>
        <radialGradient id="dl-hive-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e79a45" stopOpacity="0.42" />
          <stop offset="55%" stopColor="#b1651f" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#7a3f10" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dl-hive-shell" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5a3d22" />
          <stop offset="45%" stopColor="#3d2a17" />
          <stop offset="100%" stopColor="#241708" />
        </linearGradient>
      </defs>

      {isInteractive ? (
        <rect x={-half} y={-half} width={HIVE_BOUNDS.size} height={HIVE_BOUNDS.size} fill="transparent" />
      ) : null}

      {/* aura */}
      <circle
        r={78}
        fill="url(#dl-hive-aura)"
        className="dl-origin-center"
        style={{
          animation: isMutating
            ? `dl-core-idle ${Math.round(cfg.hiveMutationMs / 3)}ms ease-in-out infinite`
            : `dl-core-idle ${cfg.idleLoopMs * 2}ms ease-in-out infinite`,
        }}
      />

      {/* contact shadow */}
      <ellipse cx={2} cy={46} rx={54} ry={16} fill="#080603" opacity={0.6} />

      {/* roots gripping the earth */}
      <g fill="#2b1d0e" opacity={0.95}>
        {ROOTS.map((d, i) => (
          <path key={`root-${i}`} d={d} />
        ))}
      </g>

      <g
        className="dl-origin-center"
        style={{
          animation: isMutating
            ? `dl-hive-mutate ${cfg.hiveMutationMs}ms cubic-bezier(0.3, 0.8, 0.3, 1) forwards`
            : `dl-hive-breathe ${cfg.idleLoopMs * 2}ms ease-in-out infinite`,
        }}
      >
        {/* shell */}
        <path d={MASS} fill="url(#dl-hive-shell)" />
        {LOBES.map((lobe, i) => (
          <path key={`lobe-${i}`} d={lobe.d} fill={lobe.tone} />
        ))}

        {/* chitin ridges */}
        <g fill="none" stroke="#6d4a25" strokeWidth="2.2" strokeLinecap="round" opacity={0.55}>
          {RIDGES.map((d, i) => (
            <path key={`ridge-${i}`} d={d} />
          ))}
        </g>
        <g fill="none" stroke="#1d1106" strokeWidth="1.6" strokeLinecap="round" opacity={0.5}>
          {RIDGES.map((d, i) => (
            <path key={`ridge-shadow-${i}`} d={d} transform="translate(0 3)" />
          ))}
        </g>

        {/* spines on the back */}
        <g fill="#241708" opacity={0.92}>
          {SPINES.map((d, i) => (
            <path key={`spine-${i}`} d={d} />
          ))}
        </g>
        <g fill="#7a5527" opacity={0.5}>
          {SPINES.map((d, i) => (
            <path key={`spine-light-${i}`} d={d} transform="translate(-0.8 -1)" />
          ))}
        </g>

        {PORES.map((p, i) => (
          <circle key={`pore-${i}`} cx={p.cx} cy={p.cy} r={p.r} fill="#170e05" opacity={p.opacity} />
        ))}

        {/* the core - it opens while the hive mutates */}
        <g className="dl-origin-center">
          <ellipse rx={26} ry={21} fill="#1a1006" opacity={0.9} />
          <ellipse
            rx={19}
            ry={15}
            fill="#8a4a16"
            className="dl-origin-center"
            style={{
              animation: isMutating
                ? `dl-core-open ${cfg.hiveMutationMs}ms cubic-bezier(0.2, 0.9, 0.25, 1) forwards`
                : `dl-core-idle ${cfg.idleLoopMs}ms ease-in-out infinite`,
            }}
          />
          <ellipse
            rx={11}
            ry={8.5}
            fill="url(#dl-hive-core)"
            className="dl-origin-center"
            style={{
              animation: isMutating
                ? `dl-core-open ${cfg.hiveMutationMs}ms cubic-bezier(0.2, 0.9, 0.25, 1) forwards`
                : `dl-core-idle ${cfg.idleLoopMs}ms ease-in-out infinite`,
            }}
          />
          <ellipse cx={-2} cy={-2} rx={4} ry={2.6} fill="#fff3dc" opacity={0.75} />
        </g>
      </g>

      {/* while this is the one sensible action, the hive invites a click */}
      {isInteractive ? (
        <g
          className="dl-origin-center dl-reduce-motion"
          style={{ animation: `dl-tile-hint ${cfg.idleLoopMs * 1.5}ms ease-in-out infinite` }}
          pointerEvents="none"
        >
          <rect
            x={-half}
            y={-half}
            width={HIVE_BOUNDS.size}
            height={HIVE_BOUNDS.size}
            rx={16}
            fill="#e8b168"
            opacity={0.07}
            transform="scale(1.04)"
          />
          <rect
            x={-half}
            y={-half}
            width={HIVE_BOUNDS.size}
            height={HIVE_BOUNDS.size}
            rx={16}
            fill="none"
            stroke="#f0c489"
            strokeWidth={1.4}
            strokeDasharray="7 9"
            opacity={0.7}
            transform="scale(1.04)"
          />
        </g>
      ) : null}

      {/* short burst of particles while the hive mutates */}
      {isMutating ? (
        <g>
          {BURST.map((p, i) => (
            <circle
              key={`burst-${i}`}
              r={p.r}
              fill={p.tone}
              className="dl-reduce-motion"
              style={{
                '--dx': `${p.dx}px`,
                '--dy': `${p.dy}px`,
                animation: `dl-particle ${Math.round(cfg.hiveMutationMs * 0.9)}ms ease-out ${p.delay}ms forwards`,
              }}
            />
          ))}
          <g
            className="dl-origin-center dl-reduce-motion"
            style={{
              animation: `dl-spore-rise ${cfg.idleLoopMs}ms linear infinite`,
            }}
          >
            <path d={SPORE} fill="#e0b070" opacity={0.6} transform="translate(30 -18) scale(0.8)" />
          </g>
        </g>
      ) : null}
    </g>
  );
}