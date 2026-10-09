# OnboardingHint

## onboardinghint

Spiegel-Datei für `src/ui/OnboardingHint.jsx`.

## Verantwortung

Die Hinweis-Karte unten. Der Satz des aktuellen Onboarding-Zustands steht in der ersten
Zeile und ist nie abgeschnitten; darunter liegt die Resource Rail über die volle Breite,
darunter die Fußzeile mit den vier Phasen und dem nutzbaren Raum. Drei Zeilen sind
Absicht: in der 520-Pixel-Pille auf einer Zeile hatten Trail (gemessen 218 Pixel) und
Chips (gemessen 190 Pixel) nur 68 Pixel für die Anleitung übrig gelassen — weniger, als
der kürzeste Titel braucht.

Die Karte ist ein **Band** und keine schwebende Karte: ihr Rahmen und ihr Licht kommen aus
`dl-panel` und damit aus den Rollen der Palette, nicht aus eigenen Werten, und sie trägt
keine Rundung mehr (`--radius-dl`). Ihr Radius verschwindet damit dort, wo die Leiste
sitzt — ein eckiger Trog in einer runden Pille liest sich als Fehler und nicht als
Absicht. Der **Satz** der Karte bleibt in der UI-Schrift, auch dort, wo eine Zahl darin
steht; die Anzeigeschrift tragen allein die Zahlen der Leiste und die Versalien, also die
Platznamen und die Phasenmarken (siehe `Docs/ARCHITEKTUR.md`,
*Die Gestaltungsschicht*).

Seit dem 2026-10-06 ist die Rail die zweite Ebene und nicht mehr eine Reihe gleich
gewichtiger Plaketten: Die fünf Vorräte stehen oben, der Raum steht als Zahl in der
Fußzeile, wo er als zweitrangig auch gelesen wird. Den Kreislauf und die Bauten reicht die Karte
nur an die Rail durch, damit die Etagenplakette den offenen Abstieg kennt — der
hängt seit dem Leiterschacht an einem fertigen Bau und nicht mehr allein an der
Tiefe.

## Schnittstellen

- `OnboardingHint()`

Aus der Migration vom 2026-10-05 hervorgegangen; Rail-Umbau am 2026-10-06.
