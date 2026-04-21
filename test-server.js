#!/usr/bin/env node
// test-server.js — Auto-discover model on a server, skip already-tested roles, run the rest
// Usage: node test-server.js <server:port> [--openai]
//
// 1. Connects to the server and gets the model name
// 2. Checks models-catalog.json for which roles are already tested
// 3. Runs only missing roles via test-role.js
// 4. Shows progress and what was skipped

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { registerModel } = require('./register-model');

const CATALOG_PATH = path.join(__dirname, 'models-catalog.json');
const MODELS_DIR = path.join(__dirname, 'models');
function modelFilePath(n) {
  const safe = n.replace(/[:/]/g, '_').replace(/\s+/g, '_');
  return path.join(MODELS_DIR, safe + '.json');
}
function readModelFile(n) {
  try {
    const raw = JSON.parse(fs.readFileSync(modelFilePath(n), 'utf-8'));
    const { __modelName, ...rest } = raw;
    return rest;
  } catch { return null; }
}
const TEST_STATE_DIR = path.join(__dirname, 'test-state');
const ALL_AGENTS = ['router','orchestrator','planner','coder','reviewer','summarizer','architect','critic','tester','debugger','researcher','refactorer','translator','data_analyst','preflight','postcheck','postmortem'];

// Load role fixture counts so we know when a role is "complete" in state file
const { ROLE_FIXTURES } = require('./fixtures');

function safeModelName(n) { return n.replace(/[:/]/g, '_').replace(/\s+/g, '_'); }

function readStateFor(model) {
  try {
    return JSON.parse(fs.readFileSync(path.join(TEST_STATE_DIR, safeModelName(model) + '.json'), 'utf-8'));
  } catch {
    return { completed: {} };
  }
}

function isRoleCompleteInState(state, role) {
  const total = (ROLE_FIXTURES[role] || []).length;
  if (total === 0) return true; // skipped role
  const done = Object.values(state.completed || {}).filter(v => v.role === role).length;
  return done >= total;
}

function roleProgressInState(state, role) {
  const total = (ROLE_FIXTURES[role] || []).length;
  const done = Object.values(state.completed || {}).filter(v => v.role === role).length;
  return { done, total };
}

const args = process.argv.slice(2);
const flags = args.filter(a => a.startsWith('--'));
const positional = args.filter(a => !a.startsWith('--'));
const serverArg = positional[0];
const openaiMode = flags.includes('--openai');
const forceMode = flags.includes('--force');
const backoffMode = flags.includes('--backoff');

if (!serverArg) {
  console.error('Usage: node test-server.js <server:port> [--openai]');
  process.exit(1);
}

const server = serverArg.includes('://') ? serverArg : `http://${serverArg}`;

