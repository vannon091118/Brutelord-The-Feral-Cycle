import { useEffect } from 'react';
import { ACTION } from '../domain/actions/action-types.js';
import { hiveHasBudget } from '../domain/economy/essence-economy.js';
import { JOB_CONFIG } from '../domain/labour/job-config.js';

// @doc: docs/daten/state/use-hive-runner.md#use-hive-runner
export function useHiveRunner({ latest, dispatch }) {
  useEffect(() => {
    const clock = setInterval(() => {
      if (hiveHasBudget(latest.current.hive)) dispatch({ type: ACTION.HIVE_TICK, dtMs: JOB_CONFIG.tickMs });
    }, JOB_CONFIG.tickMs);

    return () => clearInterval(clock);
  }, [latest, dispatch]);
}