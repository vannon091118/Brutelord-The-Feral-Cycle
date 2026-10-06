// @doc: docs/daten/ui/resourcerail.md#resourcerail
import { FloorChip } from './FloorChip.jsx';
import { ResourceSlot } from './ResourceSlot.jsx';

const DEEP = [
  {
    id: 'aether',
    glyph: '✶',
    label: 'Aether',
    tone: 'aether',
    hint: 'Aether entsteht beim Graben in der Tiefe und mutiert den Hive.',
    leer: 'Noch kein Aether: er kommt erst aus tiefem Erdreich.',
  },
  {
    id: 'bloodstone',
    glyph: '♦',
    label: 'Blutstein',
    tone: 'blood',
    hint: 'Blutstein kommt nur aus einem Raid gegen einen fremden Hive.',
    leer: 'Noch kein Blutstein: nur ein Raid zahlt ihn aus.',
  },
];

function storedOf(ledger) {
  return Number.isFinite(ledger?.stored) ? ledger.stored : null;
}

function deepProps(slot, value) {
  return {
    glyph: slot.glyph,
    label: slot.label,
    tone: slot.tone,
    rank: 'deep',
    value: value === null ? '—' : value,
    state: value > 0 ? 'live' : 'empty',
    hint: value > 0 ? slot.hint : slot.leer,
  };
}

export function ResourceRail({ essence, depth, cycle, onDescend }) {
  return (
    <div className="dl-rail" role="group" aria-label="Ressourcen des Hive">
      <ResourceSlot
        rank="lead"
        tone="core"
        glyph="◆"
        label="Essenz"
        value={essence}
        hint="Essenz im Hive — sie bezahlt Bau und Abbau."
      />
      <ResourceSlot
        tone="moss"
        glyph="✚"
        label="Biomasse"
        state="locked"
        value="—"
        hint="Biomasse ist in der Domaene noch nicht angelegt."
      />
      {DEEP.map((slot) => (
        <ResourceSlot key={slot.id} {...deepProps(slot, storedOf(cycle?.[slot.id]))} />
      ))}
      <FloorChip depth={depth} cycle={cycle} onDescend={onDescend} />
    </div>
  );
}
