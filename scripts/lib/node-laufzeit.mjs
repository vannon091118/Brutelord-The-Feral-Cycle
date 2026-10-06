/** Die Node-Laufzeit als Bindung: der Golden-Wert entsteht nur auf der Major-Version,
 *  die die CI pinnt. Zwei Goldens waeren zwei Wahrheiten ueber denselben Slice — und
 *  getestet wuerde dann der Happy Path des juengeren. Die gepinnte Version wird aus
 *  dem Workflow gelesen, nicht daneben notiert. */
import { readFileSync } from 'node:fs';

const WORKFLOW = '.github/workflows/ci.yml';
const PIN = /^[ \t]*node-version:[ \t]*'?([0-9]+)'?[ \t]*$/m;

export function nodeMajor() {
  return Number(process.versions.node.split('.')[0]);
}

/** Die gepinnte Major-Version, oder null, wenn sie nicht lesbar ist. */
export function ciNodeMajor() {
  const treffer = PIN.exec(readFileSync(WORKFLOW, 'utf8'));
  return treffer ? Number(treffer[1]) : null;
}

export function abweichung({ gepinnt, gelaufen }) {
  if (gepinnt === null) return `${WORKFLOW} nennt keine node-version — der Golden-Wert hat keine Laufzeit-Bindung.`;
  if (gelaufen !== gepinnt) return `Diese Node laeuft auf ${gelaufen}, die CI pinnt ${gepinnt}.`;
  return null;
}