#!/usr/bin/env node
// test-role.js — TypeCast core runner. Runs all tests for one (model, role) pair.
// 6 tests per role (5 standard + 1 wow), each with its own inline validator
//
// Usage: node test-role.js <server:port> <role> <model> [--think] [--no-save] [--test=ID] [--all] [--list]

const fs = require('fs');
const path = require('path');
const { ROLE_FIXTURES, SKIPPED_ROLES } = require('./fixtures');

const CATALOG_PATH = path.join(__dirname, 'models-catalog.json');
const MODELS_DIR = path.join(__dirname, 'models');
function modelFilePath(name) {
  const safe = name.replace(/[:/]/g, '_').replace(/\s+/g, '_');
  return path.join(MODELS_DIR, safe + '.json');
}
const FAILURE_STATE_PATH = path.join(__dirname, '.backoff-state.json');
const TEST_STATE_DIR = path.join(__dirname, 'test-state');

// ─── Per-model test-state helpers (for resume-from-where-we-left-off) ────────

function safeModelName(name) {
  return name.replace(/[:/]/g, '_').replace(/\s+/g, '_');
}

function stateFilePath(model) {
  return path.join(TEST_STATE_DIR, safeModelName(model) + '.json');
}

function ensureStateDir() {
  try { fs.mkdirSync(TEST_STATE_DIR, { recursive: true }); } catch {}
}

function readTestState(model) {
  try {
    return JSON.parse(fs.readFileSync(stateFilePath(model), 'utf-8'));
  } catch {
    return { model, firstTested: null, lastUpdated: null, lastCompleted: null, completed: {} };
  }
}

function writeTestState(model, state) {
  ensureStateDir();
  state.lastUpdated = new Date().toISOString();
  if (!state.firstTested) state.firstTested = state.lastUpdated;
  try {
    fs.writeFileSync(stateFilePath(model), JSON.stringify(state, null, 2));
  } catch (err) {
    console.log(`  [state write failed: ${err.message}]`);
  }
}

function testKey(test, role, index) {
  return test.id || `${role}-${index + 1}`;
}

function markTestComplete(model, role, test, index, result, serverName) {
  const state = readTestState(model);
  const key = testKey(test, role, index);
  state.completed[key] = {
    role,
    name: result.name,
    difficulty: result.difficulty,
    passed: result.valid,
    reason: result.reason || null,
    tokSec: Math.round((result.tokensPerSec || 0) * 10) / 10,
    timeMs: result.totalMs || 0,
    ttftMs: result.ttftMs || null,
    promptTokens: result.promptTokens || 0,
    completionTokens: result.completionTokens || 0,
    testedAt: new Date().toISOString(),
    server: serverName || null
  };
  state.lastCompleted = {
    role,
    testId: key,
    index: index + 1,
    at: new Date().toISOString()
  };
  writeTestState(model, state);
}

function resetTestState(model) {
  try { fs.unlinkSync(stateFilePath(model)); return true; } catch { return false; }
}

function resetRoleInState(model, role) {
  const state = readTestState(model);
  let removed = 0;
  for (const [k, v] of Object.entries(state.completed)) {
    if (v.role === role) { delete state.completed[k]; removed++; }
  }
  writeTestState(model, state);
  return removed;
}

