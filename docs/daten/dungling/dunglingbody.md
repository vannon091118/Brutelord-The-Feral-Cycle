# DunglingBody

## dunglingbody

Spiegel-Datei für `src/world/dungling/DunglingBody.jsx`.

## Verantwortung

Der Körper ist kein Arbeiter, sondern ein Geschwur: eine weiche, lappige Verdickung, die aus
dem Hive wächst. Kein Gesicht, kein Lächeln — eine Narbe, ein paar Adern und ein Kern, der
durch die Haut schimmert. Die Geometrie kommt nicht mehr aus diesem Modul, sondern aus dem Look
des Wesens: Die Schale ist ein erzeugter Pfad, die Lappen tragen ihren Ton, Glanz und Kern folgen
dem Maßstab. Eine feste Silhouette hier wäre der Rückschritt, den der Look aufhebt.

Seit dem 2026-10-06 bringt der Körper sein **Material selbst mit**: `Materials()` schreibt die
vier Verläufe unter die Namen aus `look.ids` in ein eigenes `<defs>`. Vorher hing die Schale an
`url(#dl-bud)` aus `WorldDefs` — auf dem Spielfeld trug sie damit Farbe, auf dem Labortisch
keine, weil dort niemand die Weltdefinitionen zeichnet. Ein Wesen, das nur in einer Umgebung
aussieht, ist keins. Die Schale hat jetzt drei Lagen — Verlauf, Schattenversatz und Randlicht
—, `BudSkin()` trägt neben der Fläche einen heißen Punkt, `BudMotes()` treibt Sporen aus den
Poren, und `BudCore()` nimmt seinen Hof aus dem eigenen Kernverlauf statt aus dem Weltdefs.
Die Sporen sind aus den **Poren** des Looks erzeugt und nicht neu gewürfelt: jede neue Form
bleibt damit an einer Geometrie, die die Abnahme schon auf Kachelmaß geprüft hat.

## Schnittstellen

- `Materials()`
- `BudShell()` nimmt den Pfad der Schale
- `BudLobes()` zeichnet die Lappen inklusive Ton
- `BudVeins()`
- `BudMotes()`
- `BudCore()`
- `BudSkin()`
- `DunglingBody()`

Aus der Migration vom 2026-10-05 hervorgegangen.
