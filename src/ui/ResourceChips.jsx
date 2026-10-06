// @doc: docs/daten/ui/resourcechips.md#resourcechips
export function ResourceChips({ essence, count, countLabel, bound = 0 }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span
        title="Essenz im Hive"
        className="rounded-full border border-core-500/25 bg-core-500/10 px-2 py-1 text-[10px] leading-none text-core-300"
      >
        ◆ {essence}
      </span>
      {bound > 0 ? (
        <span
          title="An offene Bauplätze gebunden — Träger bringen sie erst hin"
          className="rounded-full border border-hive-400/30 bg-hive-500/10 px-2 py-1 text-[10px] leading-none text-hive-300"
        >
          ⟳ {bound} gebunden
        </span>
      ) : null}
      <span className="rounded-full border border-bone-400/15 bg-soil-950/60 px-2 py-1 text-[10px] leading-none text-bone-300">
        {countLabel} {count}
      </span>
    </div>
  );
}
