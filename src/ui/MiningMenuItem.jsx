// @doc: docs/daten/ui/miningmenuitem.md#miningmenuitem
export function MiningMenuItem({ onMine }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onMine}
      className="group flex w-full items-center gap-2.5 rounded-lg border border-core-500/25 bg-core-500/10 px-2.5 py-2 text-left transition hover:border-core-400/60 hover:bg-core-500/20 active:scale-[0.98]"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
        <path d="M3.5 20.5 12 12" stroke="var(--color-bone-300)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M11 4.5c3-2 6.5-1.6 9 1.2-2.6 1.1-5.2 1.4-7.6.9" fill="var(--color-bone-200)" />
        <path
          d="M11.4 6.6 19.6 5c.5 1.7.4 3.2-.3 4.4-2-2.1-4.6-3.1-7.9-2.8Z"
          fill="var(--color-soil-400)"
        />
      </svg>
      <span className="flex flex-col leading-tight">
        <span className="text-[13px] font-semibold text-bone-100">Abbau</span>
        <span className="text-[10px] text-bone-400">Erde herausbrechen</span>
      </span>
    </button>
  );
}
