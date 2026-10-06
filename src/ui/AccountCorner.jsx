import { RaidLedger } from './RaidLedger.jsx';
import { logoutAccount } from './account/account-api.js';
import { clearSession } from './account/session.js';

// @doc: docs/daten/ui/accountcorner.md#accountcorner
export function AccountCorner({ session, swarm, onSignedOut }) {
  const signOut = () => {
    logoutAccount(session.token);
    clearSession();
    onSignedOut();
  };

  return (
    <div className="absolute right-2 top-2 z-20 flex flex-col items-end gap-1.5">
      <button
        type="button"
        className="rounded border border-bone-700/40 bg-soil-900/70 px-2 py-1 text-[10px] text-bone-400 transition-colors hover:text-bone-100"
        onClick={signOut}
      >
        {session.name} · abmelden
      </button>
      <RaidLedger token={session.token} swarm={swarm} />
    </div>
  );
}
