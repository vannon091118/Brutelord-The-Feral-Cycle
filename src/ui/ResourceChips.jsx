/** Die beiden Werteplaketten des HUD: Essenz im Hive und Größe des Raums. */
export function ResourceChips({ essence, count, countLabel }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span
        title="Essenz im Hive"
        className="rounded-full border border-core-500/25 bg-core-500/10 px-2 py-1 text-[10px] leading-none text-core-300"
      >
        ◆ {essence}
      </span>
      <span className="rounded-full border border-bone-400/15 bg-soil-950/60 px-2 py-1 text-[10px] leading-none text-bone-300">
        {countLabel} {count}
      </span>
    </div>
  );
}
