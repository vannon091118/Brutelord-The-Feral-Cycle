// @doc: docs/daten/ui/floorchip.md#floorchip
import { descendOpen, ladderOpen } from '../domain/economy/resource-cycle.js';
import { ResourceSlot } from './ResourceSlot.jsx';

function descendTitle({ open, depth, tor }) {
  if (open) return `In die Etage ${depth + 1} graben`;
  if (!tor) return 'Erst den Leiterschacht bauen — er öffnet Raid und Tiefe';
  return 'Der Schacht endet hier — keine tiefere Etage';
}

export function FloorChip({ depth, cycle, buildings = [], onDescend }) {
  if (!Number.isInteger(depth)) return null;
  const tor = ladderOpen(buildings);
  const open = descendOpen({ depth, cycle, buildings });
  const title = descendTitle({ open, depth, tor });

  return (
    <ResourceSlot rank="floor" tone={open ? 'core' : 'bone'} label="Abstieg" hint={title}>
      <span className="flex items-center gap-1.5">
        <span key={depth} className="dl-rail-value dl-rail-tick">
          Etage {depth}
        </span>
        <button
          type="button"
          disabled={!open}
          onClick={onDescend}
          title={title}
          aria-label={title}
          className={open ? 'dl-rail-action dl-rail-action--open' : 'dl-rail-action'}
        >
          ↓
        </button>
      </span>
    </ResourceSlot>
  );
}
