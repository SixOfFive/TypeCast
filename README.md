# TypeCast

**A role-fit benchmark for local LLMs.** Each model auditions for 17 agent roles; per-role scoring reveals which role the model is typecast for — and which it shouldn't play.

Works with **Ollama** and **llama.cpp**. Tests are inline-validated (not LLM-as-judge) so scores are reproducible and comparable across models.

**→ [See the latest leaderboard in CATALOG.md](./CATALOG.md)**

The 17 roles auditioned: router, orchestrator, planner, coder, reviewer, summarizer, architect, critic, tester, debugger, researcher, refactorer, translator, data_analyst, preflight, postcheck, postmortem.

TypeCast answers three questions about any local model:

- Which roles is it actually good at?
- Which roles should it never be assigned to?
- How does it compare against other local models on the same tasks?

## What it tests

Every model runs through the same fixed test suite per role. Each role has 10 precision tests:

- **5 standard tests** — core competency and applied skill for the role
- **3 wow tests** — trickier cases that trip up smaller models
- **2 near-impossible tests** — frontier-level challenges where even large models typically fail

Tests are not "LLM-as-a-judge" — they use inline validators that check output format, required content, and correctness against a known answer. Pass = **+10**, fail = **-10**, per-role aggregate score ranges from **-100 to +100**.

Role-specific checks include:

- JSON schema compliance (router, orchestrator, preflight, postcheck, postmortem)
- Code completeness and absence of placeholders (coder, tester, refactorer)
- Source citations (researcher)
- Format discipline (translator must return only the translation, architect must not write code, etc.)
- Edge-case and adversarial reasoning (designed wow tests)

Thinking-model behavior (models that emit reasoning tokens before answers) is handled transparently so the comparison is fair across reasoning and non-reasoning models.

## Supported protocols

- **Ollama** (native `/api/chat` streaming)
- **llama.cpp** (OpenAI-compatible `/v1/chat/completions` SSE via `--openai` flag)

Both protocols are fed the same prompts and validated the same way.

## The catalog — `models-catalog.json`

The primary output of this project. A single JSON file containing one entry per tested model with:

### Identification
- Model name, family, parameter size, quantization level
- Format (gguf), protocol (ollama / openai)
- Which server(s) the model has been seen on

### Architecture
- Context length (trained + active)
- Embedding length, block count, head count, KV head count
- Vocab size, RoPE frequency base, sliding window
- Model's own default temperature / top-k / top-p

### Hardware footprint
- Estimated VRAM (calculated from parameter size and quantization)
- Actual VRAM and GPU offload percentage from the last run
- File size on disk

### Performance
- Tokens per second (generation)
- Prompt tokens per second (prefill)
- Time-to-first-token
- Total average time per test

### Role scores — the core data
For each role that's been tested:
- `score` — aggregate (-100 to +100)
- `passed` / `failed` / `total` — raw counts across all 10 tests
- `wowPassed` / `wowTotal` — how many hard tests were passed
- Per-test detail array with pass/fail reason, timing, token speed, difficulty tier
- Average tokens/sec for the role specifically

### Derived recommendations
- `preferred_for` — roles where the model scored above zero (safe to assign)
- `avoid_for` — roles where the model scored below zero (do not assign)

### Registry metadata
For models pulled from ollama.com/library — description, pull count, registry URL, capabilities list.

## How the catalog is kept current

Test results land in per-model JSON files under `models/` as tests complete. This isolates writes so many tests can run simultaneously without collisions.

Two commands to produce the outputs:

```bash
# Merge all per-model files into models-catalog.json
node assemble-catalog.js        # or: assemble-catalog.bat

# Produce the human-readable CATALOG.md (leaderboards + full score matrix)
node generate-catalog-md.js     # or: generate-catalog-md.bat
```

Both are lightweight — run them whenever you want an up-to-date snapshot. `CATALOG.md` is the file you share/browse on GitHub; `models-catalog.json` is what downstream code consumes.

## Requirements

- **Node.js 18+** (for native `fetch` support). No npm install needed — the test harness uses only Node built-ins.
- An Ollama or llama.cpp server reachable over HTTP with at least one model loaded.

## Platform support

The test harness is **fully cross-platform** — every core script (`test-role.js`, `test-server.js`, `register-model.js`, `assemble-catalog.js`, `generate-catalog-md.js`) runs on Windows, macOS, and Linux without modification.

The `.bat` files are **Windows-only convenience wrappers** around the underlying Node commands. They're handy for chaining per-model test runs and for users who prefer double-clicking over the terminal.

**macOS / Linux users:** skip the batch files and run the `node` commands directly (every command in this README shows both forms). You can trivially write the equivalent shell script if you want chained runs:

