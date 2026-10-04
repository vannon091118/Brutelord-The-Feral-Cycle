/**
 * App ist Komposition und jetzt auch das Konto-Tor: ohne Sitzung gibt es kein
 * Spiel, mit Sitzung startet der Seed die Welt.
 */
import { useState } from 'react';
import { useGameEngine } from '../state/use-game-engine.js';
import { AccountGate } from '../ui/account/AccountGate.jsx';
import { clearSession, readSession, writeSession } from '../ui/account/session.js';
import { GameStage } from '../ui/GameStage.jsx';
import { GameHud } from '../ui/GameHud.jsx';
export function App() {
  const [session, setSession] = useState(readSession);
  if (!session) {
    return <AccountGate onSignedIn={(next) => { writeSession(next); setSession(next); }} />;
  }
  return <Playing key={session.playerseed} session={session} onSignOut={() => { clearSession(); setSession(null); }} />;
}

function Playing({ session, onSignOut }) {
  const { state, actions } = useGameEngine(session.playerseed);

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
      <button
        type="button"
        className="absolute right-2 top-2 z-20 rounded border border-bone-700/40 bg-soil-900/70 px-2 py-1 text-[10px] text-bone-400 hover:text-bone-100"
        onClick={onSignOut}
      >
        {session.name} · abmelden
      </button>
    </main>
  );
}
