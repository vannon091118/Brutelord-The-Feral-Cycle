// @doc: docs/daten/ui/hint-texts.md#hint-texts
import { ONBOARDING_STATE } from '../domain/onboarding/onboarding-state.js';

export const HINTS = {
  [ONBOARDING_STATE.INITIAL]: {
    text: 'Der Hive wartet.',
    sub: 'Klicke ihn an — er gebiert seinen ersten Arbeiter.',
  },
  [ONBOARDING_STATE.HIVE_CLICKED]: {
    text: 'Der Hive reagiert.',
    sub: 'Er spürt den Ruf.',
  },
  [ONBOARDING_STATE.MUTATING]: {
    text: 'Der Hive verändert sich.',
    sub: 'Etwas wächst in seinem Inneren.',
  },
  [ONBOARDING_STATE.WAITING_FOR_DUNGLING]: {
    text: 'Ein Dungling entsteht.',
    sub: 'Gleich kriecht er aus dem Eingang.',
  },
  [ONBOARDING_STATE.DUNGLING_SPAWNING]: {
    text: 'Da kommt er.',
    sub: 'Der erste Arbeiter des Hive.',
  },
  [ONBOARDING_STATE.DUNGLING_IDLE]: {
    text: 'Dein Dungling lebt.',
    sub: 'Er wartet auf Arbeit.',
  },
  [ONBOARDING_STATE.TILE_SELECTION]: {
    text: 'Wähle den leuchtenden Erdblock.',
    sub: 'Nur Erde direkt am begehbaren Raum ist erreichbar.',
  },
  [ONBOARDING_STATE.ACTION_MENU]: {
    text: 'Wähle „Abbau“.',
    sub: 'Erst dann bewegt sich der Dungling.',
  },
  [ONBOARDING_STATE.MOVING_TO_TILE]: {
    text: 'Der Dungling läuft hin.',
    sub: 'Er steigt auf den Erdblock.',
  },
  [ONBOARDING_STATE.MINING]: {
    text: 'Er bricht die Erde heraus.',
    sub: 'Der Block erzählt dir, wie weit er ist.',
  },
  [ONBOARDING_STATE.TILE_DESTROYED]: {
    text: 'Der Block gibt nach.',
    sub: 'Der Platz darunter wird frei.',
  },
  [ONBOARDING_STATE.GRID_EXPANDED]: {
    text: 'Ein neues Feld gehört dir.',
    sub: 'Genau dieses eine Tile ist jetzt nutzbarer Raum.',
  },
  [ONBOARDING_STATE.BUILD_MENU_VISIBLE]: {
    text: 'Bauen ist freigeschaltet.',
    sub: 'Wähle ein Bauwerk — oder klicke einen weiteren Erdblock für mehr Raum.',
  },
};

export const PHASES = [
  { id: 'hive', label: 'Hive', reached: ONBOARDING_STATE.MUTATING },
  { id: 'worker', label: 'Dungling', reached: ONBOARDING_STATE.DUNGLING_IDLE },
  { id: 'earth', label: 'Erde', reached: ONBOARDING_STATE.MINING },
  { id: 'build', label: 'Bauen', reached: ONBOARDING_STATE.BUILD_MENU_VISIBLE },
];
