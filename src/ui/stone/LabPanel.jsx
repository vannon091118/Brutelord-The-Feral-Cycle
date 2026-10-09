// @doc: docs/daten/stone/labpanel.md#labpanel
import { useState } from 'react';
import { STONE_CONFIG } from '../../domain/brutelord/stone-config.js';
import { placedStones, stoneLabel, canAffordStone, labIsFull } from '../../domain/brutelord/lab-state.js';
import { isMutant, nextCandidate, refundFor } from '../../domain/brutelord/mutant.js';
import { LabBench } from './LabBench.jsx';
import { StoneChip } from './StoneChip.jsx';

const PANEL_BG = 'bg-gradient-to-b from-[#1a1008] via-[#2a1810] to-[#1a0f08]';
const BORDER_COLOR = 'border-[#e0983a]/20';
const BUTTON_CLASS =
  'rounded-lg border border-[#e0983a]/40 bg-[#e0983a]/15 px-2.5 py-1 text-[11px] text-[#ffdca0] transition hover:bg-[#e0983a]/25 disabled:opacity-40 disabled:cursor-not-allowed';
const MAKE_CLASS =
  'rounded-lg border border-[#b06cff]/40 bg-[#b06cff]/15 px-2.5 py-1 text-[11px] text-[#d4a0ff] transition hover:bg-[#b06cff]/25 disabled:opacity-40 disabled:cursor-not-allowed';

function LabHeader({ onClose }) {
  return (
    <header className="flex items-start justify-between gap-2 pb-2 border-b border-[#e0983a]/15">
      <div className="flex items-baseline gap-2">
        <h2 className="text-[14px] font-semibold tracking-widest text-[#ffdca0]" style={{ fontFamily: 'Georgia, serif' }}>⬡ LABOR</h2>
        <span className="text-[10px] text-[#9c8a6e]">Stein-Fusion • Rückentwicklung</span>
      </div>
      <button type="button" onClick={onClose} aria-label="Labor schließen" title="Labor schließen" className="shrink-0 rounded-full border border-[#e0983a]/30 px-2 py-[2px] text-[10px] text-[#c3b294] hover:border-[#e0983a]/60 transition-colors">
        ×
      </button>
    </header>
  );
}

function LabInventory({ lab, selected, onSelect }) {
  const free = lab.stones.filter((stone) => stone.slot === null);
  if (free.length === 0) {
    const text = lab.stones.length === 0
      ? 'Der Stein-Pool ist leer. Erwerbe Essenz-Steine...'
      : 'Alle Steine stecken im Gerüst — ein belegter Platz hebt ihn wieder heraus.';
    return <p className="px-1 text-[11px] leading-snug text-[#9c8a6e] italic">{text}</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {free.map((stone) => (
        <StoneChip
          key={stone.seed}
          stone={stone}
          label={stoneLabel(lab, stone)}
          selected={selected === stone.seed}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function LabTray({ essence, full, onBuy }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-bone-400/10 bg-soil-900/60 px-3 py-2">
      <span className="text-[11px] text-bone-200">Essenz {essence}</span>
      <button type="button" className={BUTTON_CLASS} disabled={full || !canAffordStone(essence)} onClick={onBuy}>
        Stein kaufen · {STONE_CONFIG.cost}
      </button>
    </div>
  );
}

function MakeRow({ placed, candidate, onCreate }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-violet-400/25 bg-violet-500/10 px-3 py-2">
      <span className="text-[11px] text-bone-200">
        {candidate ? `Mutieren: ${candidate.id}` : 'Kein freier Dungling'}
      </span>
      <button type="button" className={MAKE_CLASS} disabled={placed === 0 || !candidate} onClick={onCreate}>
        Erschaffen · {placed}
      </button>
    </div>
  );
}

function MutantList({ mutants, onRevert }) {
  if (mutants.length === 0) return null;
  return (
    <ul className="space-y-1 pt-2">
      {mutants.map((entry) => (
        <li key={entry.id} className="flex items-center justify-between rounded-lg border border-bone-400/10 bg-soil-900/60 px-2 py-1">
          <span className="text-[10px] text-bone-300">
            {entry.id} · {entry.stones.length} Stein(e) · +{entry.refund} Essenz
          </span>
          <button type="button" className="text-[10px] text-amber-200 underline" onClick={() => onRevert(entry.id)}>
            zurückentwickeln
          </button>
        </li>
      ))}
    </ul>
  );
}

function LabFooter() {
  return (
    <p className="px-0.5 pt-2 text-[10px] leading-snug text-bone-400">
      Tippe einen Stein, dann einen Platz. Ein belegter Platz gibt den Stein zurück in den Pool. Die
      Farbe verrät die Seltenheit, der Inhalt bleibt ???, bis der Stein einmal verbaut wurde.
    </p>
  );
}

function LabWorkspace({ lab, placed, onPlace }) {
  const [selected, setSelected] = useState(null);
  const pickSlot = (slot) => {
    if (selected !== null) {
      onPlace(selected, slot);
      setSelected(null);
      return;
    }
    const occupant = placed.find((entry) => entry.slot === slot) ?? null;
    if (occupant) onPlace(occupant.seed, null);
  };
  return (
    <div className="flex gap-3 pt-3">
      <div className="min-w-0 flex-1">
        <LabInventory lab={lab} selected={selected} onSelect={setSelected} />
      </div>
      <div className="shrink-0">
        <LabBench placed={placed} selected={selected} onPlace={pickSlot} />
      </div>
    </div>
  );
}

function mutantRows(dunglings) {
  return dunglings
    .filter(isMutant)
    .map((worker) => ({ id: worker.id, stones: worker.stones, refund: refundFor(worker) }));
}

export function LabPanel({ lab, essence, dunglings, onBuy, onPlace, onCreate, onRevert, onClose }) {
  const placed = placedStones(lab);
  return (
    <section className={`dl-panel ${PANEL_BG} ${BORDER_COLOR} border w-[min(94vw,420px)] rounded-2xl px-3 pb-3 pt-2.5 shadow-2xl`} aria-label="Labor des Brutlords">
      <LabHeader onClose={onClose} />
      <LabTray essence={essence} full={labIsFull(lab)} onBuy={onBuy} />
      <LabWorkspace lab={lab} placed={placed} onPlace={onPlace} />
      <div className="pt-2">
        <MakeRow placed={placed.length} candidate={nextCandidate(dunglings)} onCreate={onCreate} />
      </div>
      <MutantList mutants={mutantRows(dunglings)} onRevert={onRevert} />
      <LabFooter />
    </section>
  );
}
