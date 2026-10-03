import { useEffect, useRef, useState } from 'react';
import { ONBOARDING_CONFIG } from '../../domain/onboarding/onboarding-config.js';
import { miningBurstEveryTicks } from '../../domain/onboarding/onboarding-schedule.js';
import { makeRng } from '../tile-shapes.js';

/**
 * Erdkrümel für den Abbau. Rein visuell: die Partikel folgen dem Abbau-Tick der
 * Domäne, aber es gibt keine Partikelwahrheit im Spielzustand. Alles ist
 * deterministisch aus dem Tick abgeleitet — kein Math.random.
 */
const BURST_EVERY_TICKS = miningBurstEveryTicks();

function makeCrumbs(tick, counter) {
  const rng = makeRng((0xb0d1 + tick * 7919) >>> 0);
  return Array.from({ length: ONBOARDING_CONFIG.particlesPerBurst }, () => {
    const angle = -Math.PI / 2 + (rng() - 0.5) * Math.PI * 1.5;
    const distance = 13 + rng() * 26;
    counter.current += 1;
    return {
      key: `crumb-${counter.current}`,
      dx: Math.round(Math.cos(angle) * distance),
      dy: Math.round(Math.sin(angle) * distance),
      r: Number((1.1 + rng() * 1.9).toFixed(2)),
      rot: Math.round(-160 + rng() * 340),
      life: Math.round(ONBOARDING_CONFIG.particleLifetimeMs * (0.6 + rng() * 0.5)),
      light: rng() > 0.45,
    };
  });
}

export function useMiningCrumbs({ tick, active }) {
  const [crumbs, setCrumbs] = useState([]);
  const counter = useRef(0);

  useEffect(() => {
    if (!active) {
      setCrumbs([]);
      return undefined;
    }
    if (tick % BURST_EVERY_TICKS !== 0) return undefined;

    const batch = makeCrumbs(tick, counter);
    setCrumbs((previous) => [...previous.slice(-48), ...batch]);

    const keys = new Set(batch.map((crumb) => crumb.key));
    const timeout = setTimeout(() => {
      setCrumbs((previous) => previous.filter((crumb) => !keys.has(crumb.key)));
    }, ONBOARDING_CONFIG.particleLifetimeMs + 60);
    return () => clearTimeout(timeout);
  }, [tick, active]);

  return crumbs;
}
