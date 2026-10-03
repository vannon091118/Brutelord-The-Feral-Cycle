/**
 * Eine Bauoption. Klicken zeigt nur, dass die Option existiert — die echte
 * Bauinteraktion folgt im nächsten Schritt.
 */
export function BuildOptionButton({ option, onPick }) {
  return (
    <button
      type="button"
      onMouseEnter={onPick}
      onFocus={onPick}
      onClick={onPick}
      className="dl-inset group flex flex-col items-center gap-1.5 rounded-xl border border-bone-400/10 bg-soil-900/70 px-2 py-2.5 transition hover:border-core-400/40 hover:bg-soil-800/80 active:scale-[0.98]"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        {option.glyph}
      </svg>
      <span className="text-[11px] font-medium text-bone-200">{option.label}</span>
      <span className="text-[9px] uppercase tracking-[0.12em] text-bone-400/70">{option.hint}</span>
    </button>
  );
}
