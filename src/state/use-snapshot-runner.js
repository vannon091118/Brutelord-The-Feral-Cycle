// @doc: docs/daten/state/use-snapshot-runner.md#use-snapshot-runner
import { useEffect } from 'react';
import { SNAPSHOT_EVERY_MS, SNAPSHOT_WRITE_EVERY_MS } from './snapshot-config.js';
import { openTestDoor, writeIfChanged } from './snapshot.js';

export function useSnapshotRunner({ latest, playerseed, everyMs = SNAPSHOT_EVERY_MS, writeEveryMs = SNAPSHOT_WRITE_EVERY_MS }) {
  useEffect(() => {
    openTestDoor({ latest, playerseed });
  }, [latest, playerseed]);

  useEffect(() => {
    let lastWriteMs = 0;
    const write = (erzwungen) => {
      const faellig = erzwungen || performance.now() - lastWriteMs >= writeEveryMs;
      if (faellig && writeIfChanged(latest.current, playerseed)) lastWriteMs = performance.now();
    };
    const tick = () => write(false);
    const flush = () => write(true);
    const handle = setInterval(tick, everyMs);
    window.addEventListener('pagehide', flush);
    return () => {
      clearInterval(handle);
      window.removeEventListener('pagehide', flush);
    };
  }, [latest, playerseed, everyMs, writeEveryMs]);
}
