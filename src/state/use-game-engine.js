// @doc: docs/daten/state/use-game-engine.md#use-game-engine
import { useReducer, useRef } from 'react';
import { gameReducer } from './game-reducer.js';
import { initialGameState } from './game-state.js';
import { useScheduleRunner } from './use-schedule-runner.js';
import { useColonyClock } from './use-colony-clock.js';
import { useSnapshotRunner } from './use-snapshot-runner.js';
import { useGameActions } from './use-game-actions.js';

export function useGameEngine(playerseed) {
  const [state, dispatch] = useReducer(gameReducer, playerseed, initialGameState);

  const latest = useRef(state);
  latest.current = state;

  useScheduleRunner({ phase: state.onboarding.state, latest, dispatch });
  useColonyClock({ latest, dispatch });
  useSnapshotRunner({ latest, playerseed });

  return { state, actions: useGameActions(dispatch) };
}
