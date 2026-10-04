/**
 * Der Mitschnitt: ein MutationObserver notiert jeden Wechsel der Hinweiszeile,
 * damit kein kurzlebiger Zustand wegfliesst, nur weil zu spaet gelesen wurde.
 */
const SCRIPT = () => {
  const seen = [];
  window.__hints = seen;
  const read = () => {
    const panel = [...document.querySelectorAll('.dl-panel')].find((node) => node.textContent.includes('Raum'));
    const text = panel?.querySelector('p')?.innerText.trim() ?? '';
    if (text && seen[seen.length - 1] !== text) seen.push(text);
  };
  new MutationObserver(read).observe(document.body, { childList: true, subtree: true, characterData: true });
  read();
};

export const startRecording = (page) => page.evaluate(SCRIPT);

export const readRecording = (page) => page.evaluate(() => window.__hints ?? []);

/** Was von der Soll-Kette gefehlt hat; leer heisst: alles gesehen, in Ordnung. */
export function missingFrom(seen, wanted) {
  const missing = [];
  let cursor = 0;
  for (const text of seen) {
    if (text === wanted[cursor]) cursor += 1;
  }
  if (cursor < wanted.length) missing.push(wanted.slice(cursor));
  return missing.length ? missing[0] : [];
}