import { useEffect } from 'react';
import { ACTION } from '../domain/actions/action-types.js';
import { JOB_CONFIG } from '../domain/labour/job-config.js';
import { workIsIdle } from './work-state.js';

// @doc: docs/daten/state/use-work-runner.md#use-work-runner
export function useWorkRunner({ latest, dispatch }) {
  useEffect(() => {
    const clock = setInterval(() => {
      if (!workIsIdle(latest.current)) dispatch({ type: ACTION.WORK_TICK, dtMs: JOB_CONFIG.tickMs });
    }, JOB_CONFIG.tickMs);

    return () => clearInterval(clock);
  }, [latest, dispatch]);
}