// Server name map: loaded from servers.json if present. Keys are host:port,
// values are friendly names stored in catalog/state. Missing config => use host:port as-is.
let SERVER_NAME_MAP = null;
function loadServerMap() {
  if (SERVER_NAME_MAP !== null) return SERVER_NAME_MAP;
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'servers.json'), 'utf-8'));
    // Strip comment keys starting with underscore
    SERVER_NAME_MAP = {};
    for (const [k, v] of Object.entries(raw)) {
      if (!k.startsWith('_')) SERVER_NAME_MAP[k] = v;
    }
  } catch { SERVER_NAME_MAP = {}; }
  return SERVER_NAME_MAP;
}
function serverNameFromHost(serverUrl) {
  const host = serverUrl.replace(/^https?:\/\//, '');
  const map = loadServerMap();
  return map[host] || host;
}

// ─── Backoff state (persisted across test-role.js invocations) ───────────────

function readFailureState() {
  try { return JSON.parse(fs.readFileSync(FAILURE_STATE_PATH, 'utf-8')); }
  catch { return { consecutiveFailures: 0, lastRequestAt: 0 }; }
}
function writeFailureState(state) {
  try { fs.writeFileSync(FAILURE_STATE_PATH, JSON.stringify(state)); } catch {}
}
function resetFailureState() {
  writeFailureState({ consecutiveFailures: 0, lastRequestAt: 0 });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Rate limit: wait until at least 5 seconds have passed since last request
async function enforceRateLimit() {
  if (!backoffMode) return;
  const state = readFailureState();
  const now = Date.now();
  const elapsed = now - state.lastRequestAt;
  const minGap = 5000;
  if (elapsed < minGap) {
    await sleep(minGap - elapsed);
  }
  writeFailureState({ ...state, lastRequestAt: Date.now() });
}

// Fetch with retry: up to 5 attempts, 60s delay between retries
// Returns { ok: Response } on success, { halt: true, reason } on 5 consecutive failures
async function fetchWithBackoff(url, options) {
  if (!backoffMode) {
    const res = await fetch(url, options);
    return { ok: res };
  }

  const MAX_RETRIES = 5;
  const RETRY_DELAY_MS = 60000;
  let lastError = '';

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    await enforceRateLimit();
    try {
      const res = await fetch(url, options);
      if (res.ok) {
        // Success — reset consecutive failure counter
        const state = readFailureState();
        writeFailureState({ ...state, consecutiveFailures: 0 });
        return { ok: res };
      }
      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = err.message;
    }

    if (attempt < MAX_RETRIES) {
      console.log(`  Retry ${attempt}/${MAX_RETRIES} in 60s... (${lastError})`);
      await sleep(RETRY_DELAY_MS);
    }
  }

  // All 5 retries failed — increment consecutive failure counter
  const state = readFailureState();
  const newCount = (state.consecutiveFailures || 0) + 1;
  writeFailureState({ ...state, consecutiveFailures: newCount });

  if (newCount >= 5) {
    return { halt: true, reason: `5 consecutive failures — last error: ${lastError}` };
  }

  return { failed: true, reason: lastError };
}

// ─── Arg parsing ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const flags = args.filter(a => a.startsWith('--'));
const positional = args.filter(a => !a.startsWith('--'));
const [serverArg, roleArg, ...modelParts] = positional;
const model = modelParts.join(' ');

if (!serverArg || !roleArg || !model) {
  console.error('Usage: node test-role.js <server:port> <role> <model> [flags]');
  console.error('Example: node test-role.js localhost:11434 router qwen3:8b');
  console.error('');
  console.error('Flags:');
  console.error('  --think             4x token budget for thinking models');
  console.error('  --no-save           Don\'t update models-catalog.json');
  console.error('  --test=<ID>         Run a specific test by ID');
  console.error('  --all               Run all tests for this role (skips already-completed)');
  console.error('  --list              List all test IDs');
  console.error('  --reset             Delete this model\'s test state file (full retest)');
  console.error('  --reset-role=<role> Clear only that role from state before running');
  console.error('  --backoff           5s rate limit + 60s retry x5 + halt on 5 consecutive failures');
  console.error('  --openai            Use OpenAI-compatible endpoint (llama.cpp)');
  console.error('');
  console.error('Roles: ' + Object.keys(ROLE_FIXTURES).join(', '));
  process.exit(1);
}

const server = serverArg.includes('://') ? serverArg : `http://${serverArg}`;
const role = roleArg.toLowerCase();
const thinkFlag = flags.includes('--think');
const noSave = flags.includes('--no-save');
const runAllTests = flags.includes('--all');
const openaiMode = flags.includes('--openai'); // llama.cpp uses OpenAI-compatible API
const backoffMode = flags.includes('--backoff'); // Rate limit + retry logic for slow/unreliable servers
const resetFlag = flags.includes('--reset');
const resetRoleFlag = flags.find(f => f.startsWith('--reset-role='));
const resetRole = resetRoleFlag ? resetRoleFlag.split('=')[1] : null;
const testIdFlag = flags.find(f => f.startsWith('--test='));
const specificTestId = testIdFlag ? testIdFlag.split('=')[1] : null;
const listTests = flags.includes('--list');

// ─── Validate role ────────────────────────────────────────────────────────────

if (SKIPPED_ROLES[role]) {
  console.log(`\n  Skipped: ${role} — ${SKIPPED_ROLES[role]}\n`);
  process.exit(0);
}

const roleTests = ROLE_FIXTURES[role];
if (!roleTests) {
  console.error(`Unknown role: "${role}"`);
  console.error('Available: ' + Object.keys(ROLE_FIXTURES).join(', '));
  process.exit(1);
}

// ─── --list ───────────────────────────────────────────────────────────────────

if (listTests) {
  console.log(`\n${role}: ${roleTests.length} tests\n`);
  roleTests.forEach((t, i) => {
    const wow = t.difficulty === 'wow' ? ' [WOW]' : '';
    console.log(`  ${(i + 1)}. ${t.id.padEnd(40)} ${t.name}${wow}`);
  });
  process.exit(0);
}

// ─── Handle reset flags ───────────────────────────────────────────────────────

if (resetFlag) {
  const deleted = resetTestState(model);
  console.log(deleted
    ? `Reset: deleted test state for ${model}`
    : `Reset: no existing state file for ${model}`);
}
if (resetRole) {
  const removed = resetRoleInState(model, resetRole);
  console.log(`Reset-role: cleared ${removed} tests for role "${resetRole}" from ${model} state`);
}

// ─── Select tests ─────────────────────────────────────────────────────────────

let testsToRun;
if (specificTestId) {
  const match = roleTests.find(t => t.id === specificTestId);
  if (!match) {
    console.error(`Test "${specificTestId}" not found. Use --list to see available.`);
    process.exit(1);
  }
  testsToRun = [match];
} else if (runAllTests) {
  testsToRun = [...roleTests];
} else {
  testsToRun = [roleTests[Math.floor(Math.random() * roleTests.length)]];
}

// Filter out tests already completed in the state file (only applies to --all and single random)
// --test=<ID> still forces that specific test to run (manual override for re-test)
if (!specificTestId) {
  const state = readTestState(model);
  const beforeCount = testsToRun.length;
  const completedKeys = new Set(Object.keys(state.completed || {}));
  testsToRun = testsToRun.filter((t, i) => {
    const key = t.id || `${role}-${i + 1}`;
    return !completedKeys.has(key);
  });
  const skipped = beforeCount - testsToRun.length;
  if (skipped > 0) {
    console.log(`\n═══ ${role} ═══ ${model}`);
    console.log(`${skipped} tests already completed — ${testsToRun.length} remaining to run`);
    if (testsToRun.length === 0) {
      console.log(`All ${beforeCount} tests already completed. Use --reset or --reset-role=${role} to retest.`);
      // Re-sync catalog from state in case it drifted (state has entries the catalog doesn't reflect).
      if (!noSave) {
        try {
          saveToCatalog([], null, 0, true);
          console.log('  (catalog re-synced from state)\n');
        } catch (e) {
          console.log(`  (catalog re-sync failed: ${e.message})\n`);
        }
      } else {
        console.log('');
      }
      process.exit(0);
    }
  }
}

// ─── Load system prompt ───────────────────────────────────────────────────────

const promptPath = path.join(__dirname, 'prompts', `${role}.md`);
let systemPrompt;
try {
  systemPrompt = fs.readFileSync(promptPath, 'utf-8');
} catch (err) {
  console.error(`Cannot read prompt: ${promptPath}`);
  process.exit(1);
}

// ─── /api/show (once per run) ─────────────────────────────────────────────────

async function getModelDetails() {
  try {
    const res = await fetch(`${server}/api/show`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, verbose: true })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const info = data.model_info || {};
    const det = data.details || {};
    const params = data.parameters || '';

    const get = (suffix) => {
      for (const [k, v] of Object.entries(info)) {
        if (k.endsWith('.' + suffix) || k === suffix) return v;
      }
      return null;
    };
    const parseParam = (name) => {
      const m = params.match(new RegExp(name + '\\s+([\\d.]+)'));
      return m ? parseFloat(m[1]) : null;
    };

    return {
      parameterSize: det.parameter_size || null,
      quantizationLevel: det.quantization_level || null,
      format: det.format || null,
      family: det.family || null,
      families: det.families || null,
      contextLength: get('context_length'),
      embeddingLength: get('embedding_length'),
      blockCount: get('block_count'),
      headCount: get('attention.head_count'),
      headCountKv: get('attention.head_count_kv'),
      keyLength: get('attention.key_length'),
      valueLength: get('attention.value_length'),
      vocabSize: get('vocab_size'),
      ropeFreqBase: get('rope.freq_base'),
      slidingWindow: get('attention.sliding_window'),
      defaultTemperature: parseParam('temperature'),
      defaultTopK: parseParam('top_k'),
      defaultTopP: parseParam('top_p'),
      capabilities: data.capabilities || null
    };
  } catch { return null; }
}

