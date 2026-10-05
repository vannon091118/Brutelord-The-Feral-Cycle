/** Lauf-Protokoll: eine Zeile pro Ereignis, Konsolenspiegel plus JSONL-Datei. */
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

function writeRecord({ file, records, level, message, detail }) {
  const record = { at: new Date().toISOString(), level, message, detail: detail ?? null };
  records.push(record);
  appendFileSync(file, `${JSON.stringify(record)}\n`);
  console.log(`[${level}] ${message}`);
}

export function createLogger(logDir) {
  mkdirSync(logDir, { recursive: true });
  const file = join(logDir, 'latest.jsonl');
  const records = [];
  let failures = 0;
  let passed = 0;

  const log = (level, message, detail) => writeRecord({ file, records, level, message, detail });

  /** Ein Befund: ok oder FAIL, gemeldet und gezählt. */
  const check = (label, ok, detail = '') => {
    if (ok) passed += 1;
    else failures += 1;
    log(ok ? 'ok' : 'FAIL', label, detail);
    return ok;
  };

  const report = () => {
    const result = { passed, failed: failures, ok: failures === 0 };
    log('report', `${passed} bestanden, ${failures} fehlgeschlagen`);
    writeFileSync(join(logDir, 'latest.json'), JSON.stringify({ ...result, records }, null, 2));
    return result;
  };

  return { log, check, report, file };
}