# TypeCast — Model Catalog

[![TypeCast](https://img.shields.io/badge/TypeCast-role--fit%20benchmark-blue)](./README.md)

Benchmark results for local LLMs evaluated against 17 agent roles. Each role has 10 tests (5 standard, 3 hard, 2 near-impossible). Scoring: **+10 per pass, -10 per fail**; per-role range is -100 to +100.

> *Which role is each model typecast for? The top of each section answers it.*

> Last generated: 2026-08-07T19:51:24.035Z  
> Catalog generated: 2026-08-07T19:51:23.794Z  
> Total models in catalog: **7**  
> Tested (has role scores): **7**

## Jump to

- [Overall Leaderboard](#overall-leaderboard)
- [By VRAM Tier](#by-vram-tier)
- [By Role](#by-role)
- [Full Score Matrix](#full-score-matrix)

## Overall Leaderboard

Top **25** tested models ranked by total score across all tested roles.

| Rank | Model | Total Score | Avg/Role | Passed | WOW | Params | VRAM | Tok/s | Roles Tested |
|-----:|-------|------------:|---------:|:------:|:---:|:------:|-----:|------:|-------------:|
| 1 | `qwen2.5:14b-instruct` | **+980** | 54.4 | 139/180 | 42/66 | 14.8B | 8.6 GB | 10 | 18/17 |
| 2 | `ministral-3:14b` | **+590** | 65.6 | 74/89 | 28/36 | 13.5B | 7.9 GB | 13 | 9/17 |
| 3 | `qwen3:4b` | **+250** | 13.9 | 102/179 | 32/66 | 4.0B | 2.7 GB | 17 | 18/17 |
| 4 | `qwen3-30b-a3b-instruct` | **+230** | 76.7 | 24/25 | 8/9 | 30.5B | 17.3 GB | 9 | 3/17 |
| 5 | `gemma-4:12b-it` | **+90** | 45.0 | 13/17 | 4/6 | 11.9B | 7 GB | 2 | 2/17 |
| 6 | `laguna-xs-2.1` | **-100** | -100.0 | 0/10 | 0/5 | 33.4B | 18.9 GB | 6 | 1/17 |
| 7 | `qwen2.5:0.5b-instruct` | **-740** | -41.1 | 53/180 | 15/66 | 494M | 0.8 GB | 97 | 18/17 |

## By VRAM Tier

Best models at each hardware size.

### Tiny (<4 GB)

2 models in this tier. Top 10 shown.

| Rank | Model | Score | Passed | WOW | Params | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|------:|
| 1 | `qwen3:4b` | **+250** | 102/179 | 32/66 | 4.0B | 17 |
| 2 | `qwen2.5:0.5b-instruct` | **-740** | 53/180 | 15/66 | 494M | 97 |

### Small (4–8 GB)

2 models in this tier. Top 10 shown.

| Rank | Model | Score | Passed | WOW | Params | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|------:|
| 1 | `ministral-3:14b` | **+590** | 74/89 | 28/36 | 13.5B | 13 |
| 2 | `gemma-4:12b-it` | **+90** | 13/17 | 4/6 | 11.9B | 2 |

### Medium (8–16 GB)

1 model in this tier. Top 10 shown.

| Rank | Model | Score | Passed | WOW | Params | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|------:|
| 1 | `qwen2.5:14b-instruct` | **+980** | 139/180 | 42/66 | 14.8B | 10 |

### Large (16–32 GB)

2 models in this tier. Top 10 shown.

| Rank | Model | Score | Passed | WOW | Params | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|------:|
| 1 | `qwen3-30b-a3b-instruct` | **+230** | 24/25 | 8/9 | 30.5B | 9 |
| 2 | `laguna-xs-2.1` | **-100** | 0/10 | 0/5 | 33.4B | 6 |

## By Role

Best performers for each agent role. Click a role to expand.

<details>
<summary><b>router</b> — 7 tested, 4 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `ministral-3:14b` | **+80** | 9/10 | 4/5 | 13.5B | 7.9 GB | 4 |
| 2 | `qwen3-30b-a3b-instruct` | **+80** | 9/10 | 4/5 | 30.5B | 17.3 GB | 0 |
| 3 | `qwen2.5:14b-instruct` | **+60** | 8/10 | 4/5 | 14.8B | 8.6 GB | 6 |
| 4 | `gemma-4:12b-it` | **+40** | 7/10 | 3/5 | 11.9B | 7 GB | 1 |
| 5 | `qwen2.5:0.5b-instruct` | **-20** | 4/10 | 2/5 | 494M | 0.8 GB | 54 |
| 6 | `laguna-xs-2.1` | **-100** | 0/10 | 0/5 | 33.4B | 18.9 GB | 6 |
| 7 | `qwen3:4b` | **-100** | 0/10 | 0/5 | 4.0B | 2.7 GB | 10 |

</details>

<details>
<summary><b>orchestrator</b> — 5 tested, 3 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `qwen3-30b-a3b-instruct` | **+100** | 10/10 | 4/4 | 30.5B | 17.3 GB | 1 |
| 2 | `ministral-3:14b` | **+80** | 9/10 | 3/4 | 13.5B | 7.9 GB | 7 |
| 3 | `qwen2.5:14b-instruct` | **+80** | 9/10 | 3/4 | 14.8B | 8.6 GB | 19 |
| 4 | `qwen2.5:0.5b-instruct` | **-40** | 3/10 | 2/4 | 494M | 0.8 GB | 84 |
| 5 | `qwen3:4b` | **-100** | 0/10 | 0/4 | 4.0B | 2.7 GB | 1 |

</details>

<details>
<summary><b>planner</b> — 6 tested, 4 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `gemma-4:12b-it` | **+50** | 6/7 | 1/1 | 11.9B | 7 GB | 2 |
| 2 | `qwen3-30b-a3b-instruct` | **+50** | 5/5 | 0/0 | 30.5B | 17.3 GB | 9 |
| 3 | `ministral-3:14b` | **+40** | 7/10 | 2/4 | 13.5B | 7.9 GB | 13 |
| 4 | `qwen3:4b` | **+40** | 7/10 | 3/4 | 4.0B | 2.7 GB | 10 |
| 5 | `qwen2.5:14b-instruct` | **0** | 5/10 | 0/4 | 14.8B | 8.6 GB | 30 |
| 6 | `qwen2.5:0.5b-instruct` | **-60** | 2/10 | 1/4 | 494M | 0.8 GB | 115 |

</details>

<details>
<summary><b>coder</b> — 4 tested, 3 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `ministral-3:14b` | **+80** | 9/10 | 4/5 | 13.5B | 7.9 GB | 11 |
| 2 | `qwen2.5:14b-instruct` | **+60** | 8/10 | 4/5 | 14.8B | 8.6 GB | 30 |
| 3 | `qwen2.5:0.5b-instruct` | **+20** | 6/10 | 1/5 | 494M | 0.8 GB | 112 |
| 4 | `qwen3:4b` | **-20** | 4/10 | 0/5 | 4.0B | 2.7 GB | 9 |

</details>

<details>
<summary><b>reviewer</b> — 4 tested, 2 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `ministral-3:14b` | **+40** | 7/10 | 3/4 | 13.5B | 7.9 GB | 12 |
| 2 | `qwen2.5:14b-instruct` | **+20** | 6/10 | 1/4 | 14.8B | 8.6 GB | 27 |
| 3 | `qwen3:4b` | **0** | 5/10 | 2/4 | 4.0B | 2.7 GB | 7 |
| 4 | `qwen2.5:0.5b-instruct` | **-60** | 2/10 | 0/4 | 494M | 0.8 GB | 117 |

</details>

<details>
<summary><b>summarizer</b> — 4 tested, 3 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `ministral-3:14b` | **+100** | 10/10 | 5/5 | 13.5B | 7.9 GB | 9 |
| 2 | `qwen2.5:14b-instruct` | **+80** | 9/10 | 4/5 | 14.8B | 8.6 GB | 21 |
| 3 | `qwen3:4b` | **+80** | 9/10 | 4/5 | 4.0B | 2.7 GB | 4 |
| 4 | `qwen2.5:0.5b-instruct` | **-20** | 4/10 | 3/5 | 494M | 0.8 GB | 106 |

</details>

<details>
<summary><b>architect</b> — 4 tested, 2 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `qwen3:4b` | **+60** | 8/10 | 5/5 | 4.0B | 2.7 GB | 9 |
| 2 | `ministral-3:14b` | **+40** | 7/10 | 3/5 | 13.5B | 7.9 GB | 12 |
| 3 | `qwen2.5:14b-instruct` | **0** | 5/10 | 2/5 | 14.8B | 8.6 GB | 32 |
| 4 | `qwen2.5:0.5b-instruct` | **-60** | 2/10 | 1/5 | 494M | 0.8 GB | 119 |

</details>

<details>
<summary><b>critic</b> — 4 tested, 3 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `ministral-3:14b` | **+60** | 8/10 | 0/0 | 13.5B | 7.9 GB | 12 |
| 2 | `qwen2.5:14b-instruct` | **+60** | 8/10 | 0/0 | 14.8B | 8.6 GB | 31 |
| 3 | `qwen3:4b` | **+60** | 8/10 | 0/0 | 4.0B | 2.7 GB | 14 |
| 4 | `qwen2.5:0.5b-instruct` | **-80** | 1/10 | 0/0 | 494M | 0.8 GB | 119 |

</details>

<details>
<summary><b>tester</b> — 4 tested, 3 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `qwen2.5:14b-instruct` | **+80** | 9/10 | 4/5 | 14.8B | 8.6 GB | 31 |
| 2 | `ministral-3:14b` | **+70** | 8/9 | 4/4 | 13.5B | 7.9 GB | 13 |
| 3 | `qwen3:4b` | **+40** | 7/10 | 3/5 | 4.0B | 2.7 GB | 15 |
| 4 | `qwen2.5:0.5b-instruct` | **-20** | 4/10 | 2/5 | 494M | 0.8 GB | 117 |

</details>

<details>
<summary><b>debugger</b> — 3 tested, 2 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `qwen2.5:14b-instruct` | **+80** | 9/10 | 4/5 | 14.8B | 8.6 GB | 26 |
| 2 | `qwen3:4b` | **+80** | 9/10 | 4/5 | 4.0B | 2.7 GB | 17 |
| 3 | `qwen2.5:0.5b-instruct` | **-20** | 4/10 | 1/5 | 494M | 0.8 GB | 114 |

</details>

<details>
<summary><b>researcher</b> — 3 tested, 2 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `qwen2.5:14b-instruct` | **+80** | 9/10 | 4/5 | 14.8B | 8.6 GB | 32 |
| 2 | `qwen3:4b` | **+80** | 9/10 | 4/5 | 4.0B | 2.7 GB | 18 |
| 3 | `qwen2.5:0.5b-instruct` | **0** | 5/10 | 0/5 | 494M | 0.8 GB | 120 |

</details>

<details>
<summary><b>refactorer</b> — 3 tested, 2 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `qwen2.5:14b-instruct` | **+40** | 7/10 | 3/5 | 14.8B | 8.6 GB | 29 |
| 2 | `qwen3:4b` | **+40** | 7/10 | 3/5 | 4.0B | 2.7 GB | 18 |
| 3 | `qwen2.5:0.5b-instruct` | **-60** | 2/10 | 1/5 | 494M | 0.8 GB | 112 |

</details>

<details>
<summary><b>translator</b> — 3 tested, 2 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `qwen2.5:14b-instruct` | **+60** | 8/10 | 3/5 | 14.8B | 8.6 GB | 17 |
| 2 | `qwen3:4b` | **+20** | 6/10 | 2/5 | 4.0B | 2.7 GB | 18 |
| 3 | `qwen2.5:0.5b-instruct` | **-20** | 4/10 | 1/5 | 494M | 0.8 GB | 90 |

</details>

<details>
<summary><b>data_analyst</b> — 3 tested, 2 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `qwen3:4b` | **+90** | 9/9 | 0/0 | 4.0B | 2.7 GB | 10 |
| 2 | `qwen2.5:14b-instruct` | **+60** | 8/10 | 0/0 | 14.8B | 8.6 GB | 31 |
| 3 | `qwen2.5:0.5b-instruct` | **-60** | 2/10 | 0/0 | 494M | 0.8 GB | 115 |

</details>

<details>
<summary><b>preflight</b> — 3 tested, 1 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `qwen2.5:14b-instruct` | **+20** | 6/10 | 0/0 | 14.8B | 8.6 GB | 13 |
| 2 | `qwen2.5:0.5b-instruct` | **-60** | 2/10 | 0/0 | 494M | 0.8 GB | 107 |
| 3 | `qwen3:4b` | **-100** | 0/10 | 0/0 | 4.0B | 2.7 GB | 14 |

</details>

<details>
<summary><b>postcheck</b> — 3 tested, 2 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `qwen2.5:14b-instruct` | **+80** | 9/10 | 0/0 | 14.8B | 8.6 GB | 12 |
| 2 | `qwen3:4b` | **+40** | 7/10 | 0/0 | 4.0B | 2.7 GB | 14 |
| 3 | `qwen2.5:0.5b-instruct` | **-40** | 3/10 | 0/0 | 494M | 0.8 GB | 104 |

</details>

<details>
<summary><b>postmortem</b> — 3 tested, 1 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `qwen2.5:14b-instruct` | **+60** | 8/10 | 4/5 | 14.8B | 8.6 GB | 22 |
| 2 | `qwen2.5:0.5b-instruct` | **-100** | 0/10 | 0/5 | 494M | 0.8 GB | 106 |
| 3 | `qwen3:4b` | **-100** | 0/10 | 0/5 | 4.0B | 2.7 GB | 17 |

</details>

## Full Score Matrix

<details>
<summary>All tested models × all roles (scroll horizontally — click to expand)</summary>

| Model | Total | rtr | orc | pln | cod | rev | sum | arc | crt | tst | dbg | rsh | rfc | trn | dat | prf | psc | pst |
|-------|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|
| `qwen2.5:14b-instruct` | **+980** | +60 | +80 | 0 | +60 | +20 | +80 | 0 | +60 | +80 | +80 | +80 | +40 | +60 | +60 | +20 | +80 | +60 |
| `ministral-3:14b` | **+590** | +80 | +80 | +40 | +80 | +40 | +100 | +40 | +60 | +70 | — | — | — | — | — | — | — | — |
| `qwen3:4b` | **+250** | -100 | -100 | +40 | -20 | 0 | +80 | +60 | +60 | +40 | +80 | +80 | +40 | +20 | +90 | -100 | +40 | -100 |
| `qwen3-30b-a3b-instruct` | **+230** | +80 | +100 | +50 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| `gemma-4:12b-it` | **+90** | +40 | — | +50 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| `laguna-xs-2.1` | **-100** | -100 | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| `qwen2.5:0.5b-instruct` | **-740** | -20 | -40 | -60 | +20 | -60 | -20 | -60 | -80 | -20 | -20 | 0 | -60 | -20 | -60 | -60 | -40 | -100 |

**Abbreviation key:** `rtr` = router, `orc` = orchestrator, `pln` = planner, `cod` = coder, `rev` = reviewer, `sum` = summarizer, `arc` = architect, `crt` = critic, `tst` = tester, `dbg` = debugger, `rsh` = researcher, `rfc` = refactorer, `trn` = translator, `dat` = data_analyst, `prf` = preflight, `psc` = postcheck, `pst` = postmortem

</details>

---

*Raw data: [`models-catalog.json`](./models-catalog.json).*  
*Regenerate this file: `node generate-catalog-md.js` (or `generate-catalog-md.bat`).*
