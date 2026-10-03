import { BuildMenu } from './BuildMenu.jsx';
import { OnboardingHint } from './OnboardingHint.jsx';

/**
 * Das HUD unten: Baumenü (erst nach dem ersten freien Boden) und die
 * Hinweiszeile. Beides gehört zur Welt, nicht zu einer Website.
 */
export function GameHud({ game }) {
  return (
    <div className="pointer-events-none relative z-10 flex w-full flex-col items-center gap-2 px-3 pb-3">
      {game.buildMenuVisible ? (
        <div className="pointer-events-auto">
          <BuildMenu usableTileCount={game.usableTileCount} />
        </div>
      ) : null}
      <div className="pointer-events-auto">
        <OnboardingHint onboarding={game.onboarding} usableTileCount={game.usableTileCount} />
      </div>
    </div>
  );
}
