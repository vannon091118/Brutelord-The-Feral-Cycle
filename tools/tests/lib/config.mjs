/** Der Lauf in Zahlen: Port, Seed, Name, Logpfad und der Modus, aus dem die Fälle starten. */
import { join } from 'node:path';
import { HARD_CAPS } from '../../../scripts/lib/source-metrics.mjs';

export const TEST_PORT = 5211;
export const TEST_PLAYERSEED = 'a1b2c3d4e5f60718';
export const TEST_NAME = 'szenarien';
export const TEST_ROOT = join(process.cwd(), 'tools', 'tests');
export const STATE_DIR = join(TEST_ROOT, 'state');
/** Die Cap-Grenze kommt vom Gate, nicht aus dieser Datei. */
export const FIXTURE_PART_LINES = HARD_CAPS.moduleLines;
export const LOG_DIR = join(TEST_ROOT, 'logs');
export const QUEUE_DIR = join(TEST_ROOT, '.queue');
export const HOST_FILE = join(TEST_ROOT, '.browser-host.json');
export const HOST_PORT = 5212;
export const HOST_IDLE_MS = 10 * 60 * 1000;

/** DL_FROM=fixtures startet jeden Fall eingefroren, sonst fährt die Suite live
 *  von vorn und erzeugt die Zustände, aus denen die Fixtures bestehen. */
export const FIXTURE_MODE = process.env.DL_FROM === 'fixtures';
export const HEADED = process.env.DL_HEADLESS !== '1';