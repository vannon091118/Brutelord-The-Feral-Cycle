/** Die erlaubten Importrichtungen zwischen den Schichten von `src/`. Gate und
 *  Prueflauf lesen diese Tabelle, statt sie nachzuerzaehlen; was nicht darin
 *  steht, ist verboten (GOVERNANCE.md, *Importrichtungen*). */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

export const SRC_LAYERS = Object.freeze(['domain', 'state', 'world', 'ui', 'app', 'styles']);

export const ALLOWED_TARGETS = Object.freeze({
  domain: Object.freeze(['domain']),
  state: Object.freeze(['domain', 'state']),
  world: Object.freeze(['domain', 'state', 'world']),
  ui: Object.freeze(['domain', 'state', 'world', 'ui']),
  app: Object.freeze(['domain', 'state', 'world', 'ui', 'app']),
  root: Object.freeze(['domain', 'state', 'world', 'ui', 'app', 'styles']),
  styles: Object.freeze(['styles']),
});

export const BARE_ALLOWED = Object.freeze(['react', 'react-dom', 'react/jsx-runtime']);

export function importSpecifiers(code) {
  const muster = [/from\s+['"]([^'"]+)['"]/g, /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g, /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g];
  return muster.flatMap((regex) => [...code.matchAll(regex)].map((match) => match[1]));
}

export function layerOf(path) {
  const rest = path.replace(/^src\//, '');
  const [first] = rest.split('/');
  if (rest === first) return 'root';
  return SRC_LAYERS.includes(first) ? first : null;
}

export function layerViolation(path) {
  return path.startsWith('src/') && layerOf(path) === null ? `${path} (unbekannte Schicht)` : null;
}

function bareProblem({ path, layer, spec }) {
  if (layer !== 'domain' && BARE_ALLOWED.some((name) => spec === name || spec.startsWith(`${name}/`))) return null;
  return `${path} -> ${spec} (Fremdpaket)`;
}

function relativeProblem({ path, layer, spec }) {
  const ziel = resolve(dirname(path), spec);
  const rest = relative(resolve('src'), ziel).split('\\').join('/');
  if (rest.startsWith('..')) return `${path} -> ${spec} (ausserhalb von src)`;
  const zielLayer = layerOf(`src/${rest}`);
  if (zielLayer === null || zielLayer === 'root') return null;
  return ALLOWED_TARGETS[layer].includes(zielLayer) ? null : `${path} -> ${spec} (${layer} darf nicht nach ${zielLayer})`;
}

export function importViolations(entries) {
  const fehler = [];
  for (const { path, code } of entries) {
    const fremd = layerViolation(path);
    if (fremd) {
      fehler.push(fremd);
      continue;
    }
    const layer = layerOf(path);
    if (!layer) continue;
    for (const spec of importSpecifiers(code)) {
      const problem = spec.startsWith('.') ? relativeProblem({ path, layer, spec }) : bareProblem({ path, layer, spec });
      if (problem) fehler.push(problem);
    }
  }
  return fehler;
}

export function treeEntries(root = 'src', found = []) {
  for (const name of readdirSync(root)) {
    const path = join(root, name);
    if (statSync(path).isDirectory()) treeEntries(path, found);
    else if (/\.(js|jsx)$/.test(path)) found.push({ path, code: readFileSync(path, 'utf8') });
  }
  return found;
}

export function treeViolations(root = 'src') {
  return importViolations(treeEntries(root));
}
