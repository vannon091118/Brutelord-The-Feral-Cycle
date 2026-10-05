// @doc: docs/daten/stone/labbench.md#labbench
import { useCallback } from 'react';
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
  grau: 'border-[#9aa0a6]/40 text-[#9aa0a6]',
  blau: 'border-[#5aa9ff]/40 text-[#5aa9ff]',
  lila: 'border-[#b06cff]/40 text-[#b06cff]',
  gold: 'border-[#ffcf5a]/40 text-[#ffcf5a]',
});

function StoneSlot({ slot, stone, onDropAction, isHovered }) {
  const filled = Boolean(stone);
  const tone = filled ? SLOT_TONE[STONE_DEFS[stone.rarity].tone] : 'border-[#e0983a]/20 text-[#9c8a6e]';
  return (
    <div
      onDragOver={(event) => { event.preventDefault(); }}
      onDrop={(event) => { event.preventDefault(); onDropAction(slot, event.dataTransfer.getData('text/plain')); }}
      className={`absolute ${SLOT_POS[slot]} flex h-12 w-12 items-center justify-center rounded-xl border bg-[#1a1008]/90 px-1 text-center text-[9px] leading-tight transition-all duration-200 ${tone} ${isHovered ? 'ring-2 ring-[#e0983a]/50 scale-105' : ''}`}
      aria-label={`Slot ${SLOT_LABEL[slot]}`}
    >
      {filled ? <span className="font-semibold">{STONE_DEFS[stone.rarity].label}</span> : SLOT_LABEL[slot]}
    </div>
  );
}

export function LabBench({ placed, onDrop }) {
  const handleDrop = useCallback((slot, seed) => {
    onDrop(seed, slot);
  }, [onDrop]);

  return (
    <div className="relative mx-auto h-64 w-64">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-40 h-40">
          <MutantSvg stones={placed} size={160} id="lab" />
        </div>
      </div>
      {SLOT_ORDER.map((slot) => (
        <StoneSlot
          key={slot}
          slot={slot}
          stone={placed.find((entry) => entry.slot === slot) ?? null}
          onDropAction={handleDrop}
          isHovered={false}
        />
      ))}
    </div>
  );
}
