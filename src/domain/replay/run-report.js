// @doc: docs/daten/replay/run-report.md#run-report

export function firstDivergence(expected, actual) {
  const laenge = Math.min(expected.length, actual.length);
  for (let index = 0; index < laenge; index += 1) {
    if (expected[index] !== actual[index]) return index;
  }
  return expected.length === actual.length ? -1 : laenge;
}
