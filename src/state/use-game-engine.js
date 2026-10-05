/**
 * Der Spielmotor des Slices — reine Komposition:
 * Reducer (Wahrheit) + Zeitpläne der Domäne (Uhren) + Befehle (UI-Eingang).
 */
import { useReducer, useRef } from 'react';
import { gameReducer } from './game-reducer.js';
import { initialGameState } from './game-state.js';
import { useScheduleRunner } from './use-schedule-runner.js';
import { useColonyClock } from './use-colony-clock.js';
import { useSnapshotRunner } from './use-snapshot-runner.js';
import { useGameActions } from './use-game-actions.js';

export function useGameEngine(playerseed) {
  const [state, dispatch] = useReducer(gameReducer, playerseed, initialGameState);

  /** Die Uhren fragen den Zustand, sie besitzen ihn nicht. */
  const latest = useRef(state);
  latest.current = state;

  useScheduleRunner({ phase: state.onboarding.state, latest, dispatch });
  useColonyClock({ latest, dispatch });
  useSnapshotRunner({ latest, playerseed });

  return { state, actions: useGameActions(dispatch) };
}
