// @doc: docs/daten/account/accountform.md#accountform
import { AccountField } from './AccountField.jsx';
import { ACCOUNT_UI } from './account-ui.js';

const PREMISE = Object.freeze({
  [ACCOUNT_UI.register]: 'Ein Name und ein Passwort. Daraus entsteht deine eigene Welt — ein Hive, der Erde frisst.',
  [ACCOUNT_UI.login]: 'Willkommen zurück. Dein Hive wartet auf seinen Seed.',
});

function FormIntro({ mode }) {
  return (
    <>
      <h1 className="text-lg tracking-wide text-bone-100">Brutelord: The Feral Cycle</h1>
      <p className="text-xs leading-snug text-bone-400">{PREMISE[mode]}</p>
    </>
  );
}

function FormFailure({ error }) {
  if (!error) return null;
  return (
    <p role="alert" className="dl-line-in rounded-lg border border-core-500/40 bg-core-500/10 px-2.5 py-1.5 text-xs leading-snug text-core-300">
      {error}
    </p>
  );
}

function FormSubmit({ busy, mode }) {
  const label = mode === ACCOUNT_UI.register ? 'Konto anlegen' : 'Anmelden';
  return (
    <button type="submit" className="rounded-lg bg-core-500 px-3 py-2 text-sm font-medium text-soil-950 transition-colors hover:bg-core-400 disabled:opacity-50" disabled={busy}>
      {busy ? 'Einen Moment…' : label}
    </button>
  );
}

function FormSwitch({ mode, onSwitch }) {
  return (
    <button type="button" className="text-xs text-bone-400 underline-offset-2 transition-colors hover:text-bone-200 hover:underline" onClick={onSwitch}>
      {mode === ACCOUNT_UI.register ? 'Ich habe schon ein Konto' : 'Neues Konto anlegen'}
    </button>
  );
}

export function AccountForm({ mode, credentials, error, busy, onChange, onSubmit, onSwitch }) {
  return (
    <form onSubmit={onSubmit} className="dl-panel dl-panel-in flex w-[min(92vw,360px)] flex-col gap-3 rounded-2xl p-6">
      <FormIntro mode={mode} />
      <AccountField
        label="Name"
        value={credentials.name}
        onChange={(value) => onChange('name', value)}
        autoComplete="username"
        autoFocus
        invalid={Boolean(error)}
      />
      <AccountField
        label="Passwort"
        type="password"
        value={credentials.password}
        onChange={(value) => onChange('password', value)}
        autoComplete={mode === ACCOUNT_UI.register ? 'new-password' : 'current-password'}
        invalid={Boolean(error)}
      />
      <FormFailure error={error} />
      <FormSubmit busy={busy} mode={mode} />
      <FormSwitch mode={mode} onSwitch={onSwitch} />
    </form>
  );
}
