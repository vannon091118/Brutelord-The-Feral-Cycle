/**
 * Das Prüfgerüst der Slice-Verifikation: sammelt Ergebnisse, zählt Fehler und
 * gibt am Ende einen lesbaren Bericht aus.
 */
const lines = [];
let failures = 0;

export function section(title) {
  lines.push(`\n${title}`);
}

export function check(label, condition, detail = '') {
  const ok = Boolean(condition);
  if (!ok) failures += 1;
  lines.push(`${ok ? '  ok  ' : ' FAIL '} ${label}${detail ? ` — ${detail}` : ''}`);
  return ok;
}

/** Fuer den lokalen Lauf: eine Gruppe liest ihren eigenen Zaehlerstand. */
export function failureCount() {
  return failures;
}

export function summary() {
  console.log(lines.join('\n'));
  const passed = lines.filter((line) => line.startsWith('  ok')).length;
  if (failures === 0) {
    console.log(`\nAlle ${passed} Prüfungen bestanden.`);
    return 0;
  }
  console.log(`\n${failures} von ${passed + failures} Prüfungen fehlgeschlagen.`);
  return 1;
}
