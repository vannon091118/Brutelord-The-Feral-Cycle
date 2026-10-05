// @doc: docs/daten/raid/raid-actions.md#raid-actions
const STEP = Object.freeze({
  N: Object.freeze({ dx: 0, dy: -1 }),
  E: Object.freeze({ dx: 1, dy: 0 }),
  S: Object.freeze({ dx: 0, dy: 1 }),
  W: Object.freeze({ dx: -1, dy: 0 }),
});

export const RAID_ACTION = Object.freeze({
  MOVE_N: 'MOVE_N',
  MOVE_E: 'MOVE_E',
  MOVE_S: 'MOVE_S',
  MOVE_W: 'MOVE_W',
  DIG_N: 'DIG_N',
  DIG_E: 'DIG_E',
  DIG_S: 'DIG_S',
  DIG_W: 'DIG_W',
});

export function isKnownAction(action) {
  return Object.hasOwn(RAID_ACTION, action?.type);
}

export function isDigAction(action) {
  return isKnownAction(action) && action.type.startsWith('DIG');
}

export function neighborOf(at, action) {
  const step = STEP[action.type.slice(-1)];
  return { x: at.x + step.dx, y: at.y + step.dy };
}