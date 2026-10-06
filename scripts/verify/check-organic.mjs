/** Die Organik: Metaball-Konturen des Brutlords, deterministisch, geschlossen und symmetrisch. */
import { FEATURE_ANCHOR, GENE_LOCI, ORGANIC_CONFIG, SPECIES, SPECIES_GRAMMAR } from '../../src/domain/brutelord/genome-config.js';
import { createGenome, fairExpressed } from '../../src/domain/brutelord/genome-roll.js';
import { phenotypeOf } from '../../src/domain/brutelord/phenotype.js';
import { phaseOf, skeletonOf } from '../../src/domain/brutelord/organic-bones.js';
import { fieldOf, sampleField } from '../../src/domain/brutelord/organic-field.js';
import { anchorsOf } from '../../src/domain/brutelord/organic-anchors.js';
import { check, section } from './expect.mjs';

const ORG = ORGANIC_CONFIG;
const MIRROR_TOLERANCE = 1e-6;
const GENOMES = Array.from({ length: 40 }, (unused, index) => createGenome(index * 7919 + 3));
const SAMPLE = GENOMES.map((genome) => phenotypeOf(genome));
const PHASES = Array.from({ length: ORG.phaseCount }, (unused, index) => index);
let pool = null;

function fields() {
  if (pool === null) pool = SAMPLE.flatMap((phenotype) => PHASES.map((phase) => fieldOf(phenotype, phase)));
  return pool;
}

function areaOf(ring) {
  return ring.reduce((sum, point, index) => {
    const next = ring[(index + 1) % ring.length];
    return sum + point.x * next.y - next.x * point.y;
  }, 0) / 2;
}

function turnOf(ring) {
  let total = 0;
  for (let index = 0; index < ring.length; index += 1) {
    const a = ring[index];
    const b = ring[(index + 1) % ring.length];
    const c = ring[(index + 2) % ring.length];
    const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    const dot = (b.x - a.x) * (c.x - b.x) + (b.y - a.y) * (c.y - b.y);
    total += Math.atan2(cross, dot);
  }
  return total / (2 * Math.PI);
}

function minEdge(ring) {
  return ring.reduce((best, point, index) => {
    const next = ring[(index + 1) % ring.length];
    return Math.min(best, Math.hypot(next.x - point.x, next.y - point.y));
  }, Infinity);
}

function widthOf(field) {
  const xs = field.rings.flat().map((point) => point.x);
  return Math.max(...xs) - Math.min(...xs);
}

function signature(field) {
  return JSON.stringify(field.rings);
}

function checkDeterminism() {
  section('Organik: deterministische Konturen');
  const phenotype = SAMPLE[0];
  const first = fieldOf(phenotype, 0);
  const again = fieldOf(phenotype, 0);
  check('Derselbe Phaenotyp und dieselbe Phase ergeben dieselben Ringe', signature(first) === signature(again));
  check('Dasselbe Skelett kommt zweimal heraus', JSON.stringify(first.skeleton) === JSON.stringify(again.skeleton));
  check('Ein anderer Phaenotyp ergibt andere Ringe', signature(fieldOf(SAMPLE[1], 0)) !== signature(first));
  check('Eine andere Phase ergibt andere Ringe', signature(fieldOf(phenotype, 1)) !== signature(first));
  check('Die Anker sind reproduzierbar', JSON.stringify(anchorsOf(first)) === JSON.stringify(anchorsOf(again)));
}

function shapeOf(values) {
  return values.slice(0, -1).map((value, index) => Math.sign(value - values[index + 1]));
}

function checkPhases() {
  section('Organik: vier Phasen');
  const { breathe, phaseCount } = ORG;
  const peak = breathe.indexOf(Math.max(...breathe));
  const frames = SAMPLE.map((unused, index) => fields().slice(index * PHASES.length, (index + 1) * PHASES.length));
  const widths = frames.map((frame) => frame.map((field) => widthOf(field)));
  const distinct = frames.filter((frame) => new Set(frame.map((field) => signature(field))).size === phaseCount).length;
  check('Die Config kennt genau vier Phasen', phaseCount === 4, `${phaseCount}`);
  check('Die Phase laeuft von 0 bis 3', PHASES.every((phase) => phaseOf(phase) === phase));
  check('Die Phase laeuft um', phaseOf(phaseCount) === 0 && phaseOf(-1) === phaseCount - 1, `${phaseOf(-1)}`);
  check('Vier Phasen tragen vier verschiedene Atemwerte', new Set(breathe).size === phaseCount, breathe.join(', '));
  check('Vier Phasen ergeben vier verschiedene Konturen', distinct === frames.length, `${distinct}/${frames.length} Phaenotypen`);
  check('Die Breite folgt der Atemkurve', widths.every((row) => shapeOf(row).join() === shapeOf(breathe).join()), widths[0].map((width) => width.toFixed(2)).join(', '));
  check('Die Peak-Phase weitet am meisten', widths.every((row) => row.indexOf(Math.max(...row)) === peak), `Phase ${peak}`);
}

