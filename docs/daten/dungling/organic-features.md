# organic-features

## organic-features

Spiegel-Datei für `src/world/dungling/organic-features.jsx`.

## Verantwortung

Hörner, Zähne, Augen, Klauen und Rückenstacheln — und zwar **auf dem Anker**, nicht daneben.
Ein Anker aus `anchorsOf()` trägt den Ringpunkt auf der Iso-Linie und die nach außen
weisende Normale; aus diesen beiden Werten baut `wedge()` jedes Dreieck: die Basis liegt
quer zur Normale, die Spitze auf ihr. Deshalb sitzt ein Horn immer auf der Kante des
Körpers, auch wenn der Phänotyp seine Kontur gerade weitet — die Merkmale wandern mit dem
Atem mit, statt neben ihm zu stehen.

Jede Rolle aus `FEATURE_ANCHOR` bekommt ihre eigene Form: `HEAD_TIP` ein helles Horn,
`LIMB_TIP` eine Klaue, `BACK` einen Stachel, `JAW` drei Zähne entlang der Tangente und
`EYE_SOCKET` ein Auge mit Linsenrand und Glanzlicht. Die Zahl der Augen und Hörner kommt
aus dem Genom, die Zahl der Anker aus dem Skelett — beides trifft sich hier, ohne dass
diese Ebene etwas nachzählt.

Farbe und Projektor kommen aus `organic-skin.jsx`: es gibt genau einen Projektor, nicht
zwei, die auseinanderlaufen.

## Schnittstellen

- `Features()`

Aus der Mission vom 2026-10-06 hervorgegangen.
