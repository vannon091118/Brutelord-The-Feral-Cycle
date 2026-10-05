// @doc: docs/daten/account/accountform.md#accountform
import { AccountField } from './AccountField.jsx';
import { ACCOUNT_UI } from './account-ui.js';

export function AccountForm({ mode, credentials, error, busy, onChange, onSubmit, onSwitch }) {
  return (
    <form onSubmit={onSubmit} className="relative flex w-80 flex-col gap-3 rounded-lg border border-bone-700/40 bg-soil-900/80 p-6">
      <h1 className="text-lg tracking-wide text-bone-100">Dungeon Lord</h1>
      <p className="text-xs text-bone-400">
        {mode === ACCOUNT_UI.register
          ? 'Ein Name und ein Passwort. Daraus entsteht deine eigene Welt.'
          : 'Willkommen zurück. Deine Welt wartet auf ihren Seed.'}
      </p>
      <AccountField label="Name" value={credentials.name} onChange={(value) => onChange('name', value)} autoComplete="username" />
      <AccountField
        label="Passwort"
        type="password"
        value={credentials.password}
        onChange={(value) => onChange('password', value)}
        autoComplete={mode === ACCOUNT_UI.register ? 'new-password' : 'current-password'}
      />
      {error ? <p className="text-xs text-core-300">{error}</p> : null}
      <button type="submit" className="rounded bg-core-500/80 px-3 py-2 text-sm text-soil-950 disabled:opacity-50" disabled={busy}>
        {busy ? 'Einen Moment…' : mode === ACCOUNT_UI.register ? 'Konto anlegen' : 'Anmelden'}
      </button>
      <button type="button" className="text-xs text-bone-400 underline-offset-2 hover:underline" onClick={onSwitch}>
        {mode === ACCOUNT_UI.register ? 'Ich habe schon ein Konto' : 'Neues Konto anlegen'}
      </button>
    </form>
  );
}
