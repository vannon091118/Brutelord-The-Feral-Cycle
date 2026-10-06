// @doc: docs/daten/account/accountfield.md#accountfield
export function AccountField({ label, type = 'text', value, onChange, autoComplete, autoFocus = false, invalid = false }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-bone-300">
      {label}
      <input
        type={type}
        className="rounded-lg border border-bone-700/50 bg-soil-950/70 px-2.5 py-2 text-sm text-bone-100 outline-none transition-colors focus:border-core-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        aria-invalid={invalid || undefined}
        required
      />
    </label>
  );
}
