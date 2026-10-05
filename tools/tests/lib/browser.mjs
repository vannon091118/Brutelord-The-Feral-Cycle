/** Der Browser kommt vom Wirt; jeder Lauf hängt sich an denselben Prozess. */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { SESSION_KEY } from '../../../src/ui/account/session.js';
import { HEADED, HOST_FILE, HOST_PORT } from './config.mjs';

const VIEWPORT = { width: 1360, height: 900 };
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function hostAlive(entry) {
  if (!entry) return false;
  try {
    process.kill(entry.pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function ask(path, options) {
  const response = await fetch(`http://127.0.0.1:${HOST_PORT}${path}`, options);
  if (!response.ok) throw new Error(`Der Wirt antwortet auf ${path} mit ${response.status}`);
  return response.json();
}

/** Der Wirt läuft im Modus des ersten Laufs; den anderen holt man sich per Wechsel. */
async function ensureMode() {
  if ((await ask('/status')).headless !== !HEADED) {
    return ask('/mode', { method: 'POST', headers: { 'x-headless': HEADED ? '0' : '1' } });
  }
  return ask('/status');
}

async function ensureHost() {
  // Der Wirt zählt, nicht die Datei: sonst startet jeder Lauf einen zweiten Wirt.
  const running = await ask('/status').catch(() => null);
  if (running?.ws) {
    writeFileSync(HOST_FILE, JSON.stringify({ ...running, port: HOST_PORT }));
    return ensureMode();
  }
  if (existsSync(HOST_FILE) && !hostAlive(JSON.parse(readFileSync(HOST_FILE, 'utf8')))) rmSync(HOST_FILE, { force: true });
  const proc = spawn(process.execPath, [join(process.cwd(), 'tools', 'tests', 'browser-host.mjs')], {
    cwd: process.cwd(),
    env: { ...process.env, DL_HOST_HEADLESS: HEADED ? '0' : '1' },
    detached: true,
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  proc.unref();
  for (let attempt = 0; attempt < 40; attempt += 1) {
    await wait(500);
    const entry = await ask('/status').catch(() => null);
    if (entry?.ws) {
      writeFileSync(HOST_FILE, JSON.stringify({ ...entry, port: HOST_PORT }));
      return ensureMode();
    }
  }
  throw new Error(`Kein Browserwirt auf Port ${HOST_PORT} — startet er nicht?`);
}

export async function openBrowser() {
  return attach();
}

/** Stirbt dem Wirt der Browser, räumt der Lauf auf und hängt sich an einen neuen. */
async function attach(retried = false) {
  const host = await ensureHost();
  try {
    const browser = await chromium.connect(host.ws);
    const context = await browser.newContext({ viewport: VIEWPORT });
    return { browser, context, host, close: () => browser.close() };
  } catch (error) {
    if (retried) throw error;
    await ask('/bye', { method: 'POST' }).catch(() => null);
    rmSync(HOST_FILE, { force: true });
    return attach(true);
  }
}

/** Die Test-Sitzung ohne Kontotor: Seed ist bekannt, die Welt ist reproduzierbar. */
export async function pinSession(page, { playerseed, name }) {
  await page.addInitScript(
    ([key, seed, label]) => {
      window.localStorage.setItem(key, JSON.stringify({ playerId: `p-${label}`, playerseed: seed, name: label }));
    },
    [SESSION_KEY, playerseed, name],
  );
}

export async function hostStatus() {
  return ask('/status');
}