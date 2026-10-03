/** Der Arbeitstisch: der nackte Dungling in der Mitte, vier Slots drumherum. */
import { SLOT_ORDER, STONE_DEFS, STONE_SLOT } from '../../domain/brutelord/stone-config.js';
import { MutantSvg } from '../../world/dungling/MutantSvg.jsx';

const SLOT_LABEL = Object.freeze({
  [STONE_SLOT.HEAD]: 'Kopf',
  [STONE_SLOT.TORSO]: 'Rumpf',
  [STONE_SLOT.ARMS]: 'Arme',
  [STONE_SLOT.LEGS]: 'Beine',
});

const SLOT_POS = Object.freeze({
  [STONE_SLOT.HEAD]: 'left-1/2 top-0 -translate-x-1/2',
  [STONE_SLOT.TORSO]: 'left-0 top-1/2 -translate-y-1/2',
  [STONE_SLOT.ARMS]: 'right-0 top-1/2 -translate-y-1/2',
  [STONE_SLOT.LEGS]: 'left-1/2 bottom-0 -translate-x-1/2',
});

const SLOT_TONE = Object.freeze({
  grau: 'border-bone-400/40 text-bone-300',
  blau: 'border-core-400/60 text-core-300',
  lila: 'border-violet-400/60 text-violet-300',
  gold: 'border-amber-300/70 text-amber-200',
});

function StoneSlot({ slot, stone, onDrop }) {
  const filled = Boolean(stone);
  const tone = filled ? SLOT_TONE[STONE_DEFS[stone.rarity].tone] : 'border-dashed border-bone-400/25 text-bone-400';
  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDrop(slot)}
      className={`absolute ${SLOT_POS[slot]} flex h-12 w-12 items-center justify-center rounded-xl border bg-soil-950/80 px-1 text-center text-[9px] leading-tight ${tone}`}
      aria-label={`Slot ${SLOT_LABEL[slot]}`}
    >
      {filled ? <span className="font-semibold">{STONE_DEFS[stone.rarity].label}</span> : SLOT_LABEL[slot]}
    </div>
  );
}

export function LabBench({ placed, onDrop }) {
  const stoneIn = (slot) => placed.find((entry) => entry.slot === slot) ?? null;
  return (
    <div className="relative mx-auto h-56 w-56">
      {SLOT_ORDER.map((slot) => (
        <StoneSlot key={slot} slot={slot} stone={stoneIn(slot)} onDrop={onDrop} />
      ))}
      <div className="absolute inset-7">
        <MutantSvg stones={placed} />
      </div>
    </div>
  );
}