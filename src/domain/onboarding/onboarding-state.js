/**
 * The onboarding flow, readable at a glance:
 *
 *   INITIAL
 *   -> MUTATING
 *   -> WAITING_FOR_DUNGLING
 *   -> DUNGLING_IDLE
 *   -> TILE_SELECTION
 *   -> ACTION_MENU
 *   -> MOVING_TO_TILE
 *   -> MINING
 *   -> TILE_DESTROYED
 *   -> GRID_EXPANDED
 *   -> BUILD_MENU_VISIBLE
 */

export const STAGE = {
  INITIAL: 'INITIAL',
  MUTATING: 'MUTATING',
  WAITING_FOR_DUNGLING: 'WAITING_FOR_DUNGLING',
  DUNGLING_IDLE: 'DUNGLING_IDLE',
  TILE_SELECTION: 'TILE_SELECTION',
  ACTION_MENU: 'ACTION_MENU',
  MOVING_TO_TILE: 'MOVING_TO_TILE',
  MINING: 'MINING',
  TILE_DESTROYED: 'TILE_DESTROYED',
  GRID_EXPANDED: 'GRID_EXPANDED',
  BUILD_MENU_VISIBLE: 'BUILD_MENU_VISIBLE',
  SLICE_COMPLETE: 'SLICE_COMPLETE',
};

/** The stages a player actually walks through, in order. */
export const STAGE_FLOW = [
  STAGE.INITIAL,
  STAGE.WAITING_FOR_DUNGLING,
  STAGE.TILE_SELECTION,
  STAGE.ACTION_MENU,
  STAGE.MOVING_TO_TILE,
  STAGE.MINING,
  STAGE.TILE_DESTROYED,
  STAGE.BUILD_MENU_VISIBLE,
];

const STAGE_INDEX = new Map(STAGE_FLOW.map((stage, index) => [stage, index]));

export function stageIndex(stage) {
  return STAGE_INDEX.has(stage) ? STAGE_INDEX.get(stage) : 0;
}

export function stageProgress(stage) {
  return (stageIndex(stage) + 1) / STAGE_FLOW.length;
}

/** Hint copy. Pure data - the component only renders it. */
export const STAGE_HINTS = {
  [STAGE.INITIAL]: {
    title: 'Ein Hive im Erdreich',
    body: 'Tippe den Hive an, damit er seinen ersten Dungling formt.',
    hint: 'Ziel: erster Dungling',
  },
  [STAGE.MUTATING]: {
    title: 'Der Hive reagiert',
    body: 'Der Kern des Hive öffnet sich. Etwas wird geboren.',
    hint: 'Ziel: Hive mutiert sichtbar',
  },
  [STAGE.WAITING_FOR_DUNGLING]: {
    title: 'Der Hive arbeitet',
    body: 'In ein paar Sekunden erscheint der erste Dungling.',
    hint: 'Ziel: Dungling erscheint',
  },
  [STAGE.DUNGLING_IDLE]: {
    title: 'Ein Dungling lebt',
    body: 'Der Dungling steht bereit. Ein angrenzender Erdblock ist jetzt die sinnvolle nächste Aufgabe.',
    hint: 'Ziel: angrenzende Erde abbauen',
  },
  [STAGE.TILE_SELECTION]: {
    title: 'Ein Block ist auserwählt',
    body: 'Was soll mit diesem Erdblock geschehen?',
    hint: 'Ziel: Aktion wählen',
  },
  [STAGE.ACTION_MENU]: {
    title: 'Abbau',
    body: 'Der Dungling läuft hin und bricht die Erde auf.',
    hint: 'Ziel: Abbau starten',
  },
  [STAGE.MOVING_TO_TILE]: {
    title: 'Unterwegs',
    body: 'Kleine Schritte, große Aufgabe.',
    hint: 'Ziel: Dungling erreicht die Erde',
  },
  [STAGE.MINING]: {
    title: 'Erde bricht',
    body: 'Die Erde zeigt ihre Arbeit: volle Form, dann Risse, dann Sturz.',
    hint: 'Ziel: Block abbauen',
  },
  [STAGE.TILE_DESTROYED]: {
    title: 'Die Erde gibt nach',
    body: 'Aus dem Erdblock wird freier Raum.',
    hint: 'Ziel: genau ein neuer nutzbarer Tile',
  },
  [STAGE.GRID_EXPANDED]: {
    title: 'Neuer Boden',
    body: 'Das nutzbare Grid ist um genau einen Tile gewachsen.',
    hint: 'Ziel: Raum gehört dem Spieler',
  },
  [STAGE.BUILD_MENU_VISIBLE]: {
    title: 'Jetzt kann gebaut werden',
    body: 'Der neue Boden ist freier Dungeonraum. Hier startet das Bauen.',
    hint: 'Ziel: Baumenü',
  },
  [STAGE.SLICE_COMPLETE]: {
    title: 'Der erste Moment ist geschafft',
    body: 'Hive, Dungling, Abbau und ein Stück neuer Welt.',
    hint: 'Slice vollständig',
  },
};

export function hintForStage(stage) {
  return (
    STAGE_HINTS[stage] ?? {
      title: 'Dungeon Lord',
      body: '',
      hint: '',
    }
  );
}