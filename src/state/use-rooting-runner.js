// @doc: docs/daten/state/use-rooting-runner.md#use-rooting-runner
import { useEffect } from 'react';
import { ACTION } from '../domain/actions/action-types.js';
import { ROOTING_CONFIG } from '../domain/world/rooting-config.js';
import { rootingWorkCount } from '../domain/world/rooting-world.js';

export function useRootingRunner({ latest, dispatch }) {
  useEffect(() => {
    const clock = setInterval(() => {
      if (rootingWorkCount(latest.current.world) > 0) dispatch({ type: ACTION.ROOTING_TICK });
    }, ROOTING_CONFIG.tickMs);

    return () => clearInterval(clock);
  }, [latest, dispatch]);
}
