// @doc: docs/daten/state/use-game-clock.md#use-game-clock
import { useEffect } from 'react';
import { createGameClock } from './game-clock.js';
import { GAME_TIME } from './game-time.js';

export function useGameClock({ latest, dispatch }) {
  useEffect(() => {
    const clock = createGameClock();
    const handle = setInterval(() => {
      for (const action of clock.beat(latest.current)) dispatch(action);
    }, GAME_TIME.heartbeatMs);

    return () => clearInterval(handle);
  }, [latest, dispatch]);
}
