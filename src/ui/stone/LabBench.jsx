// @doc: docs/daten/stone/labbench.md#labbench
import { SLOT_ORDER, STONE_DEFS, STONE_SLOT } from '../../domain/brutelord/stone-config.js';
import { SPECIES_LABEL } from '../../domain/brutelord/genome-config.js';
import { genomeForStones } from '../../domain/brutelord/mutant.js';
import { speciesOf } from '../../domain/brutelord/phenotype.js';
import { MutantSvg } from '../../world/dungling/MutantSvg.jsx';

const SLOT_REST_TONE = 'border-core-500/20 text-bone-400';

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

function StoneSlot({ slot, stone, armed, onPlace }) {
  const filled = Boolean(stone);
  const tone = filled ? STONE_DEFS[stone.rarity].tone : SLOT_REST_TONE;
  return (
    <button
      type="button"
      onClick={() => onPlace(slot)}
      className={`absolute ${SLOT_POS[slot]} flex h-12 w-12 items-center justify-center rounded-xl border bg-soil-900/90 px-1 text-center text-[9px] leading-tight transition-all duration-200 hover:border-core-500/60 hover:text-bone-200 active:scale-95 ${tone} ${armed ? 'ring-2 ring-core-300/70 scale-105' : ''}`}
      aria-label={`Slot ${SLOT_LABEL[slot]}`}
    >
      {filled ? <span className="font-semibold">{STONE_DEFS[stone.rarity].label}</span> : SLOT_LABEL[slot]}
    </button>
  );
}

function SpeciesTag({ genome }) {
  if (!genome) {
    return <p className="h-8 text-center text-[10px] italic text-bone-400">Die Art zeigt sich, sobald ein Stein steckt.</p>;
  }
  const { species, alleles } = speciesOf(genome);
  return (
    <div className="h-8 text-center leading-tight">
      <p className="text-[11px] text-core-300">Art: {SPECIES_LABEL[species]}</p>
      <p className="text-[9px] text-bone-400">Anlagen: {alleles.map((allele) => SPECIES_LABEL[allele]).join(' · ')}</p>
    </div>
  );
}

function BenchFigure({ genome }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-40 w-40">
        <MutantSvg genome={genome} size={160} id="lab" muted={!genome} />
      </div>
    </div>
  );
}

export function LabBench({ placed, selected, onPlace }) {
  const genome = placed.length > 0 ? genomeForStones(placed) : null;
  return (
    <div className="dl-bench flex flex-col items-center gap-1">
      <SpeciesTag genome={genome} />
      <div className="relative h-64 w-64">
        <div className="dl-bench-glow" aria-hidden="true" />
        <div className="dl-bench-plinth" aria-hidden="true" />
        <BenchFigure genome={genome} />
        {SLOT_ORDER.map((slot) => (
          <StoneSlot
            key={slot}
            slot={slot}
            stone={placed.find((entry) => entry.slot === slot) ?? null}
            armed={selected !== null}
            onPlace={onPlace}
          />
        ))}
      </div>
    </div>
  );
}
