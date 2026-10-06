/**
 * Blutstein kommt nur aus dem Raid gegen einen feindlichen Hive; die eigene
 * Basis liefert nichts. Das ist die Gegenprobe, nicht eine Fußnote.
 */
import { BLOODSTONE_CONFIG } from '../../src/domain/economy/bloodstone-config.js';
import {
  baseYieldFor,
  canUnlockDepth,
  createBloodstoneLedger,
  depositBloodstone,
  depthCostFor,
  raidYieldFor,
  unlockDepth,
} from '../../src/domain/economy/bloodstone-loop.js';
import { check, section } from './expect.mjs';

const HOSTILE = BLOODSTONE_CONFIG.hostileHiveKind;
const PHASE = BLOODSTONE_CONFIG.minRaidPhase;

function totalCost() {
  let sum = 0;
  for (let depth = 0; depth < BLOODSTONE_CONFIG.maxDepth; depth += 1) sum += depthCostFor(depth);
  return sum;
}

function ledgerWith(stored) {
  return depositBloodstone(createBloodstoneLedger(), stored);
}

function climb(start, steps) {
  let current = depositBloodstone(start, totalCost());
  for (let step = 0; step < steps; step += 1) {
    const result = unlockDepth(current);
    if (result.ok) current = result.ledger;
  }
  return current;
}

function checkSource() {
  section('Blutstein: die Quelle liegt im Risiko, nicht in der Basis');
  const leer = createBloodstoneLedger();
  check('Die eigene Basis liefert nach null Takten nichts', baseYieldFor({ ticks: 0 }) === BLOODSTONE_CONFIG.baseYield);
  check('Die eigene Basis liefert nach einem Takt nichts', baseYieldFor({ ticks: 1 }) === BLOODSTONE_CONFIG.baseYield);
  check('Die eigene Basis liefert nach tausend Takten nichts', baseYieldFor({ ticks: 1000 }) === BLOODSTONE_CONFIG.baseYield);

  check('Der Raid ohne die Beute-Phase liefert nichts',
    raidYieldFor({ phase: 'ENTER', hiveKind: HOSTILE, wardenAlive: false }) === 0);
  check('Der eigene Hive liefert nichts, auch in der Beute-Phase',
    raidYieldFor({ phase: PHASE, hiveKind: 'OWN_HIVE', wardenAlive: false }) === 0);
  check('Ein lebender Wächter verhindert die Beute',
    raidYieldFor({ phase: PHASE, hiveKind: HOSTILE, wardenAlive: true }) === 0);
  check('Ohne Angabe eines Wächters gilt er als gefallen',
    raidYieldFor({ phase: PHASE, hiveKind: HOSTILE }) === BLOODSTONE_CONFIG.hiveYield);

  const beute = raidYieldFor({ phase: PHASE, hiveKind: HOSTILE, wardenAlive: false });
  check('Der feindliche Hive mit gefallenem Wächter liefert genau die Beute', beute === BLOODSTONE_CONFIG.hiveYield);
  check('Die Beute landet in genau dieser Höhe im Vorrat', depositBloodstone(leer, beute).stored === beute);
  check('Ein Einzahlen von null lässt das Ledger unberührt', depositBloodstone(leer, 0) === leer);
  check('Ein negatives Einzahlen lässt das Ledger unberührt', depositBloodstone(leer, -3) === leer);
  check('Ein Bruchteil unter eins verändert nichts', depositBloodstone(leer, 0.5) === leer);
}

function checkSink() {
  section('Blutstein: der Abnehmer ist die nächste Etage');
  const reich = ledgerWith(totalCost());
  const erste = unlockDepth(reich);
  check('Genug Blutstein gibt die nächste Etage frei', erste.ok === true);
  check('Die Freigabe kostet genau die Kosten der Etage',
    reich.stored - erste.ledger.stored === depthCostFor(reich.depth));
  check('Die Freigabe hebt die Tiefe um genau eins', erste.ledger.depth === reich.depth + 1);
  check('Die Freigabe erhöht das Risiko um genau seinen Satz',
    erste.ledger.risk === reich.risk + BLOODSTONE_CONFIG.riskPerDepth);
  check('Die Kosten einer Etage steigen mit der Tiefe', depthCostFor(1) > depthCostFor(0));
  check('Ein reiches Ledger hat Anrecht auf die nächste Etage', canUnlockDepth(reich) === true);

  const arm = ledgerWith(depthCostFor(0) - 1);
  const verweigert = unlockDepth(arm);
  check('Ohne genug Blutstein wird verweigert', verweigert.ok === false);
  check('Die Verweigerung nennt einen stabilen Fehlerschlüssel',
    typeof verweigert.error === 'string' && verweigert.error.length > 0, verweigert.error);
  check('Die Verweigerung lässt das Ledger unberührt', verweigert.ledger === arm);
  check('Ein zu armes Ledger hat kein Anrecht', canUnlockDepth(arm) === false);
}

function checkLimit() {
  section('Blutstein: der Deckel hält');
  const oben = climb(createBloodstoneLedger(), BLOODSTONE_CONFIG.maxDepth + 2);
  check('Der Aufstieg endet an der höchsten Tiefe', oben.depth === BLOODSTONE_CONFIG.maxDepth, `Tiefe ${oben.depth}`);
  check('Über die höchste Tiefe hinaus gibt es kein Anrecht', canUnlockDepth(oben) === false);
  const drueber = unlockDepth(oben);
  check('Die Verweigerung oberhalb des Deckels trägt einen Schlüssel',
    drueber.ok === false && drueber.error !== 'bloodstone:not-enough', drueber.error);
  check('Das Risiko bleibt unter seinem Deckel', oben.risk <= BLOODSTONE_CONFIG.maxRisk, `Risiko ${oben.risk}`);
}

function checkDeterminism() {
  section('Blutstein: dieselbe Eingabe, dasselbe Ergebnis');
  const erste = unlockDepth(ledgerWith(totalCost()));
  const zweite = unlockDepth(ledgerWith(totalCost()));
  check('Zwei Freigaben mit gleicher Lage stimmen überein', JSON.stringify(erste) === JSON.stringify(zweite));
  check('Die Basis-Ausbeute ist wiederholbar', baseYieldFor({ ticks: 7 }) === baseYieldFor({ ticks: 7 }));
  check('Die Beute ist wiederholbar',
    raidYieldFor({ phase: PHASE, hiveKind: HOSTILE, wardenAlive: false }) === BLOODSTONE_CONFIG.hiveYield);
  check('Der Fehlerschlüssel ist wiederholbar', unlockDepth(createBloodstoneLedger()).error === 'bloodstone:not-enough');
}

export async function checkBloodstone() {
  checkSource();
  checkSink();
  checkLimit();
  checkDeterminism();
}
