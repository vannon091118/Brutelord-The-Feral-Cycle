#!/usr/bin/env node
/** Die Browser-Abnahme: echter Dev-Server, echter Browser, echte Zusagen. */
import { BEATS } from './browser/beats.mjs';
import { checkGate } from './browser/gate.mjs';
import { runBeat } from './browser/judge.mjs';
import { openStage } from './browser/page.mjs';
import { startServer, stopServer } from './browser/server.mjs';
import { shotDir } from './browser/shots.mjs';
import { check, section, summary } from './verify/expect.mjs';

const server = await startServer();
let stage;
let memo = { essence: 0, shots: [] };
try {
  section('Browser-Abnahme: Konto-Tor');
  await checkGate();

  section('Browser-Abnahme: Onboarding im echten Browser');
  stage = await openStage();
  for (const beat of BEATS) await runBeat({ page: stage.page, beat, memo });

  section('Browser-Abnahme: Fehlerfreiheit');
  check('Die Seite meldet keinen Fehler', stage.errors.length === 0, stage.errors.slice(0, 2).join(' | '));
  console.log(`\nBilder in ${shotDir()}:`);
  memo.shots.forEach((file) => console.log(`  ${file}`));
} finally {
  await stage?.browser.close().catch(() => {});
  stopServer(server);
}
process.exitCode = summary();