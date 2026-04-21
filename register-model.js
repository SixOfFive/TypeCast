#!/usr/bin/env node
// register-model.js — Pre-fetch model metadata from the server and write to catalog
// Runs BEFORE any tests so runtime architecture data is captured even if tests never complete
//
// Exports: registerModel(server, modelName, { openai }) — called from test-server.js
// CLI: node register-model.js <server:port> <model> [--openai]

const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, 'models-catalog.json');
const MODELS_DIR = path.join(__dirname, 'models');
function modelFilePath(name) {
  const safe = name.replace(/[:/]/g, '_').replace(/\s+/g, '_');
  return path.join(MODELS_DIR, safe + '.json');
}

// Server name map: loaded from servers.json if present (see servers.example.json).
// Falls back to using host:port as the friendly name when no config is provided.
let SERVER_MAP = null;
function loadServerMap() {
  if (SERVER_MAP !== null) return SERVER_MAP;
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'servers.json'), 'utf-8'));
    SERVER_MAP = {};
    for (const [k, v] of Object.entries(raw)) {
      if (!k.startsWith('_')) SERVER_MAP[k] = v;
    }
  } catch { SERVER_MAP = {}; }
  return SERVER_MAP;
}

// ─── Fetch helpers (with 10s timeout to avoid hanging on dead servers) ──────

const METADATA_TIMEOUT_MS = 10000;

