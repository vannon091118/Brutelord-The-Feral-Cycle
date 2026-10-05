/** Die Speicher-Uhr: ein Takt, der den Stand sichert, und ein Abschied, der ihn eilt. */
import { useEffect } from 'react';
import { SNAPSHOT_EVERY_MS } from './snapshot-config.js';
import { openTestDoor, saveSnapshot } from './snapshot.js';

export function useSnapshotRunner({ latest, playerseed, everyMs = SNAPSHOT_EVERY_MS }) {
  useEffect(() => {
    openTestDoor({ latest, playerseed });
  }, [latest, playerseed]);

  useEffect(() => {
    const flush = () => saveSnapshot(latest.current, playerseed);
    const handle = setInterval(flush, everyMs);
    window.addEventListener('pagehide', flush);
    return () => {
      clearInterval(handle);
      window.removeEventListener('pagehide', flush);
    };
  }, [latest, playerseed, everyMs]);
}