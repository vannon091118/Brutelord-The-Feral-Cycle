/**
 * Globale Versionierung — lesen und prüfen.
 *
 * `version.lock.json` ist die globale Wahrheit für Version und monotone
 * Revision. `VERSION` und `package.json` sind Spiegel. Parallele Branches
 * müssen denselben Lock fortschreiben; bei konkurrierenden Erhöhungen kommt
 * es zum Merge-Konflikt statt stiller Versionsdivergenz. Nur der Versionierer
 * darf Version und Revision gemeinsam erhöhen.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const VERSION_FILE = 'VERSION';
export const LOCK_FILE = 'version.lock.json';
export const PACKAGE_FILE = 'package.json';
export const NPM_LOCK_FILE = 'package-lock.json';

export function readText(file) {
  return readFileSync(file, 'utf8').trim();
}

export function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

export function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(version).trim());
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

export function formatVersion({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`;
}

export function bumpVersion(version, kind) {
  const parsed = parseVersion(version);
  if (!parsed) throw new Error(`Ungültige Version: ${version}`);
  if (kind === 'major') return formatVersion({ major: parsed.major + 1, minor: 0, patch: 0 });
  if (kind === 'minor') return formatVersion({ major: parsed.major, minor: parsed.minor + 1, patch: 0 });
  if (kind === 'patch') return formatVersion({ ...parsed, patch: parsed.patch + 1 });
  throw new Error(`Unbekannte Stufe: ${kind} (erlaubt: major, minor, patch)`);
}

export function compareVersions(left, right) {
  const a = parseVersion(left);
  const b = parseVersion(right);
  if (!a || !b) throw new Error('Versionsvergleich braucht zwei gültige Versionen.');
  return (a.major - b.major) || (a.minor - b.minor) || (a.patch - b.patch);
}

/** Liest den Stand der drei Stellen (VERSION, Lock, package.json). */
export function readVersionState(root = '.') {
  const lock = readJson(join(root, LOCK_FILE));
  const version = lock.version;
  const mirrorVersion = readText(join(root, VERSION_FILE));
  const pkg = readJson(join(root, PACKAGE_FILE));
  const npmLock = readJson(join(root, NPM_LOCK_FILE));
  return {
    version,
    revision: lock.revision,
    mirrorVersion,
    packageVersion: pkg.version,
    npmLockVersion: npmLock.version,
    npmRootVersion: npmLock.packages?.['']?.version,
  };
}

/** Prüft die Konsistenz der Versionierung an sich. */
export function versionViolations(state) {
  const problems = [];
  if (!parseVersion(state.version)) problems.push(`${LOCK_FILE} enthält keine gültige Version: ${state.version}`);
  if (state.mirrorVersion !== state.version) {
    problems.push(`${VERSION_FILE} (${state.mirrorVersion}) weicht von globaler Autorität ${LOCK_FILE} (${state.version}) ab`);
  }
  if (state.packageVersion !== state.version) {
    problems.push(`${PACKAGE_FILE} (${state.packageVersion}) passt nicht zur globalen Version ${state.version}`);
  }
  if (state.npmLockVersion !== state.version || state.npmRootVersion !== state.version) {
    problems.push(`${NPM_LOCK_FILE} muss global ${state.version} in beiden Metadatenfeldern spiegeln`);
  }
  if (!Number.isInteger(state.revision) || state.revision < 1) {
    problems.push(`${LOCK_FILE} braucht eine positive, ganzzahlige Revision.`);
  }
  return problems;
}

/** Prüft, ob ein Wechsel vom Basisstand erlaubt wäre (keine Divergenz). */
export function versionTransitionViolations({ base, head }) {
  if (!base || !parseVersion(base.version) || !Number.isInteger(base.revision)) return [];
  const problems = [];
  const versionChanged = base.version !== head.version;
  if (versionChanged && head.revision !== base.revision + 1) {
    problems.push(
      `Version wurde auf ${head.version} geändert, Revision muss exakt ${base.revision + 1} sein (Basis: ${base.revision}, gefunden: ${head.revision}). Nur der Versionierer erhöht beides gemeinsam.`,
    );
  }
  if (!versionChanged && head.revision !== base.revision) {
    problems.push(
      `Version unverändert (${head.version}), Revision änderte sich von ${base.revision} auf ${head.revision}.`,
    );
  }
  if (versionChanged && compareVersions(head.version, base.version) <= 0) {
    problems.push(`Version ${head.version} ist nicht größer als der Basisstand ${base.version}.`);
  }
  return problems;
}
