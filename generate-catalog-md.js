#!/usr/bin/env node
// generate-catalog-md.js — Produce a nicely-formatted CATALOG.md from models-catalog.json
//
// Output sections:
//   1. Summary / meta
//   2. Overall leaderboard (top models by total score)
//   3. Per-role top-10 tables (17 collapsible sections)
//   4. Per-VRAM-tier leaderboards (small / medium / large / huge)
//   5. Full score matrix (tested models only)
//
// Usage: node generate-catalog-md.js [--top N]
//   --top N    how many rows in the overall leaderboard (default 25)

const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, 'models-catalog.json');
const OUTPUT_PATH = path.join(__dirname, 'CATALOG.md');

const ROLES = ['router','orchestrator','planner','coder','reviewer','summarizer','architect','critic','tester','debugger','researcher','refactorer','translator','data_analyst','preflight','postcheck','postmortem'];

const topN = (() => {
  const i = process.argv.indexOf('--top');
  return i > 0 ? parseInt(process.argv[i + 1], 10) || 25 : 25;
})();

let catalog;
try {
  catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
} catch (e) {
  console.error('Cannot read models-catalog.json:', e.message);
  console.error('Run assemble-catalog.js first.');
  process.exit(1);
}

// ─── Collect tested models ─────────────────────────────────────────────────
const models = [];
for (const [name, entry] of Object.entries(catalog)) {
  if (name === '_meta') continue;
  if (!entry.roleScores || Object.keys(entry.roleScores).length === 0) continue;
  const rs = entry.roleScores;
  const totalScore = Object.values(rs).reduce((a, d) => a + (d.score || 0), 0);
  const totalPassed = Object.values(rs).reduce((a, d) => a + (d.passed || 0), 0);
  const totalTests = Object.values(rs).reduce((a, d) => a + (d.total || 0), 0);
  const wowPassed = Object.values(rs).reduce((a, d) => a + (d.wowPassed || 0), 0);
  const wowTotal = Object.values(rs).reduce((a, d) => a + (d.wowTotal || 0), 0);
  const rolesTested = Object.keys(rs).length;
  models.push({
    name,
    entry,
    totalScore,
    totalPassed,
    totalTests,
    wowPassed,
    wowTotal,
    rolesTested,
    avgPerRole: rolesTested > 0 ? (totalScore / rolesTested).toFixed(1) : '0',
    tokSec: entry.perf?.tokPerSec || null,
    params: entry.parameterSize || '?',
    quant: entry.quantizationLevel || '?',
    vram: entry.estimatedVramGb || entry.perf?.actualVramGb || null,
    servers: (entry.servers || []).join(', '),
    preferred: entry.preferred_for || [],
    avoid: entry.avoid_for || []
  });
}

// ─── Utility ───────────────────────────────────────────────────────────────
function fmt(n, sign = true) {
  if (n == null) return '—';
  if (typeof n !== 'number') return String(n);
  const s = sign && n > 0 ? '+' : '';
  return s + n;
}
function tok(n) { return n == null ? '—' : n.toFixed(0); }
function vram(n) { return n == null ? '—' : n + ' GB'; }

// Markdown-safe model name (escape pipes and angle brackets)
function mdName(n) { return String(n).replace(/\|/g, '\\|'); }

