// @doc: docs/daten/state/use-game-engine.md#use-game-engine
import { useCallback, useReducer, useRef } from 'react';
import { gameReducer } from './game-reducer.js';
import { initialGameState } from './game-state.js';
import { useGameClock } from './use-game-clock.js';
import { useSnapshotRunner } from './use-snapshot-runner.js';
import { useGameActions } from './use-game-actions.js';
import { createRunLog, recordInput } from '../domain/replay/run-log.js';

export function useGameEngine(session) {
  const playerseed = session.playerseed;
  const [state, dispatch] = useReducer(gameReducer, playerseed, initialGameState);

  const latest = useRef(state);
  latest.current = state;

  const log = useRef(createRunLog(playerseed));
  const send = useCallback((action) => {
    log.current = recordInput(log.current, action);
    dispatch(action);
  }, [dispatch]);

  useGameClock({ latest, dispatch: send });
  useSnapshotRunner({ latest, playerseed, token: session.token, log });

  return { state, actions: useGameActions(send) };
}
