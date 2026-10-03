import { useEffect } from 'react';
import { ACTION } from '../domain/actions/action-types.js';
import { hiveHasBudget } from '../domain/economy/essence-economy.js';
import { JOB_CONFIG } from '../domain/labour/job-config.js';

/**
 * Die Uhr des Hive-Vorrats. Sie läuft auch dann, wenn sonst nichts zu tun ist —
 * ein Motor, der an einem Idle-Stopp hängt, wäre keiner. Schweigt, sobald das
 * Budget aufgebraucht ist.
 */
export function useHiveRunner({ latest, dispatch }) {
  useEffect(() => {
    const clock = setInterval(() => {
      if (hiveHasBudget(latest.current.hive)) dispatch({ type: ACTION.HIVE_TICK, dtMs: JOB_CONFIG.tickMs });
    }, JOB_CONFIG.tickMs);

    return () => clearInterval(clock);
  }, [latest, dispatch]);
}