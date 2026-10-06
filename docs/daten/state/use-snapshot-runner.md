# use-snapshot-runner

## use-snapshot-runner

Spiegel-Datei für `src/state/use-snapshot-runner.js`.

## Verantwortung

Die Speicher-Uhr: ein Takt, der den Stand sichert, und ein Abschied, der ihn eilt. Der Takt
fragt alle fuenf Sekunden, ob sich ueberhaupt etwas geaendert hat, und laesst eine
Schreibung nur zu, wenn das Schreibfenster abgelaufen ist; viele Aenderungen in kurzer Zeit
werden damit zu einer Schreibung gebuendelt, und der letzte Stand gewinnt. `pagehide`
erzwingt den Abschied ohne Wartezeit, damit ein geschlossener Tab nicht das Fenster
verliert. Die Uhr entscheidet nicht, ob geschrieben werden darf — das tut die Regel.
Dem Dev-Tor reicht sie außerdem das Lauf-Protokoll durch, damit ein aufgezeichneter Lauf
samt Share-Code ohne Umweg über die Konsole greifbar ist. Hat der Stand lokal geschrieben,
schickt sie denselben Envelope mit dem Traeger-Token an `/api/state` — der Weg zum Server
haengt an der Schreibung, nicht an einem zweiten Takt, und ein fehlendes Token laesst ihn
still aus, damit ein Browser ohne Server weiterlaeuft.

## Schnittstellen

- `useSnapshotRunner()`

Aus der Migration vom 2026-10-05 hervorgegangen.
