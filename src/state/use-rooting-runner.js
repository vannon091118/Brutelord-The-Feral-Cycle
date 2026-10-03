import { useEffect } from 'react';
import { ACTION } from '../domain/actions/action-types.js';
import { ROOTING_CONFIG } from '../domain/world/rooting-config.js';
import { worldHasRootingWork } from '../domain/world/rooting-world.js';

/**
 * Die Uhr der Verwurzelung. Sie läuft unabhängig vom Onboarding, weil die
 * Wurzeln weiterkriechen, während der Spieler noch nichts tut. Solange kein
 * Feld wächst oder ruht, schweigt sie — die Uhr hat keinen eigenen Zustand,
 * sie liest nur den der Welt.
 */
export function useRootingRunner({ latest, dispatch }) {
  useEffect(() => {
    const clock = setInterval(() => {
      if (worldHasRootingWork(latest.current.world)) dispatch({ type: ACTION.ROOTING_TICK });
    }, ROOTING_CONFIG.tickMs);

    return () => clearInterval(clock);
  }, [latest, dispatch]);
}