// ─── /api/ps ──────────────────────────────────────────────────────────────────

async function getProcessStats() {
  try {
    const res = await fetch(`${server}/api/ps`);
    if (!res.ok) return null;
    const data = await res.json();
    const m = data.models?.find(p => p.name === model || p.model === model);
    if (!m) return null;
    return {
      vramUsedGb: Math.round(m.size_vram / 1073741824 * 100) / 100,
      totalSizeGb: Math.round(m.size / 1073741824 * 100) / 100,
      gpuOffloadPercent: m.size > 0 ? Math.round(m.size_vram / m.size * 100) : 0,
      activeContextLength: m.context_length || null
    };
  } catch { return null; }
}

// ─── Defaults for missing fixture fields ──────────────────────────────────────

const ROLE_DEFAULTS = {
  router: { temperature: 0.1, maxTokens: 256 },
  orchestrator: { temperature: 0.3, maxTokens: 16000 },
  planner: { temperature: 0.5, maxTokens: 2000 },
  coder: { temperature: 0.4, maxTokens: 4000 },
  reviewer: { temperature: 0.2, maxTokens: 1000 },
  summarizer: { temperature: 0.6, maxTokens: 2000 },
  architect: { temperature: 0.5, maxTokens: 2000 },
  critic: { temperature: 0.5, maxTokens: 1000 },
  tester: { temperature: 0.3, maxTokens: 2000 },
  debugger: { temperature: 0.2, maxTokens: 1000 },
  researcher: { temperature: 0.5, maxTokens: 3000 },
  refactorer: { temperature: 0.3, maxTokens: 4000 },
  translator: { temperature: 0.3, maxTokens: 2000 },
  data_analyst: { temperature: 0.4, maxTokens: 3000 },
  preflight: { temperature: 0.2, maxTokens: 800 },
  postcheck: { temperature: 0.2, maxTokens: 600 },
  postmortem: { temperature: 0.3, maxTokens: 2000 }
};

function nameFromId(id) {
  const parts = id.replace(/^[^-]+-/, '').replace(/-/g, ' ');
  return parts.charAt(0).toUpperCase() + parts.slice(1);
}

// ─── Run a single test ────────────────────────────────────────────────────────

