// @doc: docs/daten/account/accountfield.md#accountfield
export function AccountField({ label, type = 'text', value, onChange, autoComplete }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-bone-300">
      {label}
      <input
        type={type}
        className="rounded border border-bone-700/50 bg-soil-950/70 px-2 py-1.5 text-sm text-bone-100 outline-none focus:border-core-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required
      />
    </label>
  );
}
