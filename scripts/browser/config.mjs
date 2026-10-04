/** Konfiguration der Browser-Abnahme: Anschluss, Sitzung, Griffe, Startzeit. */
export const BROWSER_CONFIG = Object.freeze({
  host: '127.0.0.1',
  port: 5199,
  bootTimeoutMs: 45000,
  viewport: Object.freeze({ width: 1280, height: 800 }),
  playerSeed: '0c0ffee1deadbeef',
  playerName: 'abnahme',
  accountName: 'abnahme',
  accountPassword: 'verwurzeltes-konto',
  clockStart: '2026-01-01T00:00:00Z',
});

export const SEL = Object.freeze({
  field: 'svg[aria-label="Dungeon Lord — Spielfeld"]',
  hive: '[aria-label="Hive anklicken"]',
  earth: '[role="button"][aria-label*="Erdblock bei"]',
  menu: '[role="menu"][aria-label="Erdblock"]',
  mine: '[role="menuitem"]',
  buildMenu: 'section[aria-label="Baumenü"]',
  spot: '[role="button"][aria-label^="Bauplatz für"]',
  buildingPanel: '[aria-label^="Bauwerk:"]',
  assign: '+ Dungling',
  hintPanel: '.dl-panel:has-text("Raum")',
  hint: 'p',
  submit: 'button[type="submit"]',
  nameField: 'input[autocomplete="username"]',
  passField: 'input[type="password"]',
});

export function baseUrl() {
  return `http://${BROWSER_CONFIG.host}:${BROWSER_CONFIG.port}/`;
}

/** Die gepinnte Sitzung: gleicher Seed, gleiche Welt, in jedem Lauf. */
export function pinnedSession() {
  return {
    playerId: 'p-abnahme',
    playerseed: BROWSER_CONFIG.playerSeed,
    name: BROWSER_CONFIG.playerName,
  };
}