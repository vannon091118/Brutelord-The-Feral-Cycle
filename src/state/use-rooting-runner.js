/** Die Uhr der Verwurzelung. */
import { useEffect } from 'react';
import { ACTION } from '../domain/actions/action-types.js';
import { ROOTING_CONFIG } from '../domain/world/rooting-config.js';
import { worldHasRootingWork } from '../domain/world/rooting-world.js';

export function useRootingRunner({ latest, dispatch }) {
  useEffect(() => {
    const clock = setInterval(() => {
      if (worldHasRootingWork(latest.current.world)) dispatch({ type: ACTION.ROOTING_TICK });
    }, ROOTING_CONFIG.tickMs);

    return () => clearInterval(clock);
  }, [latest, dispatch]);
}
