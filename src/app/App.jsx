// @doc: docs/daten/app/app.md#app
import { useState } from 'react';
import { useGameEngine } from '../state/use-game-engine.js';
import { AccountCorner } from '../ui/AccountCorner.jsx';
import { AccountGate } from '../ui/account/AccountGate.jsx';
import { readSession, writeSession } from '../ui/account/session.js';
import { GameStage } from '../ui/GameStage.jsx';
import { GameHud } from '../ui/GameHud.jsx';
export function App() {
  const [session, setSession] = useState(readSession);
  if (!session) {
    return <AccountGate onSignedIn={(next) => { writeSession(next); setSession(next); }} />;
  }
  return <Playing key={session.playerseed} session={session} onSignedOut={() => setSession(null)} />;
}

function Playing({ session, onSignedOut }) {
  const { state, actions } = useGameEngine(session);

  return (
    <main className="dl-root relative flex h-full w-full flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(58% 46% at 50% 44%, rgba(224,152,58,0.10) 0%, rgba(10,7,5,0) 70%)',
        }}
      />
      <GameStage game={state} actions={actions} />
      <GameHud game={state} actions={actions} />
      <AccountCorner session={session} swarm={state.dunglings} onSignedOut={onSignedOut} />
    </main>
  );
}
