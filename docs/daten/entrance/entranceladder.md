# EntranceLadder

## entranceladder

Spiegel-Datei für `src/world/entrance/EntranceLadder.jsx`.

## Verantwortung

Der Eingang: eine Leiter in einen dunklen Schacht, erst sichtbar, wenn die Verwurzelung
herangewachsen ist. **Sie ist kein Platzhalter mehr.** Ein Klick auf die Leiter steigt in die
nächste Etage — die Komponente entscheidet aber nichts über die Tiefe: sie liest
`descendOpen({ depth, cycle })` aus `src/domain/economy/resource-cycle.js`, und sie fragt den
Boden: der Eingang ist nur offen, wenn die Kachel bei 47,47 `isUsable()` ist. Die Leiter ist
damit sichtbar, **bevor** sie ein Weg ist — man sieht den Schacht im Gestein stehen, und wer
hinunter will, muss ihn freigraben. Vorher trägt der Klick keinen Handler und die Fläche ist
`pointerEvents: none`;
der Schacht sagt selbst, was gilt („Der Schacht endet hier"). Genau diese Grenze sperrt auch
die Plakette, weil beide denselben Befehl schicken.

Die Trefferfläche ist ein eigenes Rechteck über dem Schacht. Das ist Absicht: die gezeichneten
Striche der Leiter sind dünn, und ein Klick auf drei Pixel Draht wäre kein Eingang. Das
Rechteck deckt den Schacht und ein Stück darunter ab, damit der Pfeil, der nach unten zeigt,
mitgehört wird. Die Fläche ist transparent gefüllt, also nur dort klickbar, wo die Leiter
steht; der übrige Boden der Kachel bleibt, was er war.

Die Leiter steht in **jeder** Etage an denselben Koordinaten (`LADDER_TILE`), die Welt
bekommt sie von `createWorld()` als `world.entrance`. Man findet sie also unten wieder,
nachdem man oben abgestiegen ist — und muss den Schacht dort erneut freigraben, weil jede
Etage ihr eigenes Gestein hat.

## Schnittstellen

- `isInView()` — die Leiter wird nur im Bild gezeichnet
- `LadderRungs()`
- `LadderShaft()`
- `OpenHint()` — der Pfeil nach unten, nur wenn es tiefer geht
- `LadderHitArea()` — die klickbare Fläche und ihr Urteil über die Tiefe
- `EntranceLadder()`
