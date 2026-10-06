/** Das Aussehen eines Wesens folgt seiner Id: dasselbe Wesen bleibt dasselbe, zwei Wesen
 *  sehen verschieden aus, und beim Laufen verändert sich nichts. Nichts verlässt die Kachel. */
import { readFileSync } from 'node:fs';
import { lookOf } from '../../src/world/dungling/dungling-look.js';
import { check, section } from './expect.mjs';

const IDS = Array.from({ length: 48 }, (_, index) => `dungling-${index + 1}`);
const TILE = { x: 16, low: -32, high: 16, footX: 7.6, footY: 6.4 };

function punkte(text) {
  const flach = (text.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  const ort = [];
  for (let index = 0; index + 1 < flach.length; index += 2) ort.push({ x: flach[index], y: flach[index + 1] });
  return ort;
}

function draussen(text) {
  return punkte(text).filter((punkt) => Math.abs(punkt.x) > TILE.x || punkt.y < TILE.low || punkt.y > TILE.high);
}

function ausserhalb(look) {
  const pfade = [look.shell, ...look.veins, ...look.crown.map((tendril) => tendril.d)];
  const flaechen = [...look.pores, ...look.lobes, look.shine];
  const oben = flaechen.filter((flaeche) => Math.abs(flaeche.cx) + (flaeche.r ?? flaeche.rx) > TILE.x);
  const hoehe = flaechen.filter((flaeche) => flaeche.cy - (flaeche.r ?? flaeche.ry) < TILE.low);
  return pfade.reduce((sum, pfad) => sum + draussen(pfad).length, oben.length + hoehe.length);
}

function fusserdeckung(look) {
  const untererRand = punkte(look.shell).filter((punkt) => Math.abs(punkt.x) <= TILE.footX);
  return Math.max(...untererRand.map((punkt) => punkt.y)) - TILE.footY;
}

function streut(looks, teil) {
  return new Set(looks.map((look) => JSON.stringify(teil(look)))).size;
}

function abweichungen(looks, ids) {
  return looks.filter((look, index) => JSON.stringify(look) !== JSON.stringify(lookOf(ids[index]))).length;
}

export function checkDunglingLook() {
  section('Wesen: das Aussehen folgt der Id, nicht der Kachel');
  const looks = IDS.map((id) => lookOf(id));
  const quelle = readFileSync('src/world/Dungling.svg.jsx', 'utf8');

  check('lookOf liest genau eine Angabe: die Id', lookOf.length === 1, `${lookOf.length} Parameter`);
  check('dieselbe Id ergibt zweimal dasselbe Wesen', looks.filter((look, index) => JSON.stringify(look) !== JSON.stringify(lookOf(IDS[index]))).length === 0, `${abweichungen(looks, IDS)} Abweichungen`);
  check('die Zeichenebene liest die Kachel nicht mehr', !quelle.includes('dungling.tile'), `${(quelle.match(/dungling\.tile/g) ?? []).length} Zugriffe auf die Kachel`);

  check('zwei Wesen sehen nie gleich aus', new Set(looks.map((look) => look.shell)).size === IDS.length, `${new Set(looks.map((look) => look.shell)).size} von ${IDS.length} Schalen`);
  check('die Lappen variieren', streut(looks, (look) => look.lobes) > IDS.length / 2, `${streut(looks, (look) => look.lobes)} von ${IDS.length}`);
  check('die Adern variieren', streut(looks, (look) => look.veins) > IDS.length / 2, `${streut(looks, (look) => look.veins)} von ${IDS.length}`);
  check('die Naht variiert', streut(looks, (look) => look.seam.rest) > IDS.length / 2, `${streut(looks, (look) => look.seam.rest)} von ${IDS.length}`);

  check('jede Krone hat zwei oder drei Triebe', looks.every((look) => look.crown.length >= 2 && look.crown.length <= 3), `Längen ${[...new Set(looks.map((look) => look.crown.length))].join(' und ')}`);
  check('jede Haut trägt drei bis sechs Poren', looks.every((look) => look.pores.length >= 3 && look.pores.length <= 6), `Längen ${[...new Set(looks.map((look) => look.pores.length))].sort().join(' bis ')}`);
  check('die Beine bleiben unter der Schale', looks.every((look) => fusserdeckung(look) > 1), `engste Reserve ${Math.min(...looks.map(fusserdeckung)).toFixed(2)}`);
  check('nichts waechst aus der Kachel', looks.every((look) => ausserhalb(look) === 0), `${looks.reduce((sum, look) => sum + ausserhalb(look), 0)} Punkte ausserhalb`);
}