function ringProblems(ring) {
  const issues = [];
  const area = areaOf(ring);
  const turn = turnOf(ring);
  if (ring.length < ORG.ringMinPoints) issues.push(`kurz ${ring.length}`);
  if (Math.abs(area) < ORG.ringMinArea) issues.push(`flach ${area.toFixed(4)}`);
  if (Math.abs(Math.abs(turn) - 1) > 1e-9) issues.push(`offen ${turn.toFixed(4)}`);
  if (Math.abs(turn - 1) > 1e-9) issues.push(`winding ${turn.toFixed(4)}`);
  if (ring.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y))) issues.push('unendlich');
  return issues;
}

function checkRings() {
  section('Organik: Ringe geschlossen und nicht entartet');
  const problems = [];
  const all = fields();
  let count = 0;
  let smallest = Infinity;
  for (const field of all) {
    count += field.rings.length;
    if (field.rings.length === 0) problems.push(`leer ${field.skeleton.seed}`);
    for (const ring of field.rings) {
      problems.push(...ringProblems(ring));
      smallest = Math.min(smallest, minEdge(ring));
    }
  }
  const kind = (prefix) => problems.filter((entry) => entry.startsWith(prefix));
  const degenerated = problems.filter((entry) => /^(kurz|flach|unendlich)/.test(entry));
  check('Jede Kontur hat mindestens einen Ring', count >= all.length, `${count} Ringe in ${all.length} Konturen`);
  check('Kein Ring ist entartet', degenerated.length === 0 && kind('leer').length === 0, degenerated.slice(0, 3).join(', '));
  check('Kein Ring ist offen', kind('offen').length === 0, kind('offen').slice(0, 3).join(', '));
  check('Jeder Ring laeuft gegen den Uhrzeigersinn', kind('winding').length === 0, kind('winding').slice(0, 3).join(', '));
  check('Die Ringe tragen keine Nullkanten', smallest > 0, smallest.toExponential(2));
}

/** Die untere Grenze in der sortierten x-Achse — der Anfang des Suchfensters. */
function lowerBound(values, value) {
  let low = 0;
  let high = values.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (values[mid] < value) low = mid + 1;
    else high = mid;
  }
  return low;
}

/** Gesucht wird nur im Fenster der gespiegelten x-Achse statt gegen alle
 *  Punkte: das echte Paar liegt bei 1e-16, also weit innerhalb von 1e-6. */
function unmirrored(points) {
  const byX = [...points].sort((left, right) => left.x - right.x);
  const xs = byX.map((point) => point.x);
  return points.filter((point) => {
    let best = Infinity;
    for (let index = lowerBound(xs, -point.x - MIRROR_TOLERANCE); index < xs.length; index += 1) {
      if (xs[index] > -point.x + MIRROR_TOLERANCE) break;
      best = Math.min(best, Math.hypot(byX[index].x + point.x, byX[index].y - point.y));
    }
    return best >= MIRROR_TOLERANCE;
  });
}

function checkSymmetry() {
  section('Organik: Spiegel-Symmetrie');
  const all = fields();
  const ohne = [];
  let total = 0;
  for (const field of all) {
    const points = field.rings.flat();
    total += points.length;
    ohne.push(...unmirrored(points));
  }
  check('Jeder Konturpunkt hat sein Spiegelbild', ohne.length === 0, `${ohne.length} von ${total} Punkten ohne Paar`);
  check('Die Konturen tragen genug Punkte fuer den Vergleich', total > all.length * 20, `${total} Punkte`);
}

function nearestGap(field, joint) {
  return field.rings.reduce(
    (best, ring) => ring.reduce((inner, point) => Math.min(inner, Math.hypot(point.x - joint.x, point.y - joint.y)), best),
    Infinity,
  );
}

function anchorProblems(field) {
  const tagged = field.skeleton.joints.filter((joint) => joint.role !== null).length;
  const anchors = anchorsOf(field);
  const problems = [];
  if (anchors.length !== tagged) problems.push(`zahl ${anchors.length}/${tagged}`);
  for (const anchor of anchors) {
    const point = field.rings[anchor.ring]?.[anchor.index];
    if (!point || point.x !== anchor.point.x || point.y !== anchor.point.y) problems.push(`ort ${anchor.role}`);
    if (Math.abs(sampleField(field.skeleton, anchor.point) - ORG.iso) > ORG.cell) problems.push(`niveau ${anchor.role}`);
    if (Math.abs(anchor.gap - nearestGap(field, anchor.joint)) > 1e-9) problems.push(`ferne ${anchor.role}`);
  }
  return { anchors, problems };
}