async function fetchWithTimeout(url, options = {}, ms = METADATA_TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function fetchOllamaShow(serverUrl, model) {
  try {
    const res = await fetchWithTimeout(`${serverUrl}/api/show`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, verbose: true })
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function fetchOllamaTags(serverUrl) {
  try {
    const res = await fetchWithTimeout(`${serverUrl}/api/tags`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function fetchOllamaPs(serverUrl, model) {
  try {
    const res = await fetchWithTimeout(`${serverUrl}/api/ps`);
    if (!res.ok) return null;
    const data = await res.json();
    return (data.models || []).find(m => m.name === model || m.model === model) || null;
  } catch { return null; }
}

async function fetchOpenAIModels(serverUrl) {
  try {
    const res = await fetchWithTimeout(`${serverUrl}/v1/models`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function fetchLlamaCppProps(serverUrl) {
  try {
    const res = await fetchWithTimeout(`${serverUrl}/props`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function fetchLlamaCppSlots(serverUrl) {
  try {
    const res = await fetchWithTimeout(`${serverUrl}/slots`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// ─── Metadata extractors ──────────────────────────────────────────────────────

function extractOllamaDetails(show, tagInfo, psInfo) {
  if (!show) return null;
  const info = show.model_info || {};
  const det = show.details || {};
  const params = show.parameters || '';

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

  // VRAM estimate from params + quant
  let estVram = null;
  const paramSize = det.parameter_size || null;
  const quant = det.quantization_level || 'Q4_0';
  if (paramSize) {
    const m = paramSize.match(/([\d.]+)\s*[BbMm]/);
    if (m) {
      let p = parseFloat(m[1]);
      if (/[Mm]/.test(paramSize) && p > 100) p = p / 1000;
      const quantMap = { 'Q2_K': 0.3125, 'Q3_K_S': 0.375, 'Q3_K_M': 0.40625, 'Q3_K_L': 0.4375, 'Q4_0': 0.5, 'Q4_K_S': 0.5, 'Q4_K_M': 0.53125, 'Q5_0': 0.625, 'Q5_K_M': 0.65625, 'Q6_K': 0.75, 'Q8_0': 1.0, 'F16': 2.0, 'F32': 4.0 };
      const bpp = quantMap[quant.toUpperCase()] || 0.5;
      estVram = Math.round((p * bpp + 0.5 + p * 0.02) * 10) / 10;
    }
  }

  return {
    parameterSize: paramSize,
    quantizationLevel: quant,
    format: det.format || 'gguf',
    family: det.family || null,
    families: det.families || null,
    parentModel: det.parent_model || null,
    contextLength: get('context_length'),
    capabilities: show.capabilities || null,
    sizeGb: tagInfo?.size ? Math.round(tagInfo.size / 1073741824 * 100) / 100 : null,
    sizeBytes: tagInfo?.size || null,
    digest: tagInfo?.digest || null,
    modifiedAt: tagInfo?.modified_at || null,
    estimatedVramGb: estVram,
    architecture: {
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
      defaultTopP: parseParam('top_p')
    },
    perf: psInfo ? {
      actualVramGb: Math.round(psInfo.size_vram / 1073741824 * 100) / 100,
      gpuOffloadPercent: psInfo.size > 0 ? Math.round(psInfo.size_vram / psInfo.size * 100) : 0,
      activeContextLength: psInfo.context_length || null
    } : null
  };
}

function extractLlamaCppDetails(modelsData, props, slots) {
  if (!modelsData) return null;
  const data = (modelsData.data || [])[0] || (modelsData.models || [])[0] || {};
  const meta = data.meta || {};

  // File size from meta.size
  const sizeBytes = meta.size || null;
  const sizeGb = sizeBytes ? Math.round(sizeBytes / 1073741824 * 100) / 100 : null;

  // Guess parameter size from meta.n_params
  let parameterSize = null;
  if (meta.n_params) {
    const b = meta.n_params / 1e9;
    parameterSize = b >= 1 ? b.toFixed(1) + 'B' : (meta.n_params / 1e6).toFixed(0) + 'M';
  }

  // Runtime context from slots (actual allocated)
  const activeCtx = (slots && slots[0]?.n_ctx) || null;

  // Parameters from props default_generation_settings
  const genSettings = props?.default_generation_settings?.params || {};

  return {
    parameterSize,
    quantizationLevel: null, // llama.cpp doesn't expose this directly; could parse from filename
    format: 'gguf',
    family: null,
    families: null,
    parentModel: null,
    contextLength: meta.n_ctx_train || null,
    activeContextLength: activeCtx,
    capabilities: data.capabilities || ['completion'],
    sizeGb,
    sizeBytes,
    totalParams: meta.n_params || null,
    estimatedVramGb: null, // depends on om3n hardware, not our GPUs
    architecture: {
      embeddingLength: meta.n_embd || null,
      vocabSize: meta.n_vocab || null,
      vocabType: meta.vocab_type || null,
      blockCount: null,
      headCount: null,
      headCountKv: null,
      defaultTemperature: genSettings.temperature || null,
      defaultTopK: genSettings.top_k || null,
      defaultTopP: genSettings.top_p || null,
      defaultMinP: genSettings.min_p || null,
      chatFormat: genSettings.chat_format || null,
      reasoningFormat: genSettings.reasoning_format || null
    },
    totalSlots: props?.total_slots || null
  };
}

// Try to parse quantization from filename (llama.cpp)
function guessQuantFromFilename(name) {
  const m = name.match(/Q\d+_K_[XSML]+|Q\d+_[KM01]|IQ\d+_[XSM]+|F16|F32|BF16/i);
  return m ? m[0].toUpperCase() : null;
}

// Try to parse family from filename
function guessFamilyFromFilename(name) {
  const lower = name.toLowerCase();
  if (lower.includes('qwen')) return 'qwen';
  if (lower.includes('llama')) return 'llama';
  if (lower.includes('gemma')) return 'gemma';
  if (lower.includes('mistral')) return 'mistral';
  if (lower.includes('phi')) return 'phi';
  if (lower.includes('deepseek')) return 'deepseek';
  if (lower.includes('minimax')) return 'minimax';
  if (lower.includes('scout')) return 'llama4';
  return null;
}

// ─── Main registration function ───────────────────────────────────────────────

async function registerModel(server, modelName, options = {}) {
  const { openai = false, verbose = true } = options;
  const serverUrl = server.includes('://') ? server : `http://${server}`;
  const serverHost = serverUrl.replace(/^https?:\/\//, '');
  const serverName = loadServerMap()[serverHost] || serverHost;

  if (verbose) console.log(`  Registering ${modelName} on ${serverName}...`);

  // Per-model file I/O. Each process writes only its own model file = no contention.
  if (!fs.existsSync(MODELS_DIR)) {
    try { fs.mkdirSync(MODELS_DIR, { recursive: true }); } catch {}
  }
  const modelPath = modelFilePath(modelName);
  let existingEntry = null;
  try {
    const raw = JSON.parse(fs.readFileSync(modelPath, 'utf-8'));
    const { __modelName, ...rest } = raw;
    existingEntry = rest;
  } catch { existingEntry = null; }
  // Shim catalog for the rest of this function's logic
  const catalog = {};
  if (existingEntry) catalog[modelName] = existingEntry;

  // Fetch metadata based on protocol
  let details = null;
  if (openai) {
    const [modelsData, props, slots] = await Promise.all([
      fetchOpenAIModels(serverUrl),
      fetchLlamaCppProps(serverUrl),
      fetchLlamaCppSlots(serverUrl)
    ]);
    details = extractLlamaCppDetails(modelsData, props, slots);
    // Fill in family/quant from filename since llama.cpp doesn't expose them
    if (details) {
      details.family = details.family || guessFamilyFromFilename(modelName);
      details.quantizationLevel = details.quantizationLevel || guessQuantFromFilename(modelName);
    }
  } else {
    const [show, tags, psInfo] = await Promise.all([
      fetchOllamaShow(serverUrl, modelName),
      fetchOllamaTags(serverUrl),
      fetchOllamaPs(serverUrl, modelName)
    ]);
    const tagInfo = tags?.models?.find(m => m.name === modelName);
    details = extractOllamaDetails(show, tagInfo, psInfo);
  }

  if (!details) {
    if (verbose) console.log(`  WARN: Could not fetch details for ${modelName}`);
    details = { architecture: {} };
  }

  // Preserve existing test results
  const existing = catalog[modelName] || {};
  const preserveFields = ['preferred_for', 'avoid_for', 'score', 'runs', 'lastBumpAt', 'roleScores', 'isThinkingModel'];
  const preserved = {};
  for (const f of preserveFields) {
    if (existing[f] !== undefined) preserved[f] = existing[f];
  }

  // Merge: existing roleScores/perf are preserved, everything else is refreshed from server
  const merged = {
    preferred_for: preserved.preferred_for || [],
    avoid_for: preserved.avoid_for || [],
    score: preserved.score || 0,
    runs: preserved.runs || 0,
    lastBumpAt: preserved.lastBumpAt || 0,
    ...(preserved.roleScores ? { roleScores: preserved.roleScores } : {}),
    ...(preserved.isThinkingModel ? { isThinkingModel: true } : {}),

    installed: true,
    parameterSize: details.parameterSize,
    quantizationLevel: details.quantizationLevel,
    format: details.format,
    family: details.family,
    families: details.families,
    parentModel: details.parentModel,
    contextLength: details.contextLength,
    activeContextLength: details.activeContextLength,
    capabilities: details.capabilities,
    sizeGb: details.sizeGb,
    sizeBytes: details.sizeBytes,
    totalParams: details.totalParams,
    digest: details.digest,
    modifiedAt: details.modifiedAt,
    estimatedVramGb: details.estimatedVramGb,
    servers: Array.from(new Set([...(existing.servers || []), serverName])),
    protocol: openai ? 'openai' : 'ollama',
    // Raw host:port not persisted — server identity lives in the `servers` array
    // via the friendly names from servers.json. Keeps shared catalogs IP-free.
    architecture: { ...(existing.architecture || {}), ...details.architecture },

    registeredAt: new Date().toISOString(),
    description: existing.description || null,
    pullsNumeric: existing.pullsNumeric || null,
    registryUrl: existing.registryUrl || null
  };

  // Merge perf (update VRAM but don't clobber tok/s history)
  if (details.perf || existing.perf) {
    merged.perf = { ...(existing.perf || {}), ...(details.perf || {}) };
  }

  catalog[modelName] = merged;

  // Write per-model file (atomic rename with retry + fallback).
  const outPayload = { __modelName: modelName, ...merged };
  const tmpPath = modelPath + '.tmp.' + process.pid + '.' + Date.now();
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(outPayload, null, 2));
    const delays = [50, 150, 300, 600, 1200];
    let renamed = false, lastErr = null;
    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        fs.renameSync(tmpPath, modelPath);
        renamed = true;
        break;
      } catch (renameErr) {
        lastErr = renameErr;
        const retryable = renameErr.code === 'EPERM' || renameErr.code === 'EBUSY' || renameErr.code === 'EACCES';
        if (!retryable || attempt === delays.length) break;
        const until = Date.now() + delays[attempt];
        while (Date.now() < until) { /* spin */ }
      }
    }
    if (!renamed) {
      fs.writeFileSync(modelPath, JSON.stringify(outPayload, null, 2));
      try { fs.unlinkSync(tmpPath); } catch {}
      if (verbose) console.log(`  (rename failed: ${lastErr?.code}; used direct write)`);
    }
  } catch (writeErr) {
    try { fs.unlinkSync(tmpPath); } catch {}
    throw writeErr;
  }

  if (verbose) {
    console.log(`  Registered: ${modelName}`);
    if (details.parameterSize) console.log(`    params: ${details.parameterSize}`);
    if (details.quantizationLevel) console.log(`    quant:  ${details.quantizationLevel}`);
    if (details.sizeGb) console.log(`    size:   ${details.sizeGb} GB`);
    if (details.contextLength) console.log(`    ctx:    ${details.contextLength} train, ${details.activeContextLength || '?'} runtime`);
    if (details.architecture?.embeddingLength) console.log(`    embed:  ${details.architecture.embeddingLength}`);
    if (details.totalParams) console.log(`    params: ${details.totalParams.toLocaleString()} raw`);
  }

  return merged;
}

module.exports = { registerModel };

// ─── CLI usage ────────────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);
  const flags = args.filter(a => a.startsWith('--'));
  const positional = args.filter(a => !a.startsWith('--'));
  const [server, model] = positional;
  const openai = flags.includes('--openai');

  if (!server || !model) {
    console.error('Usage: node register-model.js <server:port> <model> [--openai]');
    process.exit(1);
  }

  registerModel(server, model, { openai }).catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
  });
}
