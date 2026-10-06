/** Die Kennung der Produktions-D1-Bindung kennt nur die Deploy-Umgebung. Bis
 *  dahin traegt wrangler.jsonc den Null-Platzhalter, und binding-check.mjs weist
 *  ihn vor dem Deploy ab — eine erfundene Kennung zeigte auf keine Datenbank,
 *  und der Fehler fiele erst beim ersten Schreiben auf. */
export const PLACEHOLDER_D1_ID = '00000000-0000-0000-0000-000000000000';

const PLACEHOLDER = `Die D1-Kennung ist noch der Platzhalter ${PLACEHOLDER_D1_ID}. Vor dem Deploy `
  + '`wrangler d1 create brutalord-accounts` ausfuehren und die Ausgabe in wrangler.jsonc eintragen.';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function databaseIdProblems(id) {
  const wert = String(id ?? '').trim();
  if (wert === PLACEHOLDER_D1_ID) return [PLACEHOLDER];
  if (!UUID.test(wert)) return ['Die D1-Kennung ist keine UUID.'];
  return [];
}
