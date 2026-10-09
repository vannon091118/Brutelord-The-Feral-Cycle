// @doc: docs/daten/stone/stonechip.md#stonechip
import { STONE_DEFS } from '../../domain/brutelord/stone-config.js';

const TONE = Object.freeze({
  grau: 'border-bone-400/30 text-bone-300',
  blau: 'border-core-400/50 text-core-300',
  lila: 'border-hive-400/50 text-hive-300',
  gold: 'border-core-300/70 text-core-300',
});

export function StoneChip({ stone, label, selected, onSelect }) {
  const def = STONE_DEFS[stone.rarity];
  const tone = TONE[def.tone];
  const placed = stone.slot !== null;

  return (
    <button
      type="button"
      onClick={() => onSelect(stone.seed)}
      aria-pressed={selected}
      className={`flex w-full flex-col items-start gap-0.5 rounded-xl border bg-soil-900/70 px-2 py-1.5 text-left transition hover:bg-soil-800/70 ${tone} ${selected ? 'ring-2 ring-core-300' : ''}`}
      aria-label={`Essenz-Stein: ${label}`}
    >
      <span className="text-[10px] font-semibold tracking-wide">{label}</span>
      <span className="text-[9px] opacity-70">
        {def.statCount} Fähigkeit{def.statCount > 1 ? 'en' : ''} · {placed ? 'verbaut' : 'frei'}
      </span>
    </button>
  );
}