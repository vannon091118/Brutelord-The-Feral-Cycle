/**
 * Der Spielmotor des Slices — reine Komposition:
 * Reducer (Wahrheit) + Zeitpläne der Domäne (Uhren) + Befehle (UI-Eingang).
 */
import { useReducer, useRef } from 'react';
import { createInitialGameState } from './game-state.js';
import { gameReducer } from './game-reducer.js';
import { useScheduleRunner } from './use-schedule-runner.js';
import { useRootingRunner } from './use-rooting-runner.js';
import { useWorkRunner } from './use-work-runner.js';
import { useGameActions } from './use-game-actions.js';

export function useGameEngine() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);

  /** Die Uhren fragen den Zustand, sie besitzen ihn nicht. */
  const latest = useRef(state);
  latest.current = state;

  useScheduleRunner({ phase: state.onboarding.state, latest, dispatch });
  useRootingRunner({ latest, dispatch });
  useWorkRunner({ latest, dispatch });

  return { state, actions: useGameActions(dispatch) };
}
