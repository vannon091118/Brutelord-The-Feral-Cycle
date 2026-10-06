/** Das Raid-Ticket im Server: der Kader aus dem gespeicherten Heimatstand, die
 *  Zeile, die der Server ausstellt und nachschlaegt (D25), und die geprueffte
 *  Beute samt Quittung — als echter Lauf gegen den echten Speicher. */
import { CADRE_REASON, cadreRule, ticketFrom } from '../../src/domain/raid/raid-ticket.js';
import { ticketSteps } from '../server/state-write.mjs';
import { ask, envelope, payloadOf, PASSWORD } from './raid-account-fixture.mjs';
import { raidLogFor, raidOpening } from './raid-log-fixture.mjs';
import { dungling, schwarm, statsOf } from './raid-kader-fixture.mjs';
import { check, section } from './expect.mjs';
import { withTempStore } from './temp-store.mjs';

const ATTACKER = 'ticket-haus';
const DEFENDER = 'ticket-burg';
const SEED = 4242;
const HERDEN = schwarm(6);
const HELDEN = HERDEN.map((worker) => worker.id);

function kaderMit(heroes, dunglings = HERDEN) {
  return cadreRule({ heroes, dunglings });
}

function checkKader() {
  section('Raid-Kader: was der Server ausstellen darf');
  check('Ein leerer Kader wird abgewiesen', kaderMit([]).reason === CADRE_REASON.LEER);
  check('Ein fremder Dungling wird abgewiesen', kaderMit(['dungling-9']).reason === CADRE_REASON.FREMD);
  check('Derselbe Dungling zweimal wird abgewiesen', kaderMit(['dungling-1', 'dungling-1']).reason === CADRE_REASON.DOPPELT);
  const zuViele = Array.from({ length: 40 }, (unused, index) => `dungling-${index + 1}`);
  check('Ein Kader groesser als der Schwarm wird abgewiesen', kaderMit(zuViele).reason === CADRE_REASON.ZU_VIELE);
  check('Ein Kader aus einem getunten Stand reisst den Grit-Deckel',
    kaderMit(['dungling-1'], [dungling('dungling-1', 25)]).reason === CADRE_REASON.ZU_STARK);
  const kader = kaderMit(['dungling-1', 'dungling-2']);
  check('Ein gesunder Kader kommt durch', kader.ok === true, kader.reason ?? '');
  check('Der Kader traegt genau die Felder, die der Raid liest',
    Object.keys(kader.heroes?.[0] ?? {}).join(',') === 'id,name,atk,speed,grit,dig,traits',
    Object.keys(kader.heroes?.[0] ?? {}).join(','));
  check('Der atk ist der gefaltete des gespeicherten Dunglings',
    kader.heroes?.[0]?.atk === statsOf(HERDEN[0]).atk && kader.heroes[0].atk > 0, `${kader.heroes?.[0]?.atk}`);
  check('Der Grit des Kaders ist die Summe seiner Traeger',
    kader.grit === statsOf(HERDEN[0]).grit + statsOf(HERDEN[1]).grit, `${kader.grit}`);
  check('Die Grabfaehigkeit kommt aus dem Stein', kader.heroes?.[0]?.dig === true);
  check('Die Traits kommen aus den Steinen', kader.heroes?.[0]?.traits?.length > 0);
  check('Der Name kommt aus dem Stand und nicht aus dem Rumpf', kader.heroes?.[0]?.name === 'dungling-1');
  check('Ein Dungling ohne Steine traegt Null',
    JSON.stringify(kaderMit(['dungling-9'], [dungling('dungling-9', 0)]).heroes) ===
      '[{"id":"dungling-9","name":"dungling-9","atk":0,"speed":0,"grit":0,"dig":false,"traits":[]}]');
}

