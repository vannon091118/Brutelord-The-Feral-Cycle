/** Die Prüfgruppen in ihrer Reihenfolge — einmal hier, gelesen vom Volllauf und
 *  vom lokalen Lauf. Die Reihenfolge ist keine Bequemlichkeit: `expect.mjs`
 *  zaehlt global, und die Run-Erzeugung liegt vor ihren Verbrauchern. `file`
 *  ist der Einstieg der Gruppe; daraus baut der lokale Lauf ihren Fingerabdruck. */
const V = 'scripts/verify/';

export const GROUPS = Object.freeze([
  { id: 'start', file: `${V}check-start.mjs`, run: (m) => m.checkStart() },
  { id: 'onboarding', file: `${V}check-onboarding.mjs`, needsRun: true, run: (m, ctx) => m.checkOnboarding(ctx.run) },
  { id: 'mining', file: `${V}check-mining.mjs`, needsRun: true, run: (m, ctx) => m.checkMining(ctx.run) },
  { id: 'hit-juice', file: `${V}check-hit-juice.mjs`, needsRun: true, run: (m, ctx) => m.checkHitJuice(ctx.run.state) },
  { id: 'rooting', file: `${V}check-rooting.mjs`, needsRun: true, run: (m, ctx) => m.checkRooting(ctx.run) },
  { id: 'deposits', file: `${V}check-deposits.mjs`, run: (m) => m.checkDeposits() },
  { id: 'edge-mask', file: `${V}check-edge-mask.mjs`, run: (m) => m.checkEdgeMaskGroup() },
  { id: 'claim', file: `${V}check-claim.mjs`, needsRun: true, run: (m, ctx) => m.checkClaim(ctx.run) },
  { id: 'build', file: `${V}check-build.mjs`, run: (m) => m.checkBuild() },
  { id: 'world-views', file: `${V}check-world-views.mjs`, run: (m) => m.checkWorldViews() },
  { id: 'seed', file: `${V}check-seed.mjs`, run: (m) => m.checkSeed() },
  { id: 'account', file: `${V}check-account.mjs`, run: (m) => m.checkAccount() },
  { id: 'account-brake', file: `${V}check-account-brake.mjs`, run: (m) => m.checkAccountBrake() },
  { id: 'camera', file: `${V}check-camera.mjs`, run: (m) => m.checkCamera() },
  { id: 'economy', file: `${V}check-economy.mjs`, run: (m) => m.checkEconomy() },
  { id: 'brutelord', file: `${V}check-brutelord.mjs`, run: (m) => m.checkBruteLord() },
  { id: 'mutant', file: `${V}check-mutant.mjs`, run: (m) => m.checkMutant() },
  { id: 'traits', file: `${V}check-traits.mjs`, run: (m) => m.checkTraits() },
  { id: 'organic-cache', file: `${V}check-organic-cache.mjs`, run: (m) => m.checkOrganicCache() },
  { id: 'raid', file: `${V}check-raid-group.mjs`, run: (m) => m.checkRaidGroup() },
  { id: 'raid-cap', file: `${V}check-raid-cap.mjs`, run: (m) => m.checkRaidCap() },
  { id: 'soil-mass', file: `${V}check-soil-mass.mjs`, run: (m) => m.checkSoilMass() },
  { id: 'burrow-ring', file: `${V}check-burrow-ring.mjs`, run: (m) => m.checkBurrowRing() },
  { id: 'reveal', file: `${V}check-reveal.mjs`, run: (m) => m.checkReveal() },
  { id: 'dungling-look', file: `${V}check-dungling-look.mjs`, run: (m) => m.checkDunglingLook() },
  { id: 'storage', file: `${V}check-storage.mjs`, run: (m) => m.checkStorage() },
  { id: 'account-worker', file: `${V}check-account-worker.mjs`, run: (m) => m.checkAccountWorker() },
  { id: 'account-http', file: `${V}check-account-http.mjs`, run: (m) => m.checkAccountHttp() },
  { id: 'verticality', file: `${V}check-verticality.mjs`, run: (m) => m.checkVerticality() },
  { id: 'verticality-wiring', file: `${V}check-verticality-wiring.mjs`, run: (m) => m.checkVerticalityWiring() },
  { id: 'fixtures', file: `${V}check-fixtures.mjs`, run: (m) => m.checkFixtures() },
  { id: 'action-types', file: `${V}check-action-types.mjs`, run: (m) => m.checkActionTypes() },
  { id: 'determinism', file: `${V}check-determinism.mjs`, inputs: [`${V}determinism-golden.json`], run: (m) => m.checkDeterminism() },
  { id: 'game-clock', file: `${V}check-game-clock.mjs`, run: (m) => m.checkGameClock() },
  { id: 'architecture', file: `${V}check-architecture.mjs`, run: (m) => m.checkArchitecture() },
  { id: 'workflow', file: `${V}check-workflow.mjs`, inputs: ['.github/workflows/auto-bump.yml'], run: (m) => m.checkWorkflow() },
  { id: 'browser', file: `${V}check-startup.mjs`, inputs: ['src'], browser: true, run: (m) => m.checkStartup() },
]);

/** Die Run-Erzeugung liegt vor ihren Verbrauchern und entsteht genau einmal. */
export async function runGroups({ m, groups, prepare }) {
  const ctx = { run: null };
  const erzeugen = prepare ?? ((mm) => mm.makeOnboardingRun());
  for (const group of groups) {
    if (group.needsRun && !ctx.run) ctx.run = await erzeugen(m);
    await group.run(m, ctx);
  }
}

export function groupById(id) {
  return GROUPS.find((group) => group.id === id) ?? null;
}
