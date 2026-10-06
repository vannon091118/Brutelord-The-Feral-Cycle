// @doc: docs/daten/ui/floorchip.md#floorchip
import { descendOpen } from '../domain/economy/resource-cycle.js';
import { ResourceSlot } from './ResourceSlot.jsx';

function descendTitle(open, depth) {
  if (!open) return 'Der Schacht endet hier — keine tiefere Etage';
  return `In die Etage ${depth + 1} graben`;
}

export function FloorChip({ depth, cycle, onDescend }) {
  if (!Number.isInteger(depth)) return null;
  const open = descendOpen({ depth, cycle });
  const title = descendTitle(open, depth);

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
