/** Die Erde muss zu einem Verbund verschmelzen, nicht als Kachelraster stehen.
 *  Warum und gemessene Zahlen: docs/daten/world/tile-shapes.md. */
import { soilMaskBlob } from '../../src/world/tile-shapes.js';
import { check, section } from './expect.mjs';

const SIZE = 48;
const ZU = { N: false, E: false, S: false, W: false };
const AUF = { N: true, E: true, S: true, W: true };
const EIN = { N: false, E: true, S: false, W: false };
const seedOf = 12345;

function zahlenVon(d) {
  return d.slice(1).match(/-?\d+(?:\.\d+)?/g).map(Number);
}

function rahmenVon(d) {
  const n = zahlenVon(d);
  let minX = Infinity; let maxX = -Infinity; let minY = Infinity; let maxY = -Infinity;
  for (let i = 0; i < n.length; i += 2) {
    minX = Math.min(minX, n[i]);
    maxX = Math.max(maxX, n[i]);
    minY = Math.min(minY, n[i + 1]);
    maxY = Math.max(maxY, n[i + 1]);
  }
  return { minX, maxX, minY, maxY };
}

function massOf(open, notch = null, seed = seedOf) {
  return rahmenVon(soilMaskBlob({ x: 0, y: 0, size: SIZE, open, notch, seed }));
}

function massAt({ x, y, open, notch = null, seed = seedOf }) {
  return rahmenVon(soilMaskBlob({ x, y, size: SIZE, open, notch, seed }));
}

function stuetzpunkte(d) {
  return [...d.matchAll(/Q(-?[\d.]+),(-?[\d.]+)/g)].map((m) => ({ x: Number(m[1]), y: Number(m[2]) }));
}

function naechster(liste, cx, cy) {
  return liste.reduce((best, p) => {
    const abstand = Math.hypot(p.x - cx, p.y - cy);
    return abstand < best.abstand ? { abstand, p } : best;
  }, { abstand: Infinity, p: null }).p;
}

function traegt(liste, punkt) {
  return liste.some((p) => p.x === punkt.x && p.y === punkt.y);
}

/** Der am weitesten nach aussen gerichtete Stuetzpunkt einer Ecke. */
function spitzeVon(d, ecke) {  const n = zahlenVon(d);
  let best = null;
  for (let i = 0; i < n.length; i += 2) {
    const p = { x: n[i], y: n[i + 1] };
    const richtung = ecke === 'NE' ? p.x - p.y : ecke === 'SE' ? p.x + p.y : ecke === 'SW' ? -p.x + p.y : -p.x - p.y;
    if (!best || richtung > best.richtung) best = { ...p, richtung };
  }
  return best;
}

function checkVerbund() {
  section('Boden: die Erde verschmilzt zu einem Verbund');
  const zu = massOf(ZU);
  check('Eine geschlossene Kachel reicht links ueber ihre Grenze hinaus', zu.minX < 0, `minX ${zu.minX}`);
  check('Und rechts', zu.maxX > SIZE, `maxX ${zu.maxX}`);
  check('Und nach unten', zu.maxY > SIZE, `maxY ${zu.maxY}`);

  const links = massAt({ x: 0, y: 0, open: ZU });
  const rechts = massAt({ x: SIZE, y: 0, open: ZU });
  const ueberlappung = links.maxX - rechts.minX;
  check('Zwei waagerecht benachbarte Kacheln ueberlappen statt zu klaffen',
    ueberlappung > 0, `Ueberlappung ${ueberlappung.toFixed(2)}px`);
  const unten = massAt({ x: 0, y: SIZE, open: ZU });
  check('Und dasselbe in der Senkrechten', zu.maxY - unten.minY > 0, `${(zu.maxY - unten.minY).toFixed(2)}px`);

  const auf = massOf(AUF);
  check('Eine offene Kachel wölbt sich ebenfalls ueber die Grenze',
    auf.minX < 0 && auf.maxX > SIZE, `${auf.minX}..${auf.maxX}`);
}