/** Die Probe, die diesen Umbau ausgeloest hat: atk 999999, speed 500, grit 1. */
function checkFaelschung() {
  section('Raid-Kader: der Rumpf darf nicht behaupten, was der Hive nicht hat');
  const probe = [{ id: 'dungling-1', atk: 999_999, speed: 500, grit: 1, dig: true }];
  check('Die gemessene Faelschungs-Probe faellt durch', kaderMit(probe).reason === CADRE_REASON.GEFALSCHT);
  check('Ein behauptetes atk wird abgewiesen', kaderMit([{ id: 'dungling-1', atk: 999_999 }]).reason === CADRE_REASON.GEFALSCHT);
  check('Eine behauptete Geschwindigkeit wird abgewiesen', kaderMit([{ id: 'dungling-1', speed: 500 }]).reason === CADRE_REASON.GEFALSCHT);
  check('Ein behaupteter Grit wird abgewiesen', kaderMit([{ id: 'dungling-1', grit: 0 }]).reason === CADRE_REASON.GEFALSCHT);
  check('Ein behauptetes Grabevermoegen wird abgewiesen', kaderMit([{ id: 'dungling-1', dig: false }]).reason === CADRE_REASON.GEFALSCHT);
  check('Eine Zeichenkette statt einer Zahl ist eine Faelschung', kaderMit([{ id: 'dungling-1', atk: '80' }]).reason === CADRE_REASON.GEFALSCHT);
  const ehrlich = kaderMit(['dungling-1', 'dungling-2']).heroes;
  check('Wer die Wahrheit sagt, kommt weiter', kaderMit(ehrlich).ok === true);
  check('Unbekannte Felder fallen weg', kaderMit([{ id: 'dungling-1', schmuggel: 'x' }]).heroes?.[0]?.schmuggel === undefined);
}

function checkTicket() {
  section('Raid-Ticket: der Eintritt kommt aus dem Paar, nicht aus dem Rumpf');
  const heroes = kaderMit(HELDEN).heroes;
  const ticket = ticketFrom({ id: 't-1', attackerId: ATTACKER, defenderId: DEFENDER, defenderSeed: SEED, heroes });
  check('Das Ticket friert Id, Verteidiger, Snapshot-Seed und Kader ein',
    ticket?.id === 't-1' && ticket.defender === DEFENDER && ticket.snapshotSeed === SEED && ticket.heroes.length === HELDEN.length);
  check('Das Ticket traegt die Zahlen des gespeicherten Standes',
    ticket?.heroes?.[0]?.atk === statsOf(HERDEN[0]).atk && ticket.heroes[0].atk > 0);
  check('Der Eintritt ist ein Feld im Runden, kein Wert aus dem Rumpf',
    Number.isInteger(ticket?.entry?.x) && Number.isInteger(ticket?.entry?.y));
  check('Das Ticket ist eingefroren', Object.isFrozen(ticket) && Object.isFrozen(ticket.entry));
  const zweit = ticketFrom({ id: 't-2', attackerId: ATTACKER, defenderId: DEFENDER, defenderSeed: SEED, heroes });
  check('Ein zweites Ticket fuer dasselbe Paar bringt denselben Anmarsch',
    zweit.id !== ticket.id && zweit.entry.x === ticket.entry.x && zweit.entry.y === ticket.entry.y);
  const anderer = ticketFrom({ id: 't-1', attackerId: ATTACKER, defenderId: 'andere-burg', defenderSeed: SEED, heroes });
  check('Ein anderer Verteidiger ist ein anderer Eintritt',
    anderer.entry.x !== ticket.entry.x || anderer.entry.y !== ticket.entry.y,
    `${anderer.entry.x},${anderer.entry.y} gegen ${ticket.entry.x},${ticket.entry.y}`);
  const eintritte = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((wer) => {
    const lauf = ticketFrom({ id: 't-1', attackerId: wer, defenderId: DEFENDER, defenderSeed: SEED, heroes });
    return `${lauf.entry.x},${lauf.entry.y}`;
  }));
  check('Der Eintritt haengt am Angreifer und ist kein fester Punkt', eintritte.size > 1, `${eintritte.size} Punkte`);
}

/** Die Regel der Buchung am Text der Anweisung, ergaenzend zur Suite in check-booking. */
function checkBuchungsregel() {
  section('Raid-Ticket: die zwei Anweisungen der Buchung');
  const plan = ticketSteps({ packed: { version: 3, revision: 7, state: {} }, accountId: 'haus', ticketId: 't-9' });
  check('Die Schreibanweisung ist an die Ticketzeile gebunden und nennt die Frist',
    /AND EXISTS \(SELECT 1 FROM raid_tickets WHERE id = \? AND account = \? AND expires_at > \?\)$/.test(plan.write.sql));
  check('Die Loeschung haengt an der Revision, die die Schreibanweisung setzt',
    /AND EXISTS \(SELECT 1 FROM accounts WHERE name = \? AND revision = \?\)$/.test(plan.take.sql));
  check('Die Revision der Buchung reist als Argument mit', plan.take.args.includes(7));
  check('Ohne Beute bleibt nur der Verbrauch der Zeile', ticketSteps({ accountId: 'haus', ticketId: 't-9' }).write === null);
}

async function anlegen(name) {
  const angelegt = await payloadOf(await ask({ path: '/api/register', body: { name, password: PASSWORD } }));
  return angelegt.json.token;
}

