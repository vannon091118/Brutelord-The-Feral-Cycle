/**
 * Eine Bauoption: Form, Name, Hinweis und Preis. Fehlt die Essenz, bleibt der
 * Knopf stehen, aber kraftlos — der Preis erklärt, warum. Gewählt trägt er
 * einen Kernrand; ein zweiter Klick nimmt die Wahl zurück.
 */
export function BuildOptionButton({ option, def, affordable, picked, onPick }) {
  const tone = picked
    ? 'border-core-300/70 bg-soil-800'
    : affordable
      ? 'border-bone-400/10 bg-soil-900/70 hover:border-core-400/40 hover:bg-soil-800/80'
      : 'border-bone-400/5 bg-soil-950/60 opacity-55';

  return (
    <button
      type="button"
      onClick={onPick}
      disabled={!affordable}
      aria-pressed={picked}
      className={`dl-inset group flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 transition active:scale-[0.98] ${tone}`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        {option.glyph}
      </svg>
      <span className="text-[11px] font-medium text-bone-200">{def.label}</span>
      <span className="text-center text-[9px] uppercase tracking-[0.12em] text-bone-400/70">{def.hint}</span>
      <span className="rounded-full border border-core-500/30 bg-core-500/10 px-1.5 text-[10px] text-core-300">
        ◆ {def.cost}
      </span>
    </button>
  );
}
