#!/usr/bin/env node
/** Die Browser-Abnahme allein: dieselbe Stufe, die auch in der Standard-verify läuft. */
import { checkBrowserStage } from './browser/stage.mjs';
import { shotDir } from './browser/shots.mjs';
import { summary } from './verify/expect.mjs';

const memo = await checkBrowserStage();
console.log(`\nBilder in ${shotDir()}:`);
memo.shots.forEach((file) => console.log(`  ${file}`));
process.exitCode = summary();