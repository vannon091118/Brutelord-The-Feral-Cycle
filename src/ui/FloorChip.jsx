import { canDescend } from '../domain/world/floor.js';

// @doc: docs/daten/ui/floorchip.md#floorchip
export function FloorChip({ depth, onDescend }) {
  if (!Number.isInteger(depth)) return null;
  const open = canDescend(depth);

  return (
    <span className="flex shrink-0 items-center gap-1 rounded-full border border-bone-400/15 bg-soil-950/60 py-1 pl-2.5 pr-1 text-[10px] leading-none text-bone-300">
      Etage {depth}
      <button
        type="button"
        disabled={!open}
        onClick={onDescend}
        title={open ? 'In die naechste Etage graben' : 'Keine tiefere Etage'}
        className="rounded-full border border-core-500/25 bg-core-500/10 px-2 py-1 text-core-300 transition-colors enabled:hover:bg-core-500/25 disabled:border-bone-400/10 disabled:bg-transparent disabled:text-bone-400/50"
      >
        ↓
      </button>
    </span>
  );
}
