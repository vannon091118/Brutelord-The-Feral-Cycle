import { useState } from 'react';
import { BUILD_OPTIONS } from './build-options.jsx';
import { BuildOptionButton } from './BuildOptionButton.jsx';

/**
 * Das Baumenü: erscheint erst, wenn ein Tile tatsächlich nutzbarer Boden ist.
 * Es ist die logische Konsequenz aus dem Abbau — noch ohne echte Bauinteraktion.
 */
function BuildHeader({ count }) {
  return (
    <header className="flex items-baseline justify-between px-0.5 pb-2">
      <div className="flex items-baseline gap-2">
        <h2 className="text-[13px] font-semibold tracking-wide text-bone-100">Bauen</h2>
        <span className="text-[10px] text-bone-400">freier Boden wartet</span>
      </div>
      <span className="rounded-full border border-core-500/25 bg-core-500/10 px-2 py-[2px] text-[10px] text-core-300">
        {count} {count === 1 ? 'Feld' : 'Felder'}
      </span>
    </header>
  );
}

function BuildOptions({ onPick }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {BUILD_OPTIONS.map((option) => (
        <BuildOptionButton key={option.id} option={option} onPick={() => onPick(option.id)} />
      ))}
    </div>
  );
}

export function BuildMenu({ usableTileCount }) {
  const [picked, setPicked] = useState(null);
  const note = picked
    ? 'Bauoptionen folgen im nächsten Schritt — der Boden dafür ist jetzt da.'
    : 'Wähle einen Erdblock, um weiteren Raum zu gewinnen.';

  return (
    <section
      className="dl-panel dl-panel-in w-[min(92vw,352px)] rounded-2xl px-3 pb-3 pt-2.5"
      aria-label="Baumenü"
    >
      <BuildHeader count={usableTileCount} />
      <BuildOptions onPick={setPicked} />
      <p className="px-0.5 pt-2 text-[10px] leading-snug text-bone-400">{note}</p>
    </section>
  );
}
