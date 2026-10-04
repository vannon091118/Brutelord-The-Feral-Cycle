import { useState } from 'react';
import { AccountForm } from './AccountForm.jsx';
import { loginAccount, registerAccount } from './account-api.js';
import { ACCOUNT_UI } from './account-ui.js';

const EMPTY = { name: '', password: '' };
const switched = (mode) => (mode === ACCOUNT_UI.register ? ACCOUNT_UI.login : ACCOUNT_UI.register);

async function send({ mode, credentials, onSignedIn, setError, setBusy }) {
  setBusy(true);
  setError(null);
  try {
    const call = mode === ACCOUNT_UI.register ? registerAccount : loginAccount;
    onSignedIn(await call(credentials));
  } catch (reason) {
    setError(reason.message);
  } finally {
    setBusy(false);
  }
}

/** Das Tor: ohne Konto kein Spiel. Wer sich anmeldet, bekommt Seed und PlayerID
 *  zurück und landet damit in seiner eigenen Welt. */
export function AccountGate({ onSignedIn }) {
  const [mode, setMode] = useState(ACCOUNT_UI.register);
  const [credentials, setCredentials] = useState(EMPTY);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  function change(field, value) {
    setCredentials((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    send({ mode, credentials, onSignedIn, setError, setBusy });
  }

  return (
    <main className="dl-root relative flex h-full w-full items-center justify-center overflow-hidden">
      <AccountForm
        mode={mode}
        credentials={credentials}
        error={error}
        busy={busy}
        onChange={change}
        onSubmit={submit}
        onSwitch={() => setMode(switched(mode))}
      />
    </main>
  );
}
