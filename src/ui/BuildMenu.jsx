// @doc: docs/daten/ui/buildmenu.md#buildmenu
import { BUILDING_DEFS, BUILDING_STATE, canAfford } from '../domain/buildings/building-config.js';
import { BUILD_OPTIONS } from './build-options.jsx';
import { BuildOptionButton } from './BuildOptionButton.jsx';
import { ResourceChips } from './ResourceChips.jsx';

function BuildHeader({ count, essence }) {
  return (
    <header className="flex items-baseline justify-between px-0.5 pb-2">
      <div className="flex items-baseline gap-2">
        <h2 className="text-[13px] font-semibold tracking-wide text-bone-100">Bauen</h2>
        <span className="text-[10px] text-bone-400">freier Boden wartet</span>
      </div>
      <ResourceChips essence={essence} count={count} countLabel={count === 1 ? 'Feld' : 'Felder'} />
    </header>
  );
}

function noteFor({ buildChoice, buildings, essence }) {
  if (buildChoice) return `${BUILDING_DEFS[buildChoice].label}: Klicke freien Boden als Bauplatz an.`;
  if (buildings.some((building) => building.state === BUILDING_STATE.SITE)) {
    return 'Träger bringen Essenz zum Bauplatz, bis das Bauwerk steht.';
  }
  if (essence <= 0) return 'Keine Essenz: Ein Extraktor mit zugewiesenen Dunglingen presst neue.';
  return 'Wähle einen Bau — Dunglinge tragen die Essenz Stück für Stück hin.';
}

function BuildOptions({ essence, buildChoice, onChoose }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {BUILD_OPTIONS.map((option) => (
        <BuildOptionButton
          key={option.type}
          option={option}
          def={BUILDING_DEFS[option.type]}
          affordable={canAfford(essence, option.type)}
          picked={buildChoice === option.type}
          onPick={() => onChoose(option.type)}
        />
      ))}
    </div>
  );
}

export function BuildMenu({ essence, usableTileCount, buildings, buildChoice, onChoose }) {
  return (
    <section className="dl-panel dl-panel-in w-[min(92vw,352px)] rounded-2xl px-3 pb-3 pt-2.5" aria-label="Baumenü">
      <BuildHeader count={usableTileCount} essence={essence} />
      <BuildOptions essence={essence} buildChoice={buildChoice} onChoose={onChoose} />
      <p className="px-0.5 pt-2 text-[10px] leading-snug text-bone-400">
        {noteFor({ buildChoice, buildings, essence })}
      </p>
    </section>
  );
}
