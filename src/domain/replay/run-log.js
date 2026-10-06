// @doc: docs/daten/replay/run-log.md#run-log
export const RUN_LOG = Object.freeze({ version: 1, maxInputs: 4096, shareInputs: 512, prefix: 'BFC1' });

export function createRunLog(seed, maxInputs = RUN_LOG.maxInputs) {
  return { version: RUN_LOG.version, seed: String(seed), maxInputs, inputs: [] };
}

function payloadOf(input) {
  const rest = {};
  for (const key of Object.keys(input).sort()) {
    if (key !== 'type' && input[key] !== undefined) rest[key] = input[key];
  }
  return rest;
}

export function recordInput(log, input) {
  if (!input || typeof input.type !== 'string') return log;
  if (log.inputs.length >= log.maxInputs) return log;
  return { ...log, inputs: [...log.inputs, { type: input.type, ...payloadOf(input) }] };
}

function codeOf(input) {
  const payload = payloadOf(input);
  return Object.keys(payload).length === 0 ? input.type : `${input.type}~${JSON.stringify(payload)}`;
}

function hashOf(text) {
  let h = 2166136261;
  for (let index = 0; index < text.length; index += 1) h = Math.imul(h ^ text.charCodeAt(index), 16777619);
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function logDigest(log) {
  return hashOf(log.inputs.map(codeOf).join(';'));
}

export function shareCode(log) {
  if (log.inputs.length > RUN_LOG.shareInputs) return null;
  const kopf = [RUN_LOG.prefix, log.seed, log.inputs.length, logDigest(log)].join('-');
  return `${kopf}-${log.inputs.map(codeOf).join(';')}`;
}

function parseInputs(text, count) {
  if (count === 0) return text === '' ? [] : null;
  const teile = text.split(';');
  if (teile.length !== count) return null;
  const inputs = [];
  for (const teil of teile) {
    const [type, payload] = teil.split('~');
    if (!type) return null;
    try {
      inputs.push({ type, ...(payload ? JSON.parse(payload) : {}) });
    } catch {
      return null;
    }
  }
  return inputs;
}

export function parseShareCode(text) {
  if (typeof text !== 'string') return null;
  const teile = text.trim().split('-');
  if (teile.length < 5 || teile[0] !== RUN_LOG.prefix || !/^\d+$/.test(teile[2])) return null;
  const count = Number(teile[2]);
  if (count > RUN_LOG.shareInputs) return null;
  const inputs = parseInputs(teile.slice(4).join('-'), count);
  if (inputs === null) return null;
  const log = createRunLog(teile[1]);
  log.inputs = inputs;
  return logDigest(log) === teile[3] ? log : null;
}
