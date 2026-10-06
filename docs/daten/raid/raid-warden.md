# raid-warden

## raid-warden

Spiegel-Datei für `src/domain/raid/raid-warden.js`.

## Verantwortung

Die Verteidigung des fremden Hives: Wächter, Koma, Zone of Control und der Hive selbst. Die
Wächter sind **gesetzt, nicht gemessen** — Anzahl, Leben und Staffelung stehen in
`raid-config.js`, weil es vor dieser Mechanik keinen Lauf gibt, aus dem sich eine Zahl
ableiten ließe; die Abnahme leitet ihre Erwartungen deshalb aus derselben Config ab und
schreibt keine Zahl ab. Ihre Plätze folgen demselben Hash-Strom wie der Einmarsch, damit
derselbe Snapshot dieselben Wächter stellt. Fällt ein Wächter, stirbt er nicht: er geht in
Koma, behält seinen Seed und trägt `revivesAfterMs` aus `RAID_CONFIG.reviveWindowMs` als
Datum mit (D14) — geheilt wird er zu Hause mit Biomasse, nicht hier. Ein wacher Wächter in
Reichweite bindet die Gruppe im Nahkampf (Zone of Control): sie darf angreifen, aber nicht
weggehen, und genau das prüft der Schritt. Der Schaden kommt aus dem aggregierten `atk` der
Teilnehmer (D28), nicht aus einer Zahl je Schlag.

## Schnittstellen

- `createWardens()`
- `createHive()`
- `wardensAtHand()`
- `bindsGroup()`
- `anyWardenConscious()`
- `allWardensDown()`
- `damageWardens()`
- `damageHive()`
- `hiveFallen()`
- `hiveInReach()`
