import { useEffect } from 'react';
import { ACTION } from '../domain/actions/action-types.js';
import { JOB_CONFIG } from '../domain/labour/job-config.js';
import { workIsIdle } from './work-state.js';

/**
 * Die Arbeitsuhr: Aufträge laufen weiter, egal was der Spieler tut. Solange
 * niemand trägt, kein Bauplatz offen ist und kein Schwarmhort brütet, schweigt
 * sie — wie die Wurzeluhr liest sie nur den Zustand, sie besitzt keinen.
 */
export function useWorkRunner({ latest, dispatch }) {
  useEffect(() => {
    const clock = setInterval(() => {
      if (!workIsIdle(latest.current)) dispatch({ type: ACTION.WORK_TICK, dtMs: JOB_CONFIG.tickMs });
    }, JOB_CONFIG.tickMs);

    return () => clearInterval(clock);
  }, [latest, dispatch]);
}
