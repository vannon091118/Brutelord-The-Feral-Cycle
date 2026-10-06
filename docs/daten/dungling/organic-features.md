# organic-features

## organic-features

Spiegel-Datei für `src/world/dungling/organic-features.jsx`.

## Verantwortung

Hörner, Zähne, Augen, Klauen und Rückenstacheln — und zwar **auf dem Anker**, nicht daneben.
Ein Anker aus `anchorsOf()` trägt den Ringpunkt auf der Iso-Linie und die nach außen
weisende Normale; aus diesen beiden Werten baut `wedge()` jedes Dreieck: die Basis liegt
quer zur Normale, die Spitze auf ihr. Der Senkrecht-Versatz `bend` zieht die Spitze zur
Seite, damit ein Klauenhorn sich krümmt statt gerade zu stehen. Deshalb sitzt eine Form
immer auf der Kante des Körpers, auch wenn der Phänotyp seine Kontur gerade weitet.

Die Form hängt an der **Art** und nicht mehr an der Rolle allein: `Features()` bekommt die
ausgedrückte Art aus dem Phänotyp und wählt danach. Ein Dämon trägt gebogene Klauenhörner
(gestreckter `bend`), ein Insekt Fühler — `Horn()` zeichnet dort eine dünne Linie mit
Endknopf statt eines Dreiecks —, eine Spinne kurze Stacheln. Auch Augen und Kiefer gehen
mit: der Mensch behält das runde Auge und drei Zähne, der Dämon ein rautenförmiges
Schlitzauge und zwei lange Fangzähne, das Insekt ein Facettenauge und zwei Mandibeln,
die Spinne ein Bündel kleiner Augen (`clusterEye()`) und zwei nach innen gebogene
Cheliceren. Die Zahl der Augen und Hörner kommt weiter aus dem Genom, die Zahl der Anker
aus dem Skelett — beides trifft sich hier, ohne dass diese Ebene etwas nachzählt.

Farbe und Projektor kommen aus `organic-skin.jsx`: es gibt genau einen Projektor, nicht
zwei, die auseinanderlaufen.

Jedes der vier Augen trägt seit dem 2026-10-06 einen Glanzpunkt mit der Klasse
`dl-creature-glint`. Das runde Auge hatte ihn schon als Randlicht; jetzt hat ihn auch das
Bündelauge, die Facette und das Schlitzauge, und er gehört derselben Klassensprache wie die
übrige Figur: bei einem Mutanten wandert er in `creature.css` mit einem eigenen Takt, und
unter dem Zeiger wird er schneller. Ein Auge, das nie glänzt, sieht tot aus — und ein
Wesen aus dem Labor soll nicht tot aussehen.

## Schnittstellen

- `Features()`

Aus der Mission vom 2026-10-06 hervorgegangen.