async function run() {
  // ─── Step 1: Discover model name ────────────────────────────────────

  console.log(`\nConnecting to ${server}...`);
  let modelName;

  try {
    if (openaiMode) {
      const res = await fetch(`${server}/v1/models`);
      const data = await res.json();
      const models = data.data || data.models || [];
      if (models.length === 0) {
        console.error('No models found on server');
        process.exit(1);
      }
      modelName = models[0].id || models[0].name || models[0].model;
    } else {
      const res = await fetch(`${server}/api/tags`);
      const data = await res.json();
      const models = data.models || [];
      if (models.length === 0) {
        console.error('No models loaded on server');
        process.exit(1);
      }
      // Use the most recently modified model
      models.sort((a, b) => new Date(b.modified_at) - new Date(a.modified_at));
      modelName = models[0].name;
    }
  } catch (err) {
    console.error(`Failed to connect to ${server}: ${err.message}`);
    process.exit(1);
  }

  console.log(`Model found: ${modelName}`);

  // ─── Step 1.5: Pre-register model metadata in catalog ───────────────
  // This ensures runtime data (context, size, architecture) is persisted
  // even if tests never run or get interrupted

  console.log(`\nFetching model metadata from server...`);
  try {
    await registerModel(serverArg, modelName, { openai: openaiMode, verbose: true });
  } catch (err) {
    console.log(`  WARN: registration failed: ${err.message} (tests will still run)`);
  }

  // ─── Step 2: Check per-model file + state file for existing test results ────

  // Prefer the per-model file (always up-to-date). Fall back to models-catalog.json
  // for models whose per-model file doesn't exist yet (first-time test on a server).
  const state = readStateFor(modelName);
  const hasStateFile = Object.keys(state.completed || {}).length > 0;
  let entry = readModelFile(modelName);
  if (!entry) {
    try {
      const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
      entry = catalog[modelName] || null;
    } catch {}
  }

  const completedRoles = [];
  const partialRoles = [];
  const untestedRoles = [];

  for (const r of ALL_AGENTS) {
    if (hasStateFile) {
      const p = roleProgressInState(state, r);
      if (p.done >= p.total && p.total > 0) completedRoles.push(r);
      else if (p.done > 0) partialRoles.push({ role: r, done: p.done, total: p.total });
      else untestedRoles.push(r);
    } else if (entry?.roleScores?.[r]) {
      // Legacy: no state file but catalog has role data — treat as complete
      completedRoles.push(r);
    } else {
      untestedRoles.push(r);
    }
  }

  const missingRoles = forceMode
    ? [...ALL_AGENTS]
    : [...partialRoles.map(p => p.role), ...untestedRoles];

  console.log(`\nState status for ${modelName}:`);
  console.log(`  Complete: ${completedRoles.length}/17 [${completedRoles.join(', ') || 'none'}]`);
  if (partialRoles.length > 0) {
    console.log(`  Partial:  ${partialRoles.length}/17 [${partialRoles.map(p => `${p.role}(${p.done}/${p.total})`).join(', ')}]`);
  }
  if (untestedRoles.length > 0) {
    console.log(`  Untested: ${untestedRoles.length}/17 [${untestedRoles.join(', ')}]`);
  }
  if (forceMode) {
    console.log(`  Mode:     FORCE — attempting all 17 roles (test-role.js will skip completed tests per-test)`);
  }

  if (missingRoles.length === 0) {
    console.log('\n  All 16 roles already tested in state file. Nothing to do.');
    console.log('  (Use --force to retry, --reset on a specific model to start over)');
    return;
  }

  // ─── Step 3: Run missing roles ──────────────────────────────────────

  const totalToRun = missingRoles.length;
  const openaiFlag = openaiMode ? ' --openai' : '';
  const backoffFlag = backoffMode ? ' --backoff' : '';
  let completed = 0;

  // Clear backoff state at start of run
  if (backoffMode) {
    try { fs.writeFileSync(path.join(__dirname, '.backoff-state.json'), JSON.stringify({ consecutiveFailures: 0, lastRequestAt: 0 })); } catch {}
  }

  console.log(`\n============================================`);
  console.log(`  ${modelName}`);
  console.log(`  Running ${totalToRun} roles (${completedRoles.length} complete, ${partialRoles.length} partial, ${untestedRoles.length} untested)`);
  console.log(`  Started at ${new Date().toLocaleString()}`);
  console.log(`============================================\n`);

  for (const role of missingRoles) {
    completed++;
    const agentNum = ALL_AGENTS.indexOf(role) + 1;
    console.log(`[${completed}/${totalToRun}] Running ${role} (agent ${agentNum}/17)...`);

    try {
      const cmd = `node test-role.js ${serverArg} ${role} ${modelName} --all${openaiFlag}${backoffFlag}`;
      execSync(cmd, { stdio: 'inherit', cwd: __dirname });
    } catch (err) {
      // Exit code 2 = halt signal from test-role.js (5 consecutive failures)
      if (err.status === 2) {
        console.error(`\n*** HALTING: Server returned 5 consecutive failures ***`);
        console.error(`*** Aborting remaining ${totalToRun - completed} roles ***\n`);
        process.exit(2);
      }
      console.error(`  ERROR on ${role}: ${err.message}`);
      console.log(`  Continuing to next role...`);
    }

    console.log(`[${completed}/${totalToRun}] ${role} complete\n`);
  }

  // ─── Step 4: Summary ────────────────────────────────────────────────

  // Re-read per-model file for final state (always fresh; catalog may not yet be assembled)
  try {
    const e = readModelFile(modelName);
    if (e?.roleScores) {
      const roles = Object.entries(e.roleScores);
      const totalScore = roles.reduce((a, [, d]) => a + d.score, 0);
      const totalPassed = roles.reduce((a, [, d]) => a + d.passed, 0);
      const totalTests = roles.reduce((a, [, d]) => a + d.total, 0);
      const wowP = roles.reduce((a, [, d]) => a + (d.wowPassed || 0), 0);
      const wowT = roles.reduce((a, [, d]) => a + (d.wowTotal || 0), 0);

      console.log(`============================================`);
      console.log(`  COMPLETE: ${modelName}`);
      console.log(`  Roles tested: ${roles.length}/17`);
      console.log(`  Score: ${totalScore > 0 ? '+' : ''}${totalScore} | ${totalPassed}/${totalTests} passed | WOW: ${wowP}/${wowT}`);
      console.log(`  preferred: [${(e.preferred_for || []).join(', ')}]`);
      console.log(`  avoid:     [${(e.avoid_for || []).join(', ')}]`);
      console.log(`============================================`);
    }
  } catch {}
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
