/**
 * Zeiten der Verwurzelung. Alle Werte an einem Ort, damit der Ablauf
 * prüfbar bleibt, ohne einen Browser zu starten: kein Modul darf seine
 * eigenen Zahlen mitbringen.
 */
export const ROOTING_CONFIG = Object.freeze({
  /** Wie lange ein Feld gebraucht, bis es vollständig eingenommen ist. */
  claimDurationMs: 10000,

  /** Ruhe danach: erst danach stoßen die Tentakel in die Nachbarfelder. */
  cooldownMs: 5000,

  /** Takt der Sim-Uhr. Fein genug, damit die Tentakel kriechen. */
  tickMs: 100,
});