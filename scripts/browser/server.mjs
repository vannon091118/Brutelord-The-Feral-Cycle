/** Der Dev-Server als Kindprozess: hochfahren, auf Antwort warten, beenden. */
import { spawn } from 'node:child_process';
import { BROWSER_CONFIG, baseUrl } from './config.mjs';

const VITE_ENTRY = 'node_modules/vite/bin/vite.js';

async function answers(url) {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
}

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function startServer() {
  if (BROWSER_CONFIG.external) return null;
  const flags = ['--port', String(BROWSER_CONFIG.port), '--strictPort'];
  const proc = spawn(process.execPath, [VITE_ENTRY, ...flags], { cwd: process.cwd(), stdio: 'ignore' });
  const tries = Math.ceil(BROWSER_CONFIG.bootTimeoutMs / 500);
  for (let attempt = 0; attempt < tries; attempt++) {
    if (await answers(baseUrl())) return proc;
    await pause(500);
  }
  proc.kill('SIGTERM');
  throw new Error(`Dev-Server antwortet nach ${BROWSER_CONFIG.bootTimeoutMs} ms nicht auf ${baseUrl()}`);
}

export function stopServer(proc) {
  proc?.kill('SIGTERM');
}