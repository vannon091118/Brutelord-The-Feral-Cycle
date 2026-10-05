/** Der Test-Server: eigener Port, eigene Kontodatenbank, Log auf Disk. */
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(process.cwd(), 'tools', 'tests');

export function launchServer({ port = 5211 } = {}) {
  const env = { ...process.env, DL_DATA_DIR: join(ROOT, '.data') };
  mkdirSync(env.DL_DATA_DIR, { recursive: true });
  const proc = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(port), '--strictPort'], {
    cwd: process.cwd(),
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return ready(proc, port);
}

async function ready(proc, port) {
  const tries = 90;
  for (let attempt = 0; attempt < tries; attempt += 1) {
    proc.stderr?.once('data', (chunk) => process.stderr.write(`[vite] ${chunk}`));
    // Ein belegter Port lässt das Kind sofort sterben — dann antwortet ein
    // fremder Server, und der Lauf spricht mit dem falschen Spiel.
    if (proc.exitCode !== null) {
      throw new Error(`Port ${port} ist belegt oder der Dev-Server startet nicht (Exit ${proc.exitCode})`);
    }
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`);
      if (response.ok) return proc;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  proc.kill('SIGTERM');
  throw new Error(`Test-Server antwortet nicht auf Port ${port}`);
}

export function stopServer(proc) {
  proc?.kill('SIGTERM');
}

export function testBase(port = 5211) {
  return `http://127.0.0.1:${port}/`;
}
