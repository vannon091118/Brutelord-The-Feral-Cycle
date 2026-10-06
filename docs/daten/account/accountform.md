# AccountForm

## accountform

Spiegel-Datei für `src/ui/account/AccountForm.jsx`.

## Verantwortung

Der erste Bildschirm. Hier erfährt ein neuer Spieler, was dieses Spiel ist und was er tun soll.
Er trägt den Produktnamen und einen Satz je Modus und benutzt die Panel-Sprache der übrigen
Oberfläche (`dl-panel`), damit der Einstieg kein Fremdkörper ist. Das Namensfeld trägt den Fokus
beim Eintreffen, damit getippt werden kann, ohne erst zu zielen. Eine gescheiterte Anmeldung
ist die einzige Stelle, an der ein Neuling hängt — sie steht als `role="alert"` über dem Knopf.

## Schnittstellen

- `AccountForm()` — setzt die Teile zusammen
- `FormIntro()` — Produktname und Vorsatz
- `FormFailure()` — die angekündigte Absage
- `FormSubmit()` — der Knopf samt laufendem Zustand
- `FormSwitch()` — zwischen Anlegen und Anmelden wechseln

Aus der Migration vom 2026-10-05 hervorgegangen.
