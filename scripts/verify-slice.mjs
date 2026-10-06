#!/usr/bin/env node
/** Der Volllauf: alle Pruefgruppen in ihrer Reihenfolge — die Zeile fuer die CI. */
import { GROUPS, runGroups } from './verify/groups.mjs';
import { summary } from './verify/expect.mjs';

const m = await import('./verify/index.mjs');
await runGroups({ m, groups: GROUPS });
process.exitCode = summary();
