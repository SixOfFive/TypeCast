#!/usr/bin/env node
// assemble-catalogs-by-vram.js — Split models-catalog.json into per-VRAM-bucket files.
//
// For each bucket B in {6, 12, 16, 24, 32, 64, 96, 128, 160, 192} GB, writes
// models-catalog-<B>gb.json containing every model whose memory footprint <= B GB.
//
// Memory footprint = max(perf.actualVramGb, estimatedVramGb, sizeGb).
// Using the max means we never under-bucket: if any signal says a model is big,
// we trust it and exclude it from smaller buckets.
//
// Run after assemble-catalog.js (publish.bat does this automatically).
// Usage: node assemble-catalogs-by-vram.js

const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, 'models-catalog.json');
const BUCKETS = [6, 12, 16, 24, 32, 64, 96, 128, 160, 192];

if (!fs.existsSync(CATALOG_PATH)) {
  console.error(`Missing ${CATALOG_PATH} — run assemble-catalog.js first.`);
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
const { _meta, ...models } = catalog;

function footprintGb(entry) {
  const candidates = [
    entry?.perf?.actualVramGb,
    entry?.estimatedVramGb,
    entry?.sizeGb,
  ].filter(v => typeof v === 'number' && Number.isFinite(v) && v > 0);
  return candidates.length ? Math.max(...candidates) : null;
}

// Annotate every model with its computed footprint for transparency
const ranked = Object.entries(models).map(([name, m]) => {
  const fp = footprintGb(m);
  return { name, model: m, footprintGb: fp };
});

// Write one file per bucket
for (const bucket of BUCKETS) {
  const out = {};
  let included = 0, skippedNoData = 0;
  for (const { name, model, footprintGb: fp } of ranked) {
    if (fp == null) { skippedNoData++; continue; }
    if (fp <= bucket) { out[name] = model; included++; }
  }

  const bucketMeta = {
    description: `Subset of models-catalog.json containing models with memory footprint <= ${bucket} GB.`,
    bucketGb: bucket,
    footprintSource: 'max(perf.actualVramGb, estimatedVramGb, sizeGb)',
    generatedAt: new Date().toISOString(),
    modelCount: included,
    skippedNoFootprintData: skippedNoData,
    parentCatalog: 'models-catalog.json',
  };

  const assembled = { _meta: bucketMeta, ...out };
  const outPath = path.join(__dirname, `models-catalog-${bucket}gb.json`);
  fs.writeFileSync(outPath, JSON.stringify(assembled, null, 2));
  console.log(`  models-catalog-${bucket}gb.json — ${included} models (${skippedNoData} missing footprint data)`);
}

console.log(`Generated ${BUCKETS.length} bucketed catalogs.`);
