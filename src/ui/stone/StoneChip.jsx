/** Eine Essenz-Kachel im Inventar: Die Seltenheit verrät sich, der Inhalt bleibt ???. */
import { STONE_DEFS } from '../../domain/brutelord/stone-config.js';

const TONE = Object.freeze({
  grau: 'border-bone-400/30 text-bone-300',
  blau: 'border-core-400/50 text-core-300',
  lila: 'border-violet-400/50 text-violet-300',
  gold: 'border-amber-300/60 text-amber-200',
});

export function StoneChip({ stone, label, onDragStart }) {
  const def = STONE_DEFS[stone.rarity];
  const tone = TONE[def.tone];
  const placed = stone.slot !== null;

  return (
    <button
      type="button"
      draggable
      onDragStart={(event) => onDragStart(event, stone.seed)}
      className={`flex w-full flex-col items-start gap-0.5 rounded-xl border bg-soil-900/70 px-2 py-1.5 text-left transition hover:bg-soil-800/70 ${tone}`}
      aria-label={`Essenz-Stein: ${label}`}
    >
      <span className="text-[10px] font-semibold tracking-wide">{label}</span>
      <span className="text-[9px] opacity-70">
        {def.statCount} Fähigkeit{def.statCount > 1 ? 'en' : ''} · {placed ? 'verbaut' : 'frei'}
      </span>
    </button>
  );
}