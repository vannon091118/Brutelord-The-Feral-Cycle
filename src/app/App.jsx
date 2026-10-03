import { useGameEngine } from '../state/use-game-engine.js';
import { GameStage } from '../ui/GameStage.jsx';
import { GameHud } from '../ui/GameHud.jsx';

/**
 * App ist nur Komposition: Zustand aus dem Reducer, Bühne und HUD als
 * Darstellung. Keine Spielregel in dieser Datei.
 */
export function App() {
  const { state, actions } = useGameEngine();

  return (
    <main className="dl-root relative flex h-full w-full flex-col overflow-hidden">
      {/* Lichtstimmung der Kammer hinter der Welt */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(58% 46% at 50% 44%, rgba(224,152,58,0.10) 0%, rgba(10,7,5,0) 70%)',
        }}
      />
      <GameStage game={state} actions={actions} />
      <GameHud game={state} actions={actions} />
    </main>
  );
}