// Generate anchor ID for jump links
function anchor(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

// Parameter size → numeric (for VRAM tier classification). Returns billions of params.
function paramsB(p) {
  if (!p) return null;
  const m = String(p).match(/([\d.]+)\s*([BM])/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return m[2].toUpperCase() === 'M' ? n / 1000 : n;
}

function vramTier(m) {
  const v = m.vram || paramsB(m.params) * 0.6;
  if (v == null || isNaN(v)) return 'Unknown';
  if (v < 4) return 'Tiny (<4 GB)';
  if (v < 8) return 'Small (4–8 GB)';
  if (v < 16) return 'Medium (8–16 GB)';
  if (v < 32) return 'Large (16–32 GB)';
  return 'Huge (32 GB+)';
}

// ─── Build markdown ────────────────────────────────────────────────────────
let md = '';

md += '# TypeCast — Model Catalog\n\n';
md += '[![TypeCast](https://img.shields.io/badge/TypeCast-role--fit%20benchmark-blue)](./README.md)\n\n';
md += 'Benchmark results for local LLMs evaluated against 17 agent roles. ';
md += 'Each role has 10 tests (5 standard, 3 hard, 2 near-impossible). ';
md += 'Scoring: **+10 per pass, -10 per fail**; per-role range is -100 to +100.\n\n';
md += '> *Which role is each model typecast for? The top of each section answers it.*\n\n';

const meta = catalog._meta || {};
md += `> Last generated: ${new Date().toISOString()}  \n`;
md += `> Catalog generated: ${meta.generatedAt || 'unknown'}  \n`;
md += `> Total models in catalog: **${meta.modelCount || Object.keys(catalog).length - 1}**  \n`;
md += `> Tested (has role scores): **${models.length}**\n\n`;

md += '## Jump to\n\n';
md += '- [Overall Leaderboard](#overall-leaderboard)\n';
md += '- [By VRAM Tier](#by-vram-tier)\n';
md += '- [By Role](#by-role)\n';
md += '- [Full Score Matrix](#full-score-matrix)\n\n';

// ─── 1. Overall leaderboard ─────────────────────────────────────────────
md += '## Overall Leaderboard\n\n';
md += `Top **${topN}** tested models ranked by total score across all tested roles.\n\n`;
md += '| Rank | Model | Total Score | Avg/Role | Passed | WOW | Params | VRAM | Tok/s | Roles Tested |\n';
md += '|-----:|-------|------------:|---------:|:------:|:---:|:------:|-----:|------:|-------------:|\n';

const sorted = [...models].sort((a, b) => b.totalScore - a.totalScore);
for (let i = 0; i < Math.min(topN, sorted.length); i++) {
  const m = sorted[i];
  md += `| ${i + 1} | \`${mdName(m.name)}\` | **${fmt(m.totalScore)}** | ${m.avgPerRole} | ${m.totalPassed}/${m.totalTests} | ${m.wowPassed}/${m.wowTotal} | ${m.params} | ${vram(m.vram)} | ${tok(m.tokSec)} | ${m.rolesTested}/17 |\n`;
}
md += '\n';

// ─── 2. VRAM tiers ──────────────────────────────────────────────────────
md += '## By VRAM Tier\n\n';
md += 'Best models at each hardware size.\n\n';

const tiers = ['Tiny (<4 GB)', 'Small (4–8 GB)', 'Medium (8–16 GB)', 'Large (16–32 GB)', 'Huge (32 GB+)'];
for (const tier of tiers) {
  const inTier = models.filter(m => vramTier(m) === tier).sort((a, b) => b.totalScore - a.totalScore);
  if (inTier.length === 0) continue;
  md += `### ${tier}\n\n`;
  md += `${inTier.length} model${inTier.length === 1 ? '' : 's'} in this tier. Top 10 shown.\n\n`;
  md += '| Rank | Model | Score | Passed | WOW | Params | Tok/s |\n';
  md += '|-----:|-------|------:|:------:|:---:|:------:|------:|\n';
  for (let i = 0; i < Math.min(10, inTier.length); i++) {
    const m = inTier[i];
    md += `| ${i + 1} | \`${mdName(m.name)}\` | **${fmt(m.totalScore)}** | ${m.totalPassed}/${m.totalTests} | ${m.wowPassed}/${m.wowTotal} | ${m.params} | ${tok(m.tokSec)} |\n`;
  }
  md += '\n';
}

// ─── 3. By role ────────────────────────────────────────────────────────
md += '## By Role\n\n';
md += 'Best performers for each agent role. Click a role to expand.\n\n';

for (const role of ROLES) {
  const roleModels = models
    .filter(m => m.entry.roleScores?.[role])
    .map(m => ({
      name: m.name,
      score: m.entry.roleScores[role].score || 0,
      passed: m.entry.roleScores[role].passed || 0,
      total: m.entry.roleScores[role].total || 0,
      wowPassed: m.entry.roleScores[role].wowPassed || 0,
      wowTotal: m.entry.roleScores[role].wowTotal || 0,
      tokSec: m.entry.roleScores[role].avgTokSec || m.tokSec,
      params: m.params,
      vram: m.vram
    }))
    .sort((a, b) => b.score - a.score);

  if (roleModels.length === 0) continue;

  const passCount = roleModels.filter(m => m.score > 0).length;
  md += `<details>\n`;
  md += `<summary><b>${role}</b> — ${roleModels.length} tested, ${passCount} passing (score > 0)</summary>\n\n`;
  md += '| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |\n';
  md += '|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|\n';
  for (let i = 0; i < Math.min(10, roleModels.length); i++) {
    const m = roleModels[i];
    md += `| ${i + 1} | \`${mdName(m.name)}\` | **${fmt(m.score)}** | ${m.passed}/${m.total} | ${m.wowPassed}/${m.wowTotal} | ${m.params} | ${vram(m.vram)} | ${tok(m.tokSec)} |\n`;
  }
  md += '\n</details>\n\n';
}

// ─── 4. Full matrix ────────────────────────────────────────────────────
md += '## Full Score Matrix\n\n';
md += '<details>\n<summary>All tested models × all roles (scroll horizontally — click to expand)</summary>\n\n';

// Abbreviated role headers
const roleAbbrev = {
  router: 'rtr', orchestrator: 'orc', planner: 'pln', coder: 'cod',
  reviewer: 'rev', summarizer: 'sum', architect: 'arc', critic: 'crt',
  tester: 'tst', debugger: 'dbg', researcher: 'rsh', refactorer: 'rfc',
  translator: 'trn', data_analyst: 'dat', preflight: 'prf',
  postcheck: 'psc', postmortem: 'pst'
};

md += '| Model | Total |';
for (const r of ROLES) md += ` ${roleAbbrev[r]} |`;
md += '\n';
md += '|-------|------:|';
for (const _ of ROLES) md += '------:|';
md += '\n';

for (const m of sorted) {
  md += `| \`${mdName(m.name)}\` | **${fmt(m.totalScore)}** |`;
  for (const r of ROLES) {
    const rs = m.entry.roleScores?.[r];
    if (!rs) md += ' — |';
    else md += ` ${fmt(rs.score)} |`;
  }
  md += '\n';
}

md += '\n**Abbreviation key:** ';
md += Object.entries(roleAbbrev).map(([k, v]) => `\`${v}\` = ${k}`).join(', ');
md += '\n\n</details>\n\n';

// ─── 5. Footer ─────────────────────────────────────────────────────────
md += '---\n\n';
md += '*Raw data: [`models-catalog.json`](./models-catalog.json).*  \n';
md += '*Regenerate this file: `node generate-catalog-md.js` (or `generate-catalog-md.bat`).*\n';

// ─── Write ─────────────────────────────────────────────────────────────
fs.writeFileSync(OUTPUT_PATH, md);
console.log(`Wrote ${OUTPUT_PATH}`);
console.log(`  ${models.length} tested models`);
console.log(`  ${Object.values(roleAbbrev).length} roles`);
console.log(`  ${md.length.toLocaleString()} chars / ${md.split('\n').length} lines`);
