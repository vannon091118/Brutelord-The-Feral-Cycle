/**
 * Die Sim-Uhr. Sie kennt keine Zeiten und keine Regeln: sie holt den Plan aus
 * der Domäne (`scheduleFor`) und führt ihn aus. Der Spielzustand entsteht
 * ausschließlich im Reducer.
 */
import { useEffect } from 'react';
import { MINING_PHASE } from '../domain/actions/mining.js';
import { scheduleFor } from '../domain/onboarding/onboarding-schedule.js';

function startInterval(interval, latest, dispatch) {
  return setInterval(() => {
    const job = latest.current.mining;
    if (!job || job.phase !== MINING_PHASE.WORKING) return;
    dispatch({ type: interval.isLastTick(job) ? interval.complete : interval.tick });
  }, interval.everyMs);
}

export function useScheduleRunner({ phase, latest, dispatch }) {
  useEffect(() => {
    const { timers, interval } = scheduleFor(phase);
    const handles = timers.map(({ delayMs, type }) =>
      setTimeout(() => dispatch({ type }), delayMs),
    );
    const clock = interval ? startInterval(interval, latest, dispatch) : null;

    return () => {
      handles.forEach(clearTimeout);
      if (clock) clearInterval(clock);
    };
  }, [phase, latest, dispatch]);
}