```bash
#!/usr/bin/env bash
# your-model.sh — rough shell equivalent of example-model.bat
MODEL="qwen3:8b"
HOST="${1:-localhost:11434}"
for role in router orchestrator planner coder reviewer summarizer architect \
            critic tester debugger researcher refactorer translator \
            data_analyst preflight postcheck postmortem; do
  node test-role.js "$HOST" "$role" "$MODEL" --all
done
```

**Windows users:** the `.bat` wrappers work out of the box. Note that on recent Windows patched for BatBadBut (CVE-2024), any `call` inside a master batch **must** prefix `.\` — e.g. `call .\qwen3_8b.bat localhost:11434`. Without `.\`, cmd.exe silently reports "not recognized". The bundled master batches use `.\` already.

## Getting started

```bash
# 1. Configure your servers (host:port → friendly name).
cp servers.example.json servers.json
# edit servers.json to list your Ollama / llama.cpp endpoints

# 2. Run tests. Two options:

# Option A — auto-discover whatever model is loaded on a server and test all 17 roles:
node test-server.js localhost:11434

# Option B — test a specific model/role combo:
node test-role.js localhost:11434 router qwen3:8b --all

# 3. Assemble + render the outputs.
node assemble-catalog.js       # produces models-catalog.json
node generate-catalog-md.js    # produces CATALOG.md
```

**Windows users** can also use the included `.bat` wrappers:
```batch
copy example-model.bat qwen3_8b.bat
REM edit qwen3_8b.bat — set MODEL=qwen3:8b
qwen3_8b.bat localhost:11434
assemble-catalog.bat
generate-catalog-md.bat
```

Running many models? Either chain per-model batches in a master `.bat` (one `call .\<name>.bat host:port` per line), or point `test-server.js` at a server — it auto-discovers the loaded model and runs all 17 roles, skipping anything already in state.

> **Note on Windows batch calling:** recent Windows patches removed the current directory from cmd.exe's default batch-file search path. Always prefix `call` with `.\` — e.g. `call .\qwen3_8b.bat`. Without it, `call "qwen3_8b.bat"` silently reports "not recognized" and keeps going.

## Running tests

```bash
# Test one role of one model
node test-role.js <host:port> <role> <model> --all

# Test all 17 roles of whatever model is loaded on a server
node test-server.js <host:port>

# For llama.cpp servers
node test-server.js <host:port> --openai --force --backoff
```

Useful flags:

- `--all` — run every test for the role (skips tests already completed in prior sessions)
- `--reset` — wipe this model's state file and retest from scratch
- `--reset-role=<role>` — wipe just one role's state
- `--test=<id>` — run one specific test, bypassing the completion filter
- `--openai` — use the OpenAI-compatible endpoint (for llama.cpp)
- `--backoff` — rate-limit requests, retry on transient failures, halt after repeated failures (useful for flaky remote servers)
- `--force` — attempt every role regardless of completion state (individual completed tests still skip)

## State tracking and resumability

Every completed test is recorded per-model. Interrupted runs resume from the exact next test when rerun — no test is ever run twice unnecessarily.

Network failures (server 500s, dropped connections, timeouts) are treated as "the test never happened" and will auto-retry on the next run. Only legitimate model responses count toward the score.

Because state is per-model (not per-server), a model tested on one GPU is considered tested everywhere — the catalog reflects the model's capability, not its speed on a particular machine (speed is recorded separately in the `perf` fields).

## Score semantics

- **Positive score:** model can be trusted for this role. The higher, the better.
- **Zero:** neutral — passed exactly as many tests as it failed. Usable but not great.
- **Negative score:** the model will produce wrong output often enough that it's not safe for this role.

Scores are always comparable across models because every model faces the exact same 170 tests (17 roles × 10 tests). A model scoring +80 on `coder` beats a model scoring +40 on `coder` on the same workload.

## Agent role reference

| Role | What it does |
|---|---|
| router | Classifies user intent (chat / question / code / research / project) |
| orchestrator | The controller that decides each iteration's next action |
| planner | Breaks a request into ordered subtasks |
| architect | Produces a design/vision document (no code) |
| critic | Adversarial review of a plan |
| coder | Writes production-quality code |
| reviewer | Security and quality audit of completed code |
| summarizer | Final user-facing response |
| tester | Generates comprehensive test suites |
| debugger | Surgical fixes for tracebacks |
| researcher | Multi-source investigation with citations |
| refactorer | Improves code without changing behavior |
| translator | Natural-language translation preserving formatting |
| data_analyst | Statistical analysis and visualization |
| preflight | Pre-dispatch safety gate (approve / reorder / abort) |
| postcheck | Post-step quality gate (pass / refine) |
| postmortem | Failure analysis proposing retry or operational rule |

## Why this exists

A 4B model and a 32B model can both call themselves "instruct" and "code-capable." Catalog descriptions and parameter counts don't tell you whether a given model can actually structure a JSON action decision, cite a real source, or translate without adding a preamble. This project produces the concrete, comparable answer — per role, per model, measured under the same conditions.
