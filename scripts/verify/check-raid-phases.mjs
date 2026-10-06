/** Die Raid-Phasen als Maschine: Kette, Kanten, Kosten, Fehlerschluessel, Determinismus. */
import {
  RAID_EVENT,
  RAID_PHASE,
  RAID_PHASE_ACTIONS,
  RAID_TRANSITIONS,
  actionsAllowedIn,
  advance,
  isTerminal,
  phasePath,
} from '../../src/domain/raid/raid-phases.js';
import { check, section } from './expect.mjs';

const KETTE = ['ENTER', 'COMBAT', 'WARDEN_DOWN', 'SACRIFICE', 'LOOT', 'EXTRACTING', 'RESOLVED'];
const AKTIONEN = ['MOVE', 'DIG', 'ATTACK', 'SACRIFICE', 'LOOT', 'NONE'];
const UNBEKANNT = 'GIBT_ES_NICHT';

function kantenVon(phase) {
  return RAID_TRANSITIONS[phase] ?? [];
}

function alleKanten() {
  return Object.values(RAID_TRANSITIONS).flat();
}

function checkTable() {
  section('Raid-Phasen: die Tabelle ist total');
  const phasen = Object.values(RAID_PHASE);
  check('Es gibt genau sieben Phasen', phasen.length === 7, `${phasen.length}`);
  check('Jede Phase steht genau einmal', new Set(phasen).size === phasen.length);
  check('Die Tabelle kennt jede Phase', phasen.every((phase) => RAID_TRANSITIONS[phase] !== undefined));
  check('Der Hauptpfad trifft jede Phase genau einmal', phasePath().join(',') === KETTE.join(','));
  check('Der Hauptpfad ist eingefroren', Object.isFrozen(phasePath()));
  const ziele = new Set(alleKanten().map((kante) => kante.to));
  check('Jede Kante zeigt auf eine bekannte Phase', [...ziele].every((ziel) => phasen.includes(ziel)), [...ziele].join(', '));
  check('Jede Phase ausser der ersten ist erreichbar', KETTE.slice(1).every((phase) => ziele.has(phase)));
}

function checkEdges() {
  section('Raid-Phasen: Kanten und erlaubte Aktionen');
  const offen = Object.keys(RAID_PHASE).filter((phase) => phase !== RAID_PHASE.RESOLVED);
  check('Jede offene Phase hat mindestens eine Kante', offen.every((phase) => kantenVon(phase).length > 0));
  check('Die aufgeloeste Phase hat keine Kante mehr', kantenVon(RAID_PHASE.RESOLVED).length === 0);
  const kanten = alleKanten();
  check('Jede Kante nennt Ereignis, Ziel und Kosten', kanten.every((kante) => typeof kante.event === 'string' && typeof kante.to === 'string' && Number.isFinite(kante.staminaCost)));
  check('Jede Kante ist eingefroren', kanten.every((kante) => Object.isFrozen(kante)));
  const erlaubteMengen = Object.values(RAID_PHASE_ACTIONS);
  check('Jede Aktion stammt aus dem vereinbarten Vorrat', erlaubteMengen.every((liste) => liste.every((aktion) => AKTIONEN.includes(aktion))));
  check('Die Aktionen einer Kante sind die Aktionen ihres Ziels', kanten.every((kante) => kante.actions === actionsAllowedIn(kante.to)));
  check('Eine unbekannte Phase erlaubt nichts', actionsAllowedIn(UNBEKANNT).length === 0);
  check('Die Liste der erlaubten Aktionen ist eingefroren', Object.isFrozen(actionsAllowedIn(RAID_PHASE.ENTER)));
  check('Der Kampf erlaubt Angriff und Bewegung', actionsAllowedIn(RAID_PHASE.COMBAT).join(',') === 'ATTACK,MOVE');
  check('Das Graben ist im Einmarsch erlaubt und im Kampf nicht', actionsAllowedIn(RAID_PHASE.ENTER).includes('DIG') && !actionsAllowedIn(RAID_PHASE.COMBAT).includes('DIG'));
}