async function ausstellen(token) {
  return payloadOf(await ask({ path: '/api/raid/ticket', body: { defender: DEFENDER, heroes: HELDEN }, token }));
}

async function checkAufstellung({ token, burg }) {
  check('Ohne Token gibt es kein Ticket', (await ask({ path: '/api/raid/ticket', body: {} })).status === 401);
  check('Ohne Spielstand gibt es kein Ticket', (await ausstellen(token)).status === 404);
  check('Der eigene Heimatstand laesst sich ablegen',
    (await ask({ path: '/api/state', body: envelope({ seed: 7, essence: 5, dunglings: HERDEN }), token })).status === 200);
  check('Der Verteidiger ohne Spielstand hat keinen Snapshot', (await ausstellen(token)).status === 404);
  check('Der Verteidiger-Stand laesst sich ablegen',
    (await ask({ path: '/api/state', body: envelope({ seed: SEED, essence: 3 }), token: burg })).status === 200);
  check('Ein unbekannter Verteidiger wird als solcher abgewiesen',
    (await payloadOf(await ask({ path: '/api/raid/ticket', body: { defender: 'gibtsnicht', heroes: HELDEN }, token }))).status === 404);
}

async function checkPaar({ store, token, erstes }) {
  const zweites = await ausstellen(token);
  check('Ein zweites Ausstellen ersetzt die Zeile desselben Paares',
    zweites.status === 201 && zweites.json.ticket?.id !== erstes.id &&
      zweites.json.ticket?.entry?.x === erstes.entry?.x,
    `${zweites.status}`);
  check('und das erste Ticket ist danach weg', (await store.getTicket(erstes.id)) === null);
  check('und es bleibt eine lebende Zeile fuer das Paar', (await store.getTicket(zweites.json.ticket?.id)) !== null);
  return zweites.json.ticket;
}

async function checkAusstellung(store) {
  section('Raid-Ticket: Ausstellen ueber die Route');
  const token = await anlegen(ATTACKER);
  const fremd = await anlegen('ticket-fremd');
  const burg = await anlegen(DEFENDER);
  await checkAufstellung({ token, burg });
  const gestohlen = await payloadOf(await ask({ path: '/api/raid/ticket', body: { defender: DEFENDER, heroes: ['dungling-9'] }, token }));
  check('Ein fremder Dungling faellt in der Domaene durch', gestohlen.status === 422 && gestohlen.json.error === CADRE_REASON.FREMD);
  const gefaelscht = await payloadOf(await ask({
    path: '/api/raid/ticket',
    body: { defender: DEFENDER, heroes: [{ id: 'dungling-1', atk: 999_999, speed: 500, grit: 1, dig: true }] },
    token,
  }));
  check('Ein Kader mit erfundenen Zahlen bekommt kein Ticket',
    gefaelscht.status === 422 && gefaelscht.json.error === CADRE_REASON.GEFALSCHT, `${gefaelscht.status} ${gefaelscht.json.error}`);
  const gestellt = await ausstellen(token);
  check('Ein gesunder Kader bekommt eine Zeile', gestellt.status === 201 && typeof gestellt.json.ticket?.id === 'string');
  check('Der Snapshot-Seed ist der des Verteidigers, nicht der des Antrags', gestellt.json.ticket?.snapshotSeed === SEED);
  check('Die Zeile bekommt eine Frist', Number.isInteger(gestellt.json.expiresAt));
  check('Der Kader traegt die Zahlen des Standes, nicht die des Rumpfs',
    gestellt.json.ticket?.heroes?.[0]?.atk === statsOf(HERDEN[0]).atk && gestellt.json.ticket?.heroes?.[0]?.dig === true,
    JSON.stringify(gestellt.json.ticket?.heroes?.[0]));
  return { token, fremd, ticket: await checkPaar({ store, token, erstes: gestellt.json.ticket }) };
}

async function stand(token) {
  return (await payloadOf(await ask({ path: '/api/state', method: 'GET', token }))).json.envelope;
}

