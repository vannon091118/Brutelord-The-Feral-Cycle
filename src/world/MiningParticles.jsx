import { memo } from 'react';
import { useMiningCrumbs } from './particles/use-mining-crumbs.js';

function WorkGlow({ origin }) {
  return (
    <circle
      className="dl-anim dl-glow-pulse"
      cx={origin.x}
      cy={origin.y + 6}
      r="16"
      fill="url(#dl-coreHalo)"
      opacity="0.35"
    />
  );
}

function CrumbField({ crumbs, origin }) {
  return crumbs.map((crumb) => (
    <circle
      key={crumb.key}
      className="dl-anim dl-crumb"
      cx={origin.x}
      cy={origin.y + 5}
      r={crumb.r}
      fill={crumb.light ? 'var(--color-soil-400)' : 'var(--color-soil-800)'}
      style={{
        '--dl-dx': `${crumb.dx}px`,
        '--dl-dy': `${crumb.dy}px`,
        '--dl-rot': `${crumb.rot}deg`,
        '--dl-life': `${crumb.life}ms`,
      }}
    />
  ));
}

/** Erdkrümel springen kurz weg und verfallen — kein Konfetti-Feuerwerk. */
export const MiningParticles = memo(function MiningParticles({ origin, tick, active }) {
  const crumbs = useMiningCrumbs({ tick, active });
  if (!origin) return null;
  return (
    <g style={{ pointerEvents: 'none' }}>
      {active ? <WorkGlow origin={origin} /> : null}
      <CrumbField crumbs={crumbs} origin={origin} />
    </g>
  );
});