function checkChain() {
  section('Raid-Phasen: die Kette laeuft durch');
  const verlauf = [];
  for (const phase of phasePath()) {
    if (phase === RAID_PHASE.RESOLVED) break;
    const kante = kantenVon(phase)[0];
    const schritt = advance(phase, kante.event);
    verlauf.push(schritt.ok && schritt.to === kante.to && schritt.phase === phase);
    if (!schritt.ok) break;
  }
  check('Jeder Schritt der Kette ist erlaubt und trifft sein Ziel', verlauf.every(Boolean) && verlauf.length === KETTE.length - 1, `${verlauf.length} Schritte`);
  const fehlschlag = advance(RAID_PHASE.RESOLVED, RAID_EVENT.EXTRACTED);
  check('Nach dem Ende bewegt sich nichts mehr', fehlschlag.ok === false && fehlschlag.error === 'RAID_BEREITS_AUFGELOEST');
}

function checkErrors() {
  section('Raid-Phasen: Fehlpfade sind Fehlpfade');
  const verboten = advance(RAID_PHASE.ENTER, RAID_EVENT.LOOT_TAKEN);
  check('Ein verbotener Uebergang scheitert statt zu werfen', verboten.ok === false && verboten.error === 'VERBOTENER_UEBERGANG');
  const falschePhase = advance(UNBEKANNT, RAID_EVENT.ENTERED_HIVE);
  check('Eine unbekannte Phase meldet sich als unbekannt', falschePhase.ok === false && falschePhase.error === 'UNBEKANNTE_PHASE');
  const falscherEvent = advance(RAID_PHASE.ENTER, UNBEKANNT);
  check('Ein unbekanntes Ereignis meldet sich als unbekannt', falscherEvent.ok === false && falscherEvent.error === 'UNBEKANNTER_EVENT');
  const ohneEreignis = advance(RAID_PHASE.COMBAT, null);
  check('Ein fehlendes Ereignis wirft nicht', ohneEreignis.ok === false && ohneEreignis.error === 'UNBEKANNTER_EVENT');
  const zurueck = advance(RAID_PHASE.LOOT, RAID_EVENT.ENTERED_HIVE);
  check('Der Rueckweg in den Einmarsch ist verboten', zurueck.ok === false);
}

function checkCosts() {
  section('Raid-Phasen: Kosten stehen in der Tabelle');
  const kanten = alleKanten();
  check('Mindestens ein Uebergang kostet Ausdauer', kanten.some((kante) => kante.staminaCost > 0));
  check('Keine Kante kostet negativ', kanten.every((kante) => kante.staminaCost >= 0));
  const heim = kantenVon(RAID_PHASE.EXTRACTING)[0];
  const schritt = advance(RAID_PHASE.EXTRACTING, heim.event);
  check('Der gemeldete Preis ist der Preis der Kante', schritt.staminaCost === heim.staminaCost);
  const opfer = kantenVon(RAID_PHASE.WARDEN_DOWN)[0];
  check('Ein Opfer ist teurer als das Verlassen des Dungeons', opfer.staminaCost > kantenVon(RAID_PHASE.EXTRACTING)[0].staminaCost);
}

function checkDeterminism() {
  section('Raid-Phasen: dieselbe Eingabe, dasselbe Ergebnis');
  const erst = advance(RAID_PHASE.COMBAT, RAID_EVENT.WARDEN_FELL);
  const zweit = advance(RAID_PHASE.COMBAT, RAID_EVENT.WARDEN_FELL);
  check('Zweimal fragen liefert zweimal dasselbe', JSON.stringify(erst) === JSON.stringify(zweit));
  check('Die Auskunft ist eine reine Projektion', erst !== zweit && JSON.stringify(erst) === JSON.stringify({ ok: true, phase: 'COMBAT', to: 'WARDEN_DOWN', staminaCost: 4 }));
  const pfad = phasePath();
  check('Die Kette ist stabil', JSON.stringify(phasePath()) === JSON.stringify(pfad));
  check('Nur das Ende ist terminal', isTerminal(RAID_PHASE.RESOLVED) && !isTerminal(RAID_PHASE.ENTER));
  check('Eine unbekannte Phase ist nicht terminal', isTerminal(UNBEKANNT) === false);
  check('Die Ereignisse sind eingefroren', Object.isFrozen(RAID_EVENT) && Object.isFrozen(RAID_TRANSITIONS));
}

export async function checkRaidPhases() {
  checkTable();
  checkEdges();
  checkChain();
  checkErrors();
  checkCosts();
  checkDeterminism();
}