async function checkBuchung({ token, ticket }) {
  section('Raid-Ticket: die Einreichung bucht atomar');
  const lauf = raidLogFor({ ticket });
  check('Der Lauf des Fixtures ist ein gewonnener Raid', lauf.resolved && lauf.loot.ok === true, lauf.claimed.phase);
  check('Der Lauf bleibt ein Log und keine Wand', lauf.actions.length > 0);
  const vor = await stand(token);
  const eingereicht = await payloadOf(await ask({
    path: '/api/raid',
    body: { ticket: { ...ticket, entry: { x: 0, y: 0 }, snapshotSeed: 1, heroes: [] }, actions: lauf.actions, claimed: lauf.claimed },
    token,
  }));
  check('Ein manipuliertes Ticket aendert nichts — die Zeile des Servers zaehlt', eingereicht.status === 200, `${eingereicht.status}`);
  check('Die gebuchte Beute ist die geprueffte Beute',
    eingereicht.json.loot?.essence === lauf.loot.loot.essence && eingereicht.json.loot?.bloodstone === lauf.loot.loot.bloodstone,
    JSON.stringify(eingereicht.json.loot));
  const nach = await stand(token);
  check('Die Essenz der Heimat waechst um die Beute',
    nach.state.essence === vor.state.essence + lauf.loot.loot.essence, `${vor.state.essence} -> ${nach.state.essence}`);
  check('Der Blutstein landet im Kreislauf der Heimat',
    (nach.state.economy?.bloodstone?.stored ?? 0) === (vor.state.economy?.bloodstone?.stored ?? 0) + lauf.loot.loot.bloodstone,
    `${vor.state.economy?.bloodstone?.stored ?? 0} -> ${nach.state.economy?.bloodstone?.stored ?? 0}`);
  check('Die Buchung hebt die Revision um genau eins', nach.revision === vor.revision + 1);
  const nochmal = await payloadOf(await ask({ path: '/api/raid', body: { ticket, actions: lauf.actions, claimed: lauf.claimed }, token }));
  check('Derselbe Antrag noch einmal nennt die Beute und bucht nicht doppelt',
    nochmal.status === 200 && nochmal.json.gebucht === true && nochmal.json.loot?.essence === lauf.loot.loot.essence,
    `${nochmal.status} ${JSON.stringify(nochmal.json.loot)}`);
  check('Der zweite Anlauf liess den Stand stehen', (await stand(token)).revision === nach.revision);
  await checkQuittung({ token, loot: lauf.loot.loot });
}

async function checkQuittung({ token, loot }) {
  section('Raid-Ticket: die Quittung des Ueberfalls');
  check('Ohne Token gibt es die Liste nicht', (await ask({ path: '/api/raid/bookings', method: 'GET' })).status === 401);
  const liste = await payloadOf(await ask({ path: '/api/raid/bookings', method: 'GET', token }));
  check('Die Liste der Ueberfaelle ist lesbar', liste.status === 200 && Array.isArray(liste.json.bookings), `${liste.status}`);
  check('Sie kennt den Ueberfall mit Verteidiger und Beute',
    liste.json.bookings?.length === 1 && liste.json.bookings[0].defender === DEFENDER &&
      liste.json.bookings[0].essence === loot.essence && liste.json.bookings[0].bloodstone === loot.bloodstone,
    JSON.stringify(liste.json.bookings));
}

async function checkOhneBeute({ token, fremd }) {
  section('Raid-Ticket: ein Raid ohne Beute wird verbraucht, nicht gebucht');
  const ticket = (await ausstellen(token)).json.ticket;
  const vor = await stand(token);
  const leer = await payloadOf(await ask({ path: '/api/raid', body: { ticket, actions: [], claimed: null }, token }));
  check('Ein Log ohne behaupteten Endzustand faellt durch', leer.status === 422, `${leer.status}`);
  const ohneZug = await payloadOf(await ask({ path: '/api/raid', body: { ticket, actions: [], claimed: raidOpening({ ticket }) }, token }));
  check('Ein Lauf ohne Zug ist eine gueltige, aber leere Einreichung',
    ohneZug.status === 200 && ohneZug.json.loot === null, `${ohneZug.status}`);
  check('Ein leerer Raid schreibt den Heimatstand nicht', (await stand(token)).revision === vor.revision);
  check('Auch dieses Ticket ist danach verbraucht',
    (await payloadOf(await ask({ path: '/api/raid', body: { ticket, actions: [], claimed: raidOpening({ ticket }) }, token }))).status === 404);
  const fremdes = (await ausstellen(token)).json.ticket;
  check('Ein Ticket eines fremden Kontos gibt es nicht',
    (await payloadOf(await ask({ path: '/api/raid', body: { ticket: fremdes, actions: [], claimed: raidOpening({ ticket: fremdes }) }, token: fremd }))).status === 404);
}

export async function checkRaidTicket() {
  checkKader();
  checkFaelschung();
  checkTicket();
  checkBuchungsregel();
  await withTempStore(async (store) => {
    const umfeld = await checkAusstellung(store);
    await checkBuchung(umfeld);
    await checkOhneBeute(umfeld);
  });
}