function checkEcke() {
  section('Boden: am Kreuzungspunkt bleibt kein Stern');
  // Vier geschlossene Kacheln um einen Punkt: die Ecke muss echte Masse tragen.
  const ecke = massOf(ZU);
  const quadrat = { unten: SIZE, rechts: SIZE, oben: 0, links: 0 };
  check('Die Ecke der Kachel liegt in der Masse, nicht daneben',
    ecke.minX <= quadrat.links && ecke.minY <= quadrat.oben,
    `Ecke bei ${ecke.minX},${ecke.minY}`);
  check('Und dieselbe Aussage fuer die gegenüberliegende Ecke',
    ecke.maxX >= quadrat.rechts && ecke.maxY >= quadrat.unten,
    `Ecke bei ${ecke.maxX},${ecke.maxY}`);
}

function checkKerbe() {
  section('Boden: die Kerbe am Hive bleibt ein Biss');
  const kerbe = { NE: true, SE: false, SW: false, NW: false };
  const dOhne = soilMaskBlob({ x: 0, y: 0, size: SIZE, open: ZU, notch: null, seed: seedOf });
  const dMit = soilMaskBlob({ x: 0, y: 0, size: SIZE, open: ZU, notch: kerbe, seed: seedOf });
  const neOhne = spitzeVon(dOhne, 'NE');
  const neMit = spitzeVon(dMit, 'NE');
  check('Eine Kerbe zieht die Masse aus der Ecke heraus',
    neMit.x < neOhne.x && neMit.y > neOhne.y,
    `NE ohne Kerbe ${neOhne.x},${neOhne.y}, mit Kerbe ${neMit.x},${neMit.y}`);
  const seMit = spitzeVon(dMit, 'SE');
  const seOhne = spitzeVon(dOhne, 'SE');
  check('Und laesst die uebrigen Ecken unberuehrt',
    seMit.x === seOhne.x && seMit.y === seOhne.y, `SE ${seOhne.x},${seOhne.y}`);
  const mit = rahmenVon(dMit);
  check('Die Naht der geschlossenen Seiten bleibt trotzdem draussen',
    mit.minX < 0 && mit.maxY > SIZE, `${mit.minX}..${mit.maxY}`);
}

function checkNaht() {
  section('Boden: die Naht einer geschlossenen Seite liegt auf der Kante');
  // Nur die Nordseite ist zu: in ihrer Mitte sitzt die Naht frei, ohne Eckpunkt.
  const d = soilMaskBlob({ x: 0, y: 0, size: SIZE, open: { N: false, E: true, S: true, W: true }, notch: null, seed: seedOf });
  const n = zahlenVon(d);
  const mitte = [];
  for (let i = 0; i < n.length; i += 2) {
    if (Math.abs(n[i] - SIZE / 2) <= SIZE * 0.12) mitte.push({ x: n[i], y: n[i + 1] });
  }
  const ymin = Math.min(...mitte.map((p) => p.y));
  check('In der Mitte der geschlossenen Seite liegt Masse auf der Kante, nicht 10px darunter',
    ymin <= 1, `y=${ymin.toFixed(2)} bei ${mitte.length} Punkten`);
}

function checkOffeneEcke() {
  section('Boden: die einseitig offene Kachel behaelt ihre Ecknaht');
  const ein = soilMaskBlob({ x: 0, y: 0, size: SIZE, open: EIN, notch: null, seed: seedOf });
  const zu = soilMaskBlob({ x: 0, y: 0, size: SIZE, open: ZU, notch: null, seed: seedOf });
  const ecken = [['NE', SIZE, 0], ['SE', SIZE, SIZE], ['SW', 0, SIZE], ['NW', 0, 0]];
  for (const [ecke, cx, cy] of ecken) {
    const naht = naechster(stuetzpunkte(zu), cx, cy);
    check(`${ecke}: offen traegt dieselbe Ecknaht wie geschlossen`,
      traegt(stuetzpunkte(ein), naht), `Naht ${naht.x},${naht.y} fehlt`);
  }
  const mitKerbe = soilMaskBlob({ x: 0, y: 0, size: SIZE, open: EIN, notch: { NE: true, SE: false, SW: false, NW: false }, seed: seedOf });
  const neNaht = naechster(stuetzpunkte(zu), SIZE, 0);
  check('Die Kerbe schlaegt die Ecknaht auch bei offener Nachbarseite', !traegt(stuetzpunkte(mitKerbe), neNaht));
}

export function checkSoilMass() {
  checkVerbund();
  checkNaht();
  checkEcke();
  checkKerbe();
  checkOffeneEcke();
}
