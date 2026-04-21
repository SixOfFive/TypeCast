#!/usr/bin/env node
// assemble-catalog.js — Merge per-model JSON files into models-catalog.json
//
// Architecture: test-role.js and register-model.js write one file per model under
// models/<safeName>.json. This script assembles them into the single
// models-catalog.json that downstream consumers (your agent framework) read.
//
// Rationale: per-model files eliminate catalog write contention entirely — each
// test process writes its own file, never touching the catalog directly.
//
// Usage: node assemble-catalog.js

const fs = require('fs');
const path = require('path');

const MODELS_DIR = path.join(__dirname, 'models');
const CATALOG_PATH = path.join(__dirname, 'models-catalog.json');

function safeModelName(n) { return n.replace(/[:/]/g, '_').replace(/\s+/g, '_'); }

// Ensure models dir exists
if (!fs.existsSync(MODELS_DIR)) {
  console.error(`Missing models directory: ${MODELS_DIR}`);
  console.error('Run tests first (test-role.js / register-model.js) or migrate-to-models-dir.js.');
  process.exit(1);
}

// Preserve the existing _meta block if any (registry sources, localServers, voteIncrement, etc.)
let meta = null;
try {
  const existing = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
  meta = existing._meta || null;
} catch {
  // no existing catalog — build fresh _meta
}

if (!meta) {
  meta = {
    description: 'Master model catalog: assembled from per-model JSON files in models/',
    generatedAt: new Date().toISOString(),
    voteIncrement: 1,
    voteMax: 1000000,
    voteMin: -1000000,
    modelCount: 0
  };
}

// Read every per-model file
const files = fs.readdirSync(MODELS_DIR).filter(f => f.endsWith('.json'));
const catalog = {};

let loaded = 0, skipped = 0, errors = [];
for (const f of files) {
  const fp = path.join(MODELS_DIR, f);
  try {
    const entry = JSON.parse(fs.readFileSync(fp, 'utf-8'));
    if (!entry || !entry.__modelName) {
      // Accept entries without __modelName by deriving from filename (reverse-safeName isn't perfect
      // so we require __modelName on every per-model file going forward)
      errors.push(`${f}: missing __modelName field`);
      skipped++;
      continue;
    }
    const name = entry.__modelName;
    // Strip the internal bookkeeping field before writing to catalog
    const clean = { ...entry };
    delete clean.__modelName;
    catalog[name] = clean;
    loaded++;
  } catch (err) {
    errors.push(`${f}: ${err.message}`);
    skipped++;
  }
}

// Update meta and assemble
meta.modelCount = loaded;
meta.generatedAt = new Date().toISOString();

const assembled = { _meta: meta, ...catalog };

// Write catalog atomically (same pattern as test-role.js)
const tmp = CATALOG_PATH + '.tmp.' + process.pid + '.' + Date.now();
fs.writeFileSync(tmp, JSON.stringify(assembled, null, 2));

const delays = [50, 150, 300, 600, 1200];
let renamed = false, lastErr = null;
for (let i = 0; i <= delays.length; i++) {
  try { fs.renameSync(tmp, CATALOG_PATH); renamed = true; break; }
  catch (e) {
    lastErr = e;
    if (!['EPERM', 'EBUSY', 'EACCES'].includes(e.code) || i === delays.length) break;
    const until = Date.now() + delays[i];
    while (Date.now() < until) { /* spin */ }
  }
}
if (!renamed) {
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(assembled, null, 2));
  try { fs.unlinkSync(tmp); } catch {}
  console.log(`(rename failed ${lastErr?.code}; used direct write)`);
}

console.log(`Assembled models-catalog.json — ${loaded} models${skipped ? ', ' + skipped + ' skipped' : ''}`);
if (errors.length) {
  console.log('Errors:');
  for (const e of errors) console.log('  ' + e);
}
