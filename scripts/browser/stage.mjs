/** Die Browser-Stufe: echter Server, echter Browser, echte Zusagen — ohne eigenen Report. */
import { BEATS } from './beats.mjs';
import { checkGate } from './gate.mjs';
import { runBeat } from './judge.mjs';
import { openStage } from './page.mjs';
import { startServer, stopServer } from './server.mjs';
import { section, check } from '../verify/expect.mjs';

export async function checkBrowserStage() {
  const server = await startServer();
  const memo = { essence: 0, shots: [] };
  let stage;
  try {
    section('Browser-Abnahme: Konto-Tor');
    await checkGate();
    section('Browser-Abnahme: Onboarding im echten Browser');
    stage = await openStage();
    for (const beat of BEATS) await runBeat({ page: stage.page, beat, memo });
    section('Browser-Abnahme: Fehlerfreiheit');
    check('Die Seite meldet keinen Fehler', stage.errors.length === 0, stage.errors.slice(0, 2).join(' | '));
  } finally {
    await stage?.browser.close().catch(() => {});
    stopServer(server);
  }
  return memo;
}