async function runTest(test, index, total) {
  const defaults = ROLE_DEFAULTS[role] || { temperature: 0.3, maxTokens: 2000 };
  const testId = test.id || `${role}-${index}`;
  const testName = test.name || (test.id ? nameFromId(test.id) : `Test ${index}`);
  const testTemp = test.temperature ?? defaults.temperature;
  const testMaxTokens = test.maxTokens ?? defaults.maxTokens;
  const testDifficulty = test.difficulty || ((testId + testName).toLowerCase().includes('wow') ? 'wow' : 'standard');

  const userMessage = `[MODE: ${role.toUpperCase()}]\n\n## Current Task\n${test.input}`;
  const maxTokens = thinkFlag ? Math.max(testMaxTokens * 4, 1024) : testMaxTokens;
  const isWow = testDifficulty === 'wow';
  const prefix = `[${index}/${total}]`;

  // Build request body for Ollama or OpenAI (llama.cpp) format
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  // Calculate required context: prompt tokens (rough: chars/4) + response tokens + safety margin
  const promptChars = systemPrompt.length + userMessage.length;
  const estimatedPromptTokens = Math.ceil(promptChars / 4);
  const requiredCtx = estimatedPromptTokens + maxTokens + 512; // 512 token safety margin
  // Round up to nearest power of 2 for better alignment (4096, 8192, 16384, 32768)
  const ctxSizes = [4096, 8192, 16384, 32768, 65536, 131072];
  const num_ctx = ctxSizes.find(s => s >= requiredCtx) || 131072;

  const requestBody = openaiMode
    ? { model, messages, stream: true, max_tokens: maxTokens, temperature: testTemp }
    : { model, messages, stream: true, options: { temperature: testTemp, num_predict: maxTokens, num_ctx } };

  const url = openaiMode ? `${server}/v1/chat/completions` : `${server}/api/chat`;
  const startTime = Date.now();
  let firstTokenTime = null;
  let firstContentTokenTime = null;
  let fullResponse = '';
  let thinkingResponse = '';
  let tokenCount = 0;
  let thinkingTokenCount = 0;
  let promptTokens = 0;
  let completionTokens = 0;
  let promptEvalDurationNs = 0;
  let evalDurationNs = 0;

  let response;
  const result = await fetchWithBackoff(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (result.halt) {
    console.log(`${prefix} ${testName.padEnd(35)} HALT — ${result.reason}`);
    console.log('\n*** 5 CONSECUTIVE FAILURES — STOPPING ALL TESTS ***\n');
    process.exit(2); // Exit code 2 signals halt
  }

  if (result.failed) {
    console.log(`${prefix} ${testName.padEnd(35)} ERROR (${result.reason}) — retried 5x`);
    return { testId: testId, name: testName, difficulty: testDifficulty, valid: false, reason: result.reason, tokensPerSec: 0, promptTokensPerSec: null, totalMs: 0, ttftMs: null, promptTokens: 0, completionTokens: 0, isThinkingModel: false, psStats: null, networkFailure: true };
  }

  response = result.ok;

  if (!response.ok) {
    const body = await response.text();
    console.log(`${prefix} ${testName.padEnd(35)} ERROR (HTTP ${response.status})`);
    return { testId: testId, name: testName, difficulty: testDifficulty, valid: false, reason: `HTTP ${response.status}`, tokensPerSec: 0, promptTokensPerSec: null, totalMs: 0, ttftMs: null, promptTokens: 0, completionTokens: 0, isThinkingModel: false, psStats: null, networkFailure: true };
  }

  // Stream response — Ollama uses NDJSON, OpenAI/llama.cpp uses SSE (data: {json})
  // Wrap in try/catch so broken streams (server crash mid-response) fail the test
  // gracefully instead of crashing the whole test-role.js process.
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let streamError = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        try {
          const jsonStr = openaiMode ? trimmed.replace(/^data:\s*/, '') : trimmed;
          const chunk = JSON.parse(jsonStr);
          openaiMode ? processOpenAIChunk(chunk) : processOllamaChunk(chunk);
        } catch {}
      }
    }
  } catch (err) {
    // Stream aborted/terminated/reset — capture the error but don't crash
    streamError = err.message || 'stream read error';
    console.log(`  [stream error: ${streamError}]`);
  }

  if (buffer.trim() && buffer.trim() !== 'data: [DONE]') {
    try {
      const jsonStr = openaiMode ? buffer.trim().replace(/^data:\s*/, '') : buffer.trim();
      const chunk = JSON.parse(jsonStr);
      openaiMode ? processOpenAIChunk(chunk) : processOllamaChunk(chunk);
    } catch {}
  }

  function processOllamaChunk(chunk) {
    if (chunk.message?.thinking) {
      if (firstTokenTime === null) firstTokenTime = Date.now();
      thinkingResponse += chunk.message.thinking;
      thinkingTokenCount++;
    }
    if (chunk.message?.content) {
      if (firstTokenTime === null) firstTokenTime = Date.now();
      if (firstContentTokenTime === null) firstContentTokenTime = Date.now();
      fullResponse += chunk.message.content;
      tokenCount++;
    }
    if (chunk.done) {
      promptTokens = chunk.prompt_eval_count ?? 0;
      completionTokens = chunk.eval_count ?? 0;
      promptEvalDurationNs = chunk.prompt_eval_duration ?? 0;
      evalDurationNs = chunk.eval_duration ?? 0;
    }
  }

  function processOpenAIChunk(chunk) {
    const delta = chunk.choices?.[0]?.delta;
    if (!delta) return;
    if (delta.content) {
      if (firstTokenTime === null) firstTokenTime = Date.now();
      if (firstContentTokenTime === null) firstContentTokenTime = Date.now();
      fullResponse += delta.content;
      tokenCount++;
    }
    // llama.cpp thinking support (if present)
    if (delta.reasoning_content) {
      if (firstTokenTime === null) firstTokenTime = Date.now();
      thinkingResponse += delta.reasoning_content;
      thinkingTokenCount++;
    }
    // Usage info in final chunk
    if (chunk.usage) {
      promptTokens = chunk.usage.prompt_tokens ?? 0;
      completionTokens = chunk.usage.completion_tokens ?? 0;
    }
  }

  const isThinkingModel = thinkingTokenCount > 0;
  const totalMs = Date.now() - startTime;
  const ttftMs = firstTokenTime ? firstTokenTime - startTime : null;
  const actualTokens = completionTokens || (tokenCount + thinkingTokenCount);
  const ollamaTokensPerSec = evalDurationNs > 0 && completionTokens > 0 ? (completionTokens / (evalDurationNs / 1e9)) : null;
  const wallTokensPerSec = totalMs > 0 ? (actualTokens / (totalMs / 1000)) : 0;
  const tokensPerSec = ollamaTokensPerSec || wallTokensPerSec;
  const promptTokensPerSec = promptEvalDurationNs > 0 && promptTokens > 0 ? (promptTokens / (promptEvalDurationNs / 1e9)) : null;

  // Validate using the test's own validator (wrapped so a buggy validator can't crash the run)
  let validResult;
  try {
    validResult = test.validate(fullResponse);
  } catch (err) {
    validResult = { valid: false, reason: 'validator threw: ' + err.message };
  }
  // Handle both {valid,reason} and {pass,reason} return shapes
  let passed = validResult.valid ?? validResult.pass ?? false;
  let reason = validResult.reason || '';

  // If stream errored AND we got no usable response, surface that as the failure reason
  // AND mark this as a network failure so it doesn't get persisted to state (retry on next run)
  let networkFailure = false;
  if (streamError && fullResponse.trim().length === 0) {
    passed = false;
    reason = 'stream terminated: ' + streamError;
    networkFailure = true;
  }

  let psStats = null;
  if (!openaiMode) {
    try { psStats = await getProcessStats(); } catch {}
  }

  // ─── Compact progress line ──────────────────────────────────────────

  const timeStr = (totalMs / 1000).toFixed(1) + 's';
  const tokStr = tokensPerSec.toFixed(0) + ' tok/s';
  const wowTag = isWow ? 'WOW: ' : '';
  const scoreChange = passed ? '+10' : '-10';
  const icon = passed ? `PASS ${scoreChange}` : `FAIL ${scoreChange}`;
  const failReason = passed ? '' : ` — ${reason}`;

  console.log(`${prefix} ${wowTag}${testName.padEnd(isWow ? 30 : 35)} ${icon}  (${timeStr}, ${tokStr})${failReason}`);

  return {
    testId: testId, name: testName, difficulty: testDifficulty,
    valid: passed, reason,
    tokensPerSec, promptTokensPerSec, totalMs, ttftMs,
    promptTokens, completionTokens: actualTokens,
    isThinkingModel, psStats, networkFailure
  };
}

// ─── Run all, display summary, save ───────────────────────────────────────────

async function runAll() {
  const modelDetails = openaiMode ? null : await getModelDetails();

  console.log(`\n═══ ${role} ═══ ${model}`);
  if (modelDetails) {
    console.log(`${modelDetails.parameterSize || '?'} ${modelDetails.quantizationLevel || '?'} | ctx:${modelDetails.contextLength || '?'} | ${(modelDetails.capabilities || []).join(', ')}`);
  }
  console.log('');

  const runStartTime = Date.now();
  const results = [];
  for (let i = 0; i < testsToRun.length; i++) {
    let result;
    try {
      result = await runTest(testsToRun[i], i + 1, testsToRun.length);
    } catch (err) {
      // Catch anything runTest didn't handle — count as a failure but keep going
      const test = testsToRun[i];
      const testId = test.id || `${role}-${i + 1}`;
      const testName = test.name || `Test ${i + 1}`;
      const testDifficulty = test.difficulty || 'standard';
      console.log(`[${i + 1}/${testsToRun.length}] ${testName.padEnd(35)} FAIL -10  (uncaught error) — ${err.message}`);
      result = {
        testId, name: testName, difficulty: testDifficulty,
        valid: false, reason: 'uncaught: ' + err.message,
        tokensPerSec: 0, promptTokensPerSec: null, totalMs: 0, ttftMs: null,
        promptTokens: 0, completionTokens: 0, isThinkingModel: false, psStats: null,
        networkFailure: true
      };
    }
    results.push(result);

    // Persist individual test result to the per-model state file,
    // EXCEPT when the failure was a network/server issue (404, 500, fetch failed,
    // stream terminated, uncaught error). Those get retried on next run — they never
    // reached the model so they don't count as legitimate completed tests.
    if (!noSave && !result.networkFailure) {
      try {
        markTestComplete(model, role, testsToRun[i], i, result, serverNameFromHost(server));
      } catch (stateErr) {
        console.log(`  [state persist failed: ${stateErr.message}]`);
      }
    } else if (result.networkFailure) {
      console.log(`  [network failure — not persisting to state, will retry on next run]`);
    }

    // Incremental catalog save: after each test, update aggregate roleScores from state
    if (!noSave && testsToRun.length > 1 && i < testsToRun.length - 1) {
      const partialRunMs = Date.now() - runStartTime;
      try {
        saveToCatalog(results, modelDetails, partialRunMs, true); // silent intermediate save
      } catch (saveErr) {
        console.log(`  [intermediate save failed: ${saveErr.message}]`);
      }
    }
  }
  const runTotalMs = Date.now() - runStartTime;

  // ─── Summary ────────────────────────────────────────────────────────
  // Show ROLE AGGREGATE (old state + new session) so resumed runs don't appear
  // to reset the score. Also show session-only delta for context.

  const sessPassed = results.filter(r => r.valid).length;
  const sessFailed = results.filter(r => !r.valid).length;
  const sessScore = (sessPassed * 10) - (sessFailed * 10);

  const state = readTestState(model);
  const roleStateEntries = Object.entries(state.completed || {}).filter(([, v]) => v.role === role);
  const aggPassed = roleStateEntries.filter(([, v]) => v.passed).length;
  const aggTotal = roleStateEntries.length;
  const aggFailed = aggTotal - aggPassed;
  const aggScore = (aggPassed * 10) - (aggFailed * 10);

  // WOW breakdown from state (authoritative across sessions)
  const roleFixtureForSummary = (ROLE_FIXTURES[role] || []);
  const wowIdsForSummary = new Set(
    roleFixtureForSummary
      .map((t, i) => ({ key: t.id || `${role}-${i + 1}`, difficulty: t.difficulty }))
      .filter(x => x.difficulty === 'wow')
      .map(x => x.key)
  );
  let aggWowPassed = 0, aggWowTotal = 0;
  for (const [key, v] of roleStateEntries) {
    if (wowIdsForSummary.has(key)) {
      aggWowTotal++;
      if (v.passed) aggWowPassed++;
    }
  }

  const sessTokSec = results.length > 0
    ? results.reduce((a, r) => a + r.tokensPerSec, 0) / results.length
    : 0;

  const resumed = aggTotal > results.length;
  const sessTag = resumed
    ? ` (this session: ${sessPassed}/${results.length}, ${sessScore > 0 ? '+' : ''}${sessScore})`
    : '';

  console.log(`\n═══ ${role}: ${aggPassed}/${aggTotal} passed | Score: ${aggScore > 0 ? '+' : ''}${aggScore} | WOW: ${aggWowPassed}/${aggWowTotal} | ${sessTokSec.toFixed(0)} tok/s | ${formatDuration(runTotalMs)}${sessTag} ═══`);

  // Save
  if (!noSave) {
    saveToCatalog(results, modelDetails, runTotalMs);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(ms) {
  if (ms < 1000) return ms + 'ms';
  const secs = Math.floor(ms / 1000);
  const mins = Math.floor(secs / 60);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) return `${hrs}h ${mins % 60}m ${secs % 60}s`;
  if (mins > 0) return `${mins}m ${secs % 60}s`;
  return `${secs}s`;
}

// ─── Save to catalog (REPLACE per role) ───────────────────────────────────────

function saveToCatalog(results, modelDetails, runTotalMs, silent) {
  // Filter out network-failure results BEFORE aggregation. Those represent tests
  // that never reached the model (404, 500, fetch failed, stream terminated).
  // They're exempt from the state file; they must also be exempt from the catalog
  // so a brand-new model hit against a dead server doesn't get falsely saved as -10.
  results = results.filter(r => !r.networkFailure);

  // Allow zero-result calls: the role's aggregate is read from the state file below,
  // so a re-sync pass (no new tests this session) still refreshes catalog from state.
  // We only abort if BOTH results AND state are empty — nothing to record at all.
  if (results.length === 0) {
    const s = readTestState(model);
    const hasStateForRole = Object.values(s.completed || {}).some(v => v.role === role);
    if (!hasStateForRole) return;
  }

  // Per-model file I/O: no shared catalog read/write = no cross-process contention.
  // Each process writes only its own model's file; the catalog is reassembled on demand
  // via assemble-catalog.js.
  if (!fs.existsSync(MODELS_DIR)) {
    try { fs.mkdirSync(MODELS_DIR, { recursive: true }); } catch {}
  }
  const modelPath = modelFilePath(model);

  // Load this model's file (if it exists), else start a blank entry.
  // We also read _meta from models-catalog.json for voteMin/voteMax if present.
  let entryFile = null;
  try {
    entryFile = JSON.parse(fs.readFileSync(modelPath, 'utf-8'));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.log(`  [MODEL FILE READ ERROR — skipping save] ${err.message}`);
      return;
    }
    entryFile = null;
  }

  // _meta fallback (voteIncrement/voteMin/voteMax). If catalog doesn't exist, use sane defaults.
  let catMeta = null;
  try { catMeta = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'))._meta || null; } catch {}
  // Build a shim "catalog" object so the rest of the function keeps working unchanged
  const catalog = { _meta: catMeta };
  if (entryFile) {
    // Strip bookkeeping field before passing to aggregation code
    const { __modelName, ...rest } = entryFile;
    catalog[model] = rest;
  }

  // Auto-register model if its per-model file doesn't exist
  if (!catalog[model]) {
    console.log(`  (new model "${model}" — creating per-model file)`);

    // Estimate VRAM from parameter size if available
    let estVram = null;
    if (modelDetails?.parameterSize) {
      const m = modelDetails.parameterSize.match(/([\d.]+)\s*[BbMm]/);
      if (m) {
        let p = parseFloat(m[1]);
        if (/[Mm]/.test(modelDetails.parameterSize) && p > 100) p = p / 1000;
        estVram = Math.round((p * 0.53 + 0.5 + p * 0.02) * 10) / 10;
      }
    }

    // Determine server name via servers.json map (falls back to host:port)
    const serverHost = server.replace(/^https?:\/\//, '');
    const serverName = serverNameFromHost(server);

    catalog[model] = {
      preferred_for: [],
      avoid_for: [],
      score: 0,
      runs: 0,
      lastBumpAt: 0,
      installed: true,
      parameterSize: modelDetails?.parameterSize || null,
      quantizationLevel: modelDetails?.quantizationLevel || null,
      format: modelDetails?.format || (openaiMode ? 'gguf' : null),
      family: modelDetails?.family || null,
      families: modelDetails?.families || null,
      estimatedVramGb: estVram,
      contextLength: modelDetails?.contextLength || null,
      sizeGb: null,
      capabilities: modelDetails?.capabilities || ['completion'],
      servers: [serverName],
      description: null,
      pullsNumeric: null,
      registryUrl: null,
      protocol: openaiMode ? 'openai' : 'ollama',
      // Note: raw host:port intentionally not persisted — server identity is
      // captured by the friendly-name `servers` array. Keeps the catalog free
      // of private IPs when shared.
      architecture: modelDetails ? {
        embeddingLength: modelDetails.embeddingLength,
        blockCount: modelDetails.blockCount,
        headCount: modelDetails.headCount,
        headCountKv: modelDetails.headCountKv,
        keyLength: modelDetails.keyLength,
        valueLength: modelDetails.valueLength,
        vocabSize: modelDetails.vocabSize,
        ropeFreqBase: modelDetails.ropeFreqBase,
        slidingWindow: modelDetails.slidingWindow,
        defaultTemperature: modelDetails.defaultTemperature,
        defaultTopK: modelDetails.defaultTopK,
        defaultTopP: modelDetails.defaultTopP
      } : {}
    };
  }

  const entry = catalog[model];

  const voteIncrement = catalog._meta?.voteIncrement ?? 1;
  const voteMax = catalog._meta?.voteMax ?? 1000000;
  const voteMin = catalog._meta?.voteMin ?? -1000000;

  // ─── Aggregate from state file, not just this session's results ─────
  // This way roleScores reflects the FULL history of tests for this role,
  // combining prior sessions with this one.
  const state = readTestState(model);
  const roleTestEntries = Object.entries(state.completed || {})
    .filter(([, v]) => v.role === role);

  // Fall back to this session's results if somehow state is empty (shouldn't happen)
  const useState = roleTestEntries.length > 0;

  const passedAll = useState
    ? roleTestEntries.filter(([, v]) => v.passed).length
    : results.filter(r => r.valid).length;
  const failedAll = useState
    ? roleTestEntries.filter(([, v]) => !v.passed).length
    : results.filter(r => !r.valid).length;
  const totalAll = useState ? roleTestEntries.length : results.length;
  const rawScore = (passedAll * 10) - (failedAll * 10);
  const roleScore = Math.max(voteMin, Math.min(voteMax, rawScore));

  // Averages: prefer state-file averages (broader sample) but fall back to session
  const tokSecs = useState
    ? roleTestEntries.map(([, v]) => v.tokSec || 0).filter(x => x > 0)
    : results.map(r => r.tokensPerSec).filter(x => x > 0);
  const avgTokSec = tokSecs.length
    ? Math.round(tokSecs.reduce((a, b) => a + b, 0) / tokSecs.length * 10) / 10
    : 0;

  const promptSpeeds = results.filter(r => r.promptTokensPerSec);
  const avgPromptTokSec = promptSpeeds.length > 0
    ? Math.round(promptSpeeds.reduce((a, r) => a + r.promptTokensPerSec, 0) / promptSpeeds.length * 10) / 10
    : null;

  const ttftMsList = useState
    ? roleTestEntries.map(([, v]) => v.ttftMs).filter(x => x !== null && x !== undefined)
    : results.map(r => r.ttftMs).filter(x => x !== null);
  const avgTtftMs = ttftMsList.length
    ? Math.round(ttftMsList.reduce((a, b) => a + b, 0) / ttftMsList.length)
    : null;

  const timeList = useState
    ? roleTestEntries.map(([, v]) => v.timeMs || 0)
    : results.map(r => r.totalMs);
  const avgTotalMs = timeList.length
    ? Math.round(timeList.reduce((a, b) => a + b, 0) / timeList.length)
    : 0;

  const lastPs = results.filter(r => r.psStats).pop()?.psStats || null;
  const isThinking = results.some(r => r.isThinkingModel);

  // WOW breakdown — need to look up difficulty from fixtures since state doesn't store it reliably
  const roleFixture = ROLE_FIXTURES[role] || [];
  const wowIds = new Set(
    roleFixture
      .map((t, i) => ({ key: t.id || `${role}-${i + 1}`, difficulty: t.difficulty }))
      .filter(x => x.difficulty === 'wow')
      .map(x => x.key)
  );
  let wowPassedCount = 0, wowTotal = 0;
  if (useState) {
    for (const [key, v] of roleTestEntries) {
      if (wowIds.has(key)) {
        wowTotal++;
        if (v.passed) wowPassedCount++;
      }
    }
  } else {
    const wowResults = results.filter(r => r.difficulty === 'wow');
    wowTotal = wowResults.length;
    wowPassedCount = wowResults.filter(r => r.valid).length;
  }

  if (!entry.roleScores) entry.roleScores = {};

  entry.roleScores[role] = {
    score: roleScore,
    passed: passedAll,
    failed: failedAll,
    total: totalAll,
    wowPassed: wowPassedCount,
    wowTotal,
    avgTokSec,
    avgPromptTokSec,
    avgTtftMs,
    avgTotalMs,
    runTotalMs,
    runTotalFormatted: formatDuration(runTotalMs),
    testedAt: new Date().toISOString(),
    // Store all tests from state (full history) not just this session
    tests: useState
      ? roleTestEntries.map(([id, v]) => ({
          id,
          name: v.name,
          difficulty: wowIds.has(id) ? 'wow' : (v.difficulty || 'standard'),
          passed: v.passed,
          reason: v.reason,
          tokSec: v.tokSec,
          timeMs: v.timeMs,
          time: formatDuration(v.timeMs),
          ttftMs: v.ttftMs,
          promptTokens: v.promptTokens,
          completionTokens: v.completionTokens,
          testedAt: v.testedAt,
          server: v.server
        }))
      : results.map(r => ({
          id: r.testId,
          name: r.name,
          difficulty: r.difficulty,
          passed: r.valid,
          reason: r.reason || null,
          tokSec: Math.round(r.tokensPerSec * 10) / 10,
          timeMs: r.totalMs,
          time: formatDuration(r.totalMs),
          ttftMs: r.ttftMs,
          promptTokens: r.promptTokens,
          completionTokens: r.completionTokens
        }))
  };

  // Model-level perf
  if (!entry.perf) entry.perf = {};
  // Guard against zero-result re-syncs overwriting real perf data with nulls
  if (avgTokSec > 0) entry.perf.tokPerSec = avgTokSec;
  if (avgPromptTokSec != null && avgPromptTokSec > 0) entry.perf.promptTokPerSec = avgPromptTokSec;
  if (results.length > 0) entry.perf.lastTestedAt = new Date().toISOString();
  if (lastPs) {
    entry.perf.actualVramGb = lastPs.vramUsedGb;
    entry.perf.gpuOffloadPercent = lastPs.gpuOffloadPercent;
    entry.perf.activeContextLength = lastPs.activeContextLength;
  }

  if (isThinking) entry.isThinkingModel = true;

  // Architecture from /api/show
  if (modelDetails) {
    entry.parameterSize = modelDetails.parameterSize ?? entry.parameterSize;
    entry.quantizationLevel = modelDetails.quantizationLevel ?? entry.quantizationLevel;
    entry.format = modelDetails.format ?? entry.format;
    entry.family = modelDetails.family ?? entry.family;
    entry.families = modelDetails.families ?? entry.families;
    entry.contextLength = modelDetails.contextLength ?? entry.contextLength;
    entry.capabilities = modelDetails.capabilities ?? entry.capabilities;

    if (!entry.architecture) entry.architecture = {};
    const a = entry.architecture;
    if (modelDetails.embeddingLength) a.embeddingLength = modelDetails.embeddingLength;
    if (modelDetails.blockCount) a.blockCount = modelDetails.blockCount;
    if (modelDetails.headCount) a.headCount = modelDetails.headCount;
    if (modelDetails.headCountKv != null) a.headCountKv = modelDetails.headCountKv;
    if (modelDetails.keyLength) a.keyLength = modelDetails.keyLength;
    if (modelDetails.valueLength) a.valueLength = modelDetails.valueLength;
    if (modelDetails.vocabSize) a.vocabSize = modelDetails.vocabSize;
    if (modelDetails.ropeFreqBase) a.ropeFreqBase = modelDetails.ropeFreqBase;
    if (modelDetails.slidingWindow) a.slidingWindow = modelDetails.slidingWindow;
    if (modelDetails.defaultTemperature != null) a.defaultTemperature = modelDetails.defaultTemperature;
    if (modelDetails.defaultTopK != null) a.defaultTopK = modelDetails.defaultTopK;
    if (modelDetails.defaultTopP != null) a.defaultTopP = modelDetails.defaultTopP;
  }

  // Derive preferred/avoid from all role scores
  const newPreferred = [];
  const newAvoided = [];
  for (const [r, data] of Object.entries(entry.roleScores)) {
    if (data.score > 0) newPreferred.push(r);
    else if (data.score < 0) newAvoided.push(r);
  }
  entry.preferred_for = newPreferred;
  entry.avoid_for = newAvoided;

  // Write per-model file. Since each process writes a different file, there's no
  // cross-process contention on the catalog. Atomic rename still protects against
  // self-interrupted writes (power loss / Ctrl+C mid-serialization).
  const outPayload = { __modelName: model, ...entry };
  const tmpPath = modelPath + '.tmp.' + process.pid + '.' + Date.now();
  let wrote = false;
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(outPayload, null, 2));

    const delays = [50, 150, 300, 600, 1200];
    let lastErr = null;
    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        fs.renameSync(tmpPath, modelPath);
        wrote = true;
        break;
      } catch (renameErr) {
        lastErr = renameErr;
        const retryable = renameErr.code === 'EPERM' || renameErr.code === 'EBUSY' || renameErr.code === 'EACCES';
        if (!retryable || attempt === delays.length) break;
        const until = Date.now() + delays[attempt];
        while (Date.now() < until) { /* spin */ }
      }
    }

    if (!wrote) {
      // Fallback: direct overwrite
      console.log(`  [rename failed (${lastErr?.code}); fallback direct write]`);
      fs.writeFileSync(modelPath, JSON.stringify(outPayload, null, 2));
      wrote = true;
      try { fs.unlinkSync(tmpPath); } catch {}
    }
  } catch (writeErr) {
    try { fs.unlinkSync(tmpPath); } catch {}
    console.log(`  [MODEL FILE WRITE ERROR] ${writeErr.message}`);
    return;
  }

  if (!silent) {
    console.log(`  Saved: ${model}/${role} score:${roleScore > 0 ? '+' : ''}${roleScore} (${passedAll}/${totalAll}) WOW:${wowPassedCount}/${wowTotal}`);
  }
}

runAll().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
