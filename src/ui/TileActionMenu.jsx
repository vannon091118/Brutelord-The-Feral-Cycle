import { useLayoutEffect, useRef, useState } from 'react';
import { MiningMenuItem } from './MiningMenuItem.jsx';
import { MENU_BOX, menuPositionFor } from './menu-position.js';

// @doc: docs/daten/ui/tileactionmenu.md#tileactionmenu
function TileMenuTitle() {
  return (
    <div className="flex items-center gap-1.5 px-1.5 pb-1.5 pt-0.5">
      <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M6 1.2 8.4 6.4H3.6Z" fill="var(--color-soil-400)" />
        <path d="M2 8.4h8v2.2H2z" fill="var(--color-soil-600)" />
      </svg>
      <span className="text-[10px] uppercase tracking-[0.16em] text-bone-400">Erdblock</span>
    </div>
  );
}

function TileMenuHint() {
  return (
    <p className="px-1.5 pb-0.5 pt-1.5 text-[10px] leading-snug text-bone-400/80">
      Der Dungling läuft hin und bricht den Block auf.
    </p>
  );
}

function useEscapeKey(onClose) {
  useLayoutEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);
}

export function TileActionMenu({ left, top, onMine, onClose }) {
  const [place, setPlace] = useState(null);
  const node = useRef(null);
  useLayoutEffect(() => {
    setPlace(menuPositionFor({ anchor: { left, top }, bounds: node.current.parentElement.getBoundingClientRect() }));
  }, [left, top]);
  useEscapeKey(onClose);
  const spot = place ?? { left, top, flipped: false };

  return (
    <div
      ref={node}
      className="dl-panel dl-menu-in absolute z-20 rounded-2xl px-3 pb-3 pt-2.5"
      style={{
        left: spot.left, top: spot.top, width: MENU_BOX.width,
        visibility: place ? 'visible' : 'hidden',
        transform: 'translate(-50%, -100%)',
        '--dl-menu-shift': spot.flipped ? '-10px' : '10px',
      }}
      role="menu"
      aria-label="Erdblock"
    >
      <TileMenuTitle />
      <MiningMenuItem onMine={onMine} />
      <TileMenuHint />
    </div>
  );
}
