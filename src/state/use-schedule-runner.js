// @doc: docs/daten/state/use-schedule-runner.md#use-schedule-runner
import { useEffect } from 'react';
import { intervalAction, scheduleFor } from '../domain/onboarding/onboarding-schedule.js';

function startInterval(interval, latest, dispatch) {
  return setInterval(() => {
    const action = intervalAction(interval, latest.current.mining);
    if (action) dispatch(action);
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