function checkAnchors() {
  section('Organik: Anker liegen auf ihren Ringen');
  const all = fields();
  const problems = [];
  const roles = new Set();
  let count = 0;
  for (const field of all) {
    const found = anchorProblems(field);
    problems.push(...found.problems);
    found.anchors.forEach((anchor) => roles.add(anchor.role));
    count += found.anchors.length;
  }
  check('Jeder markierte Gelenkpunkt bekommt einen Anker', !problems.some((entry) => entry.startsWith('zahl')), problems.slice(0, 3).join(', '));
  check('Der Ankerpunkt ist ein Punkt seines Rings', !problems.some((entry) => entry.startsWith('ort')), problems.slice(0, 3).join(', '));
  check('Der Anker ist der naechste Ringpunkt', !problems.some((entry) => entry.startsWith('ferne')), problems.slice(0, 3).join(', '));
  check('Der Ankerpunkt liegt auf der Iso-Linie', !problems.some((entry) => entry.startsWith('niveau')), problems.slice(0, 3).join(', '));
  const probe = anchorsOf(all[0])[0];
  const shifted = Math.abs(sampleField(all[0].skeleton, { x: probe.point.x + ORG.cell * 2, y: probe.point.y }) - ORG.iso);
  check('Ein verschobener Ankerpunkt faellt aus dem Iso-Band', shifted > ORG.cell, `${shifted.toFixed(3)} gegen ${ORG.cell}`);
  check('Augen, Kiefer und Ruecken sind verankert', ['EYE_SOCKET', 'JAW', 'BACK'].every((role) => roles.has(role)) && count >= all.length, `${count} Anker`);
  check('Gliedmassen tragen Spitzenanker', roles.has(FEATURE_ANCHOR.LIMB_TIP));
}

function speciesGroups() {
  return SAMPLE.reduce((map, phenotype) => {
    (map[phenotype.species] ??= []).push(phenotype);
    return map;
  }, {});
}

function spurCount(species) {
  return (SPECIES_GRAMMAR[species].rules.S.match(/\[/g) ?? []).length;
}

function rootsPerSide(skeleton) {
  return skeleton.bones.filter((bone) => bone.limb && bone.r1 < bone.r2 * 0.7).length / 2;
}

function axisNodes(skeleton) {
  return skeleton.bones.filter((bone) => !bone.limb).length - 1;
}

function roleSignature(skeleton) {
  return skeleton.joints.map((joint) => joint.role).filter(Boolean).sort().join(',');
}

function checkSpecies() {
  section('Art: der Spezies-Locus schaltet die Grammatik');
  const order = Object.values(SPECIES);
  check('Der Locus kennt genau die vier Arten', order.every((species) => GENE_LOCI.SPECIES.values.includes(species)), GENE_LOCI.SPECIES.values.join(', '));
  check('Das Genom nennt dieselbe Art wie der Phaenotyp', GENOMES.every((genome, index) => SAMPLE[index].species === GENE_LOCI.SPECIES.values[fairExpressed(genome, 'SPECIES')]));
  const groups = speciesGroups();
  check('Alle vier Arten kommen in den Generationen vor', order.every((species) => groups[species]?.length > 0), order.map((species) => `${species} ${groups[species]?.length ?? 0}`).join(', '));
  const signatures = order.map((species) => JSON.stringify(fieldOf(groups[species][0], 0).rings));
  check('Vier Arten ergeben vier verschiedene Konturen', new Set(signatures).size === order.length, `${new Set(signatures).size} von ${order.length}`);
  const roleSignatures = order.map((species) => roleSignature(skeletonOf(groups[species][0], 0)));
  check('Vier Arten tragen vier verschiedene Merkmals-Anker', new Set(roleSignatures).size === order.length, `${new Set(roleSignatures).size} von ${order.length}`);
  for (const species of order) {
    const spec = SPECIES_GRAMMAR[species];
    const skeleton = skeletonOf(groups[species][0], 0);
    check(`${species} baut ${spec.nodes} Rumpfknoten`, axisNodes(skeleton) === spec.nodes, `${axisNodes(skeleton)}`);
    check(`${species} treibt ${spec.nodes * spurCount(species)} Sprossen je Seite`, rootsPerSide(skeleton) === spec.nodes * spurCount(species), `${rootsPerSide(skeleton)}`);
  }
}

export function checkOrganic() {
  checkDeterminism();
  checkPhases();
  checkRings();
  checkSymmetry();
  checkAnchors();
  checkSpecies();
}
