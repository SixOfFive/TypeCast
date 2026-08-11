# TypeCast — Model Catalog

[![TypeCast](https://img.shields.io/badge/TypeCast-role--fit%20benchmark-blue)](./README.md)

Benchmark results for local LLMs evaluated against 17 agent roles. Each role has 10 tests (5 standard, 3 hard, 2 near-impossible). Scoring: **+10 per pass, -10 per fail**; per-role range is -100 to +100.

> *Which role is each model typecast for? The top of each section answers it.*

> Last generated: 2026-08-11T00:44:27.350Z  
> Catalog generated: 2026-08-11T00:44:27.183Z  
> Total models in catalog: **14**  
> Tested (has role scores): **14**

## Jump to

- [Overall Leaderboard](#overall-leaderboard)
- [By VRAM Tier](#by-vram-tier)
- [By Role](#by-role)
- [Full Score Matrix](#full-score-matrix)

## Overall Leaderboard

Top **25** tested models ranked by total score across all tested roles.

| Rank | Model | Total Score | Avg/Role | Passed | WOW | Params | VRAM | Tok/s | Roles Tested |
|-----:|-------|------------:|---------:|:------:|:---:|:------:|-----:|------:|-------------:|
| 1 | `kimi-linear-48b-a3b-instruct` | **+1020** | 56.7 | 140/178 | 45/66 | 49.1B | 27.5 GB | 6 | 18/17 |
| 2 | `qwen2.5:14b-instruct` | **+980** | 54.4 | 139/180 | 42/66 | 14.8B | 8.6 GB | 10 | 18/17 |
| 3 | `qwen2.5-vl:7b` | **+700** | 38.9 | 125/180 | 35/66 | 7.6B | 4.7 GB | 16 | 18/17 |
| 4 | `ministral-3:14b` | **+590** | 65.6 | 74/89 | 28/36 | 13.5B | 7.9 GB | 13 | 9/17 |
| 5 | `ornith-1.0:9b` | **+480** | 26.7 | 114/180 | 37/66 | 9.0B | 5.5 GB | 26 | 18/17 |
| 6 | `qwen3:4b` | **+260** | 14.4 | 103/180 | 32/66 | 4.0B | 2.7 GB | 17 | 18/17 |
| 7 | `qwen3-30b-a3b-instruct` | **+230** | 76.7 | 24/25 | 8/9 | 30.5B | 17.3 GB | 9 | 3/17 |
| 8 | `qwen2.5-coder:32b` | **+160** | 53.3 | 19/22 | 7/9 | 32.8B | 18.5 GB | 6 | 3/17 |
| 9 | `gemma-4:12b-it` | **+90** | 45.0 | 13/17 | 4/6 | 11.9B | 7 GB | 2 | 2/17 |
| 10 | `qwen2.5-coder:1.5b-instruct` | **+20** | 1.1 | 91/180 | 27/66 | 1.5B | 1.3 GB | 36 | 18/17 |
| 11 | `qwen2.5-vl:3b-instruct` | **-60** | -3.3 | 87/180 | 20/66 | 3.1B | 2.2 GB | 43 | 18/17 |
| 12 | `qwen2.5:1.5b-instruct` | **-60** | -3.3 | 87/180 | 20/66 | 1.5B | 1.3 GB | 81 | 18/17 |
| 13 | `laguna-xs-2.1` | **-100** | -100.0 | 0/10 | 0/5 | 33.4B | 18.9 GB | 6 | 1/17 |
| 14 | `qwen2.5:0.5b-instruct` | **-740** | -41.1 | 53/180 | 15/66 | 494M | 0.8 GB | 97 | 18/17 |

## By VRAM Tier

Best models at each hardware size.

### Tiny (<4 GB)

5 models in this tier. Top 10 shown.

| Rank | Model | Score | Passed | WOW | Params | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|------:|
| 1 | `qwen3:4b` | **+260** | 103/180 | 32/66 | 4.0B | 17 |
| 2 | `qwen2.5-coder:1.5b-instruct` | **+20** | 91/180 | 27/66 | 1.5B | 36 |
| 3 | `qwen2.5-vl:3b-instruct` | **-60** | 87/180 | 20/66 | 3.1B | 43 |
| 4 | `qwen2.5:1.5b-instruct` | **-60** | 87/180 | 20/66 | 1.5B | 81 |
| 5 | `qwen2.5:0.5b-instruct` | **-740** | 53/180 | 15/66 | 494M | 97 |

### Small (4–8 GB)

4 models in this tier. Top 10 shown.

| Rank | Model | Score | Passed | WOW | Params | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|------:|
| 1 | `qwen2.5-vl:7b` | **+700** | 125/180 | 35/66 | 7.6B | 16 |
| 2 | `ministral-3:14b` | **+590** | 74/89 | 28/36 | 13.5B | 13 |
| 3 | `ornith-1.0:9b` | **+480** | 114/180 | 37/66 | 9.0B | 26 |
| 4 | `gemma-4:12b-it` | **+90** | 13/17 | 4/6 | 11.9B | 2 |

### Medium (8–16 GB)

1 model in this tier. Top 10 shown.

| Rank | Model | Score | Passed | WOW | Params | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|------:|
| 1 | `qwen2.5:14b-instruct` | **+980** | 139/180 | 42/66 | 14.8B | 10 |

### Large (16–32 GB)

4 models in this tier. Top 10 shown.

| Rank | Model | Score | Passed | WOW | Params | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|------:|
| 1 | `kimi-linear-48b-a3b-instruct` | **+1020** | 140/178 | 45/66 | 49.1B | 6 |
| 2 | `qwen3-30b-a3b-instruct` | **+230** | 24/25 | 8/9 | 30.5B | 9 |
| 3 | `qwen2.5-coder:32b` | **+160** | 19/22 | 7/9 | 32.8B | 6 |
| 4 | `laguna-xs-2.1` | **-100** | 0/10 | 0/5 | 33.4B | 6 |

## By Role

Best performers for each agent role. Click a role to expand.

<details>
<summary><b>router</b> — 14 tested, 10 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `ministral-3:14b` | **+80** | 9/10 | 4/5 | 13.5B | 7.9 GB | 4 |
| 2 | `qwen3-30b-a3b-instruct` | **+80** | 9/10 | 4/5 | 30.5B | 17.3 GB | 0 |
| 3 | `qwen2.5-coder:1.5b-instruct` | **+60** | 8/10 | 4/5 | 1.5B | 1.3 GB | 28 |
| 4 | `qwen2.5-coder:32b` | **+60** | 8/10 | 4/5 | 32.8B | 18.5 GB | 2 |
| 5 | `qwen2.5-vl:3b-instruct` | **+60** | 8/10 | 4/5 | 3.1B | 2.2 GB | 37 |
| 6 | `qwen2.5-vl:7b` | **+60** | 8/10 | 3/5 | 7.6B | 4.7 GB | 11 |
| 7 | `qwen2.5:14b-instruct` | **+60** | 8/10 | 4/5 | 14.8B | 8.6 GB | 6 |
| 8 | `gemma-4:12b-it` | **+40** | 7/10 | 3/5 | 11.9B | 7 GB | 1 |
| 9 | `qwen2.5:1.5b-instruct` | **+40** | 7/10 | 3/5 | 1.5B | 1.3 GB | 56 |
| 10 | `kimi-linear-48b-a3b-instruct` | **+30** | 6/9 | 3/5 | 49.1B | 27.5 GB | 2 |

</details>

<details>
<summary><b>orchestrator</b> — 12 tested, 7 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `qwen3-30b-a3b-instruct` | **+100** | 10/10 | 4/4 | 30.5B | 17.3 GB | 1 |
| 2 | `ministral-3:14b` | **+80** | 9/10 | 3/4 | 13.5B | 7.9 GB | 7 |
| 3 | `qwen2.5-coder:32b` | **+80** | 9/10 | 3/4 | 32.8B | 18.5 GB | 4 |
| 4 | `qwen2.5-vl:7b` | **+80** | 9/10 | 3/4 | 7.6B | 4.7 GB | 5 |
| 5 | `qwen2.5:14b-instruct` | **+80** | 9/10 | 3/4 | 14.8B | 8.6 GB | 19 |
| 6 | `kimi-linear-48b-a3b-instruct` | **+70** | 8/9 | 3/4 | 49.1B | 27.5 GB | 2 |
| 7 | `qwen2.5-coder:1.5b-instruct` | **+40** | 7/10 | 3/4 | 1.5B | 1.3 GB | 44 |
| 8 | `qwen2.5-vl:3b-instruct` | **0** | 5/10 | 1/4 | 3.1B | 2.2 GB | 28 |
| 9 | `qwen2.5:1.5b-instruct` | **0** | 5/10 | 1/4 | 1.5B | 1.3 GB | 80 |
| 10 | `qwen2.5:0.5b-instruct` | **-40** | 3/10 | 2/4 | 494M | 0.8 GB | 84 |

</details>

<details>
<summary><b>planner</b> — 13 tested, 7 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `ornith-1.0:9b` | **+60** | 8/10 | 3/4 | 9.0B | 5.5 GB | 32 |
| 2 | `gemma-4:12b-it` | **+50** | 6/7 | 1/1 | 11.9B | 7 GB | 2 |
| 3 | `qwen3-30b-a3b-instruct` | **+50** | 5/5 | 0/0 | 30.5B | 17.3 GB | 9 |
| 4 | `ministral-3:14b` | **+40** | 7/10 | 2/4 | 13.5B | 7.9 GB | 13 |
| 5 | `qwen2.5:1.5b-instruct` | **+40** | 7/10 | 1/4 | 1.5B | 1.3 GB | 93 |
| 6 | `qwen3:4b` | **+40** | 7/10 | 3/4 | 4.0B | 2.7 GB | 10 |
| 7 | `qwen2.5-coder:32b` | **+20** | 2/2 | 0/0 | 32.8B | 18.5 GB | 6 |
| 8 | `qwen2.5-vl:3b-instruct` | **0** | 5/10 | 1/4 | 3.1B | 2.2 GB | 58 |
| 9 | `qwen2.5-vl:7b` | **0** | 5/10 | 1/4 | 7.6B | 4.7 GB | 47 |
| 10 | `qwen2.5:14b-instruct` | **0** | 5/10 | 0/4 | 14.8B | 8.6 GB | 30 |

</details>

<details>
<summary><b>coder</b> — 10 tested, 9 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `ministral-3:14b` | **+80** | 9/10 | 4/5 | 13.5B | 7.9 GB | 11 |
| 2 | `qwen2.5-vl:7b` | **+80** | 9/10 | 4/5 | 7.6B | 4.7 GB | 31 |
| 3 | `kimi-linear-48b-a3b-instruct` | **+60** | 8/10 | 3/5 | 49.1B | 27.5 GB | 6 |
| 4 | `ornith-1.0:9b` | **+60** | 8/10 | 3/5 | 9.0B | 5.5 GB | 27 |
| 5 | `qwen2.5-vl:3b-instruct` | **+60** | 8/10 | 3/5 | 3.1B | 2.2 GB | 53 |
| 6 | `qwen2.5:14b-instruct` | **+60** | 8/10 | 4/5 | 14.8B | 8.6 GB | 30 |
| 7 | `qwen2.5-coder:1.5b-instruct` | **+40** | 7/10 | 3/5 | 1.5B | 1.3 GB | 49 |
| 8 | `qwen2.5:0.5b-instruct` | **+20** | 6/10 | 1/5 | 494M | 0.8 GB | 112 |
| 9 | `qwen2.5:1.5b-instruct` | **+20** | 6/10 | 2/5 | 1.5B | 1.3 GB | 92 |
| 10 | `qwen3:4b` | **-20** | 4/10 | 0/5 | 4.0B | 2.7 GB | 9 |

</details>

<details>
<summary><b>reviewer</b> — 10 tested, 4 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `kimi-linear-48b-a3b-instruct` | **+60** | 8/10 | 2/4 | 49.1B | 27.5 GB | 6 |
| 2 | `ministral-3:14b` | **+40** | 7/10 | 3/4 | 13.5B | 7.9 GB | 12 |
| 3 | `ornith-1.0:9b` | **+20** | 6/10 | 2/4 | 9.0B | 5.5 GB | 29 |
| 4 | `qwen2.5:14b-instruct` | **+20** | 6/10 | 1/4 | 14.8B | 8.6 GB | 27 |
| 5 | `qwen2.5-vl:7b` | **0** | 5/10 | 0/4 | 7.6B | 4.7 GB | 29 |
| 6 | `qwen3:4b` | **0** | 5/10 | 2/4 | 4.0B | 2.7 GB | 7 |
| 7 | `qwen2.5-coder:1.5b-instruct` | **-40** | 3/10 | 0/4 | 1.5B | 1.3 GB | 55 |
| 8 | `qwen2.5:1.5b-instruct` | **-40** | 3/10 | 0/4 | 1.5B | 1.3 GB | 95 |
| 9 | `qwen2.5:0.5b-instruct` | **-60** | 2/10 | 0/4 | 494M | 0.8 GB | 117 |
| 10 | `qwen2.5-vl:3b-instruct` | **-80** | 1/10 | 0/4 | 3.1B | 2.2 GB | 60 |

</details>

<details>
<summary><b>summarizer</b> — 10 tested, 8 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `ministral-3:14b` | **+100** | 10/10 | 5/5 | 13.5B | 7.9 GB | 9 |
| 2 | `ornith-1.0:9b` | **+100** | 10/10 | 5/5 | 9.0B | 5.5 GB | 23 |
| 3 | `qwen2.5:14b-instruct` | **+80** | 9/10 | 4/5 | 14.8B | 8.6 GB | 21 |
| 4 | `qwen3:4b` | **+80** | 9/10 | 4/5 | 4.0B | 2.7 GB | 4 |
| 5 | `qwen2.5-vl:7b` | **+60** | 8/10 | 3/5 | 7.6B | 4.7 GB | 32 |
| 6 | `kimi-linear-48b-a3b-instruct` | **+40** | 7/10 | 3/5 | 49.1B | 27.5 GB | 5 |
| 7 | `qwen2.5:1.5b-instruct` | **+40** | 7/10 | 3/5 | 1.5B | 1.3 GB | 83 |
| 8 | `qwen2.5-vl:3b-instruct` | **+20** | 6/10 | 2/5 | 3.1B | 2.2 GB | 53 |
| 9 | `qwen2.5-coder:1.5b-instruct` | **0** | 5/10 | 2/5 | 1.5B | 1.3 GB | 46 |
| 10 | `qwen2.5:0.5b-instruct` | **-20** | 4/10 | 3/5 | 494M | 0.8 GB | 106 |

</details>

<details>
<summary><b>architect</b> — 10 tested, 4 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `ornith-1.0:9b` | **+60** | 8/10 | 4/5 | 9.0B | 5.5 GB | 34 |
| 2 | `qwen3:4b` | **+60** | 8/10 | 5/5 | 4.0B | 2.7 GB | 9 |
| 3 | `ministral-3:14b` | **+40** | 7/10 | 3/5 | 13.5B | 7.9 GB | 12 |
| 4 | `kimi-linear-48b-a3b-instruct` | **+20** | 6/10 | 2/5 | 49.1B | 27.5 GB | 6 |
| 5 | `qwen2.5:14b-instruct` | **0** | 5/10 | 2/5 | 14.8B | 8.6 GB | 32 |
| 6 | `qwen2.5-vl:7b` | **-20** | 4/10 | 2/5 | 7.6B | 4.7 GB | 46 |
| 7 | `qwen2.5:1.5b-instruct` | **-40** | 3/10 | 2/5 | 1.5B | 1.3 GB | 95 |
| 8 | `qwen2.5-coder:1.5b-instruct` | **-60** | 2/10 | 1/5 | 1.5B | 1.3 GB | 57 |
| 9 | `qwen2.5-vl:3b-instruct` | **-60** | 2/10 | 1/5 | 3.1B | 2.2 GB | 60 |
| 10 | `qwen2.5:0.5b-instruct` | **-60** | 2/10 | 1/5 | 494M | 0.8 GB | 119 |

</details>

<details>
<summary><b>critic</b> — 10 tested, 6 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `kimi-linear-48b-a3b-instruct` | **+60** | 8/10 | 0/0 | 49.1B | 27.5 GB | 7 |
| 2 | `ministral-3:14b` | **+60** | 8/10 | 0/0 | 13.5B | 7.9 GB | 12 |
| 3 | `ornith-1.0:9b` | **+60** | 8/10 | 0/0 | 9.0B | 5.5 GB | 34 |
| 4 | `qwen2.5-vl:7b` | **+60** | 8/10 | 0/0 | 7.6B | 4.7 GB | 45 |
| 5 | `qwen2.5:14b-instruct` | **+60** | 8/10 | 0/0 | 14.8B | 8.6 GB | 31 |
| 6 | `qwen3:4b` | **+60** | 8/10 | 0/0 | 4.0B | 2.7 GB | 14 |
| 7 | `qwen2.5-coder:1.5b-instruct` | **0** | 5/10 | 0/0 | 1.5B | 1.3 GB | 56 |
| 8 | `qwen2.5-vl:3b-instruct` | **0** | 5/10 | 0/0 | 3.1B | 2.2 GB | 63 |
| 9 | `qwen2.5:1.5b-instruct` | **0** | 5/10 | 0/0 | 1.5B | 1.3 GB | 94 |
| 10 | `qwen2.5:0.5b-instruct` | **-80** | 1/10 | 0/0 | 494M | 0.8 GB | 119 |

</details>

<details>
<summary><b>tester</b> — 10 tested, 8 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `kimi-linear-48b-a3b-instruct` | **+100** | 10/10 | 5/5 | 49.1B | 27.5 GB | 7 |
| 2 | `ornith-1.0:9b` | **+80** | 9/10 | 4/5 | 9.0B | 5.5 GB | 35 |
| 3 | `qwen2.5:14b-instruct` | **+80** | 9/10 | 4/5 | 14.8B | 8.6 GB | 31 |
| 4 | `ministral-3:14b` | **+70** | 8/9 | 4/4 | 13.5B | 7.9 GB | 13 |
| 5 | `qwen2.5-vl:7b` | **+60** | 8/10 | 3/5 | 7.6B | 4.7 GB | 42 |
| 6 | `qwen2.5-coder:1.5b-instruct` | **+40** | 7/10 | 3/5 | 1.5B | 1.3 GB | 55 |
| 7 | `qwen3:4b` | **+40** | 7/10 | 3/5 | 4.0B | 2.7 GB | 15 |
| 8 | `qwen2.5-vl:3b-instruct` | **+20** | 6/10 | 2/5 | 3.1B | 2.2 GB | 59 |
| 9 | `qwen2.5:0.5b-instruct` | **-20** | 4/10 | 2/5 | 494M | 0.8 GB | 117 |
| 10 | `qwen2.5:1.5b-instruct` | **-60** | 2/10 | 0/5 | 1.5B | 1.3 GB | 90 |

</details>

<details>
<summary><b>debugger</b> — 9 tested, 5 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `kimi-linear-48b-a3b-instruct` | **+100** | 10/10 | 5/5 | 49.1B | 27.5 GB | 9 |
| 2 | `ornith-1.0:9b` | **+100** | 10/10 | 5/5 | 9.0B | 5.5 GB | 32 |
| 3 | `qwen2.5:14b-instruct` | **+80** | 9/10 | 4/5 | 14.8B | 8.6 GB | 26 |
| 4 | `qwen3:4b` | **+80** | 9/10 | 4/5 | 4.0B | 2.7 GB | 17 |
| 5 | `qwen2.5-vl:7b` | **+60** | 8/10 | 3/5 | 7.6B | 4.7 GB | 37 |
| 6 | `qwen2.5-coder:1.5b-instruct` | **0** | 5/10 | 2/5 | 1.5B | 1.3 GB | 54 |
| 7 | `qwen2.5:0.5b-instruct` | **-20** | 4/10 | 1/5 | 494M | 0.8 GB | 114 |
| 8 | `qwen2.5:1.5b-instruct` | **-20** | 4/10 | 1/5 | 1.5B | 1.3 GB | 83 |
| 9 | `qwen2.5-vl:3b-instruct` | **-40** | 3/10 | 0/5 | 3.1B | 2.2 GB | 61 |

</details>

<details>
<summary><b>researcher</b> — 9 tested, 8 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `ornith-1.0:9b` | **+80** | 9/10 | 4/5 | 9.0B | 5.5 GB | 34 |
| 2 | `qwen2.5:14b-instruct` | **+80** | 9/10 | 4/5 | 14.8B | 8.6 GB | 32 |
| 3 | `qwen3:4b` | **+80** | 9/10 | 4/5 | 4.0B | 2.7 GB | 18 |
| 4 | `kimi-linear-48b-a3b-instruct` | **+60** | 8/10 | 3/5 | 49.1B | 27.5 GB | 8 |
| 5 | `qwen2.5-coder:1.5b-instruct` | **+60** | 8/10 | 3/5 | 1.5B | 1.3 GB | 56 |
| 6 | `qwen2.5-vl:3b-instruct` | **+40** | 7/10 | 2/5 | 3.1B | 2.2 GB | 66 |
| 7 | `qwen2.5-vl:7b` | **+40** | 7/10 | 2/5 | 7.6B | 4.7 GB | 45 |
| 8 | `qwen2.5:1.5b-instruct` | **+40** | 7/10 | 2/5 | 1.5B | 1.3 GB | 94 |
| 9 | `qwen2.5:0.5b-instruct` | **0** | 5/10 | 0/5 | 494M | 0.8 GB | 120 |

</details>

<details>
<summary><b>refactorer</b> — 9 tested, 5 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `kimi-linear-48b-a3b-instruct` | **+80** | 9/10 | 4/5 | 49.1B | 27.5 GB | 9 |
| 2 | `ornith-1.0:9b` | **+40** | 7/10 | 3/5 | 9.0B | 5.5 GB | 35 |
| 3 | `qwen2.5-vl:7b` | **+40** | 7/10 | 3/5 | 7.6B | 4.7 GB | 33 |
| 4 | `qwen2.5:14b-instruct` | **+40** | 7/10 | 3/5 | 14.8B | 8.6 GB | 29 |
| 5 | `qwen3:4b` | **+40** | 7/10 | 3/5 | 4.0B | 2.7 GB | 18 |
| 6 | `qwen2.5:1.5b-instruct` | **0** | 5/10 | 3/5 | 1.5B | 1.3 GB | 91 |
| 7 | `qwen2.5-coder:1.5b-instruct` | **-20** | 4/10 | 1/5 | 1.5B | 1.3 GB | 54 |
| 8 | `qwen2.5-vl:3b-instruct` | **-60** | 2/10 | 1/5 | 3.1B | 2.2 GB | 58 |
| 9 | `qwen2.5:0.5b-instruct` | **-60** | 2/10 | 1/5 | 494M | 0.8 GB | 112 |

</details>

<details>
<summary><b>translator</b> — 9 tested, 7 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `kimi-linear-48b-a3b-instruct` | **+60** | 8/10 | 3/5 | 49.1B | 27.5 GB | 5 |
| 2 | `qwen2.5-vl:7b` | **+60** | 8/10 | 3/5 | 7.6B | 4.7 GB | 25 |
| 3 | `qwen2.5:14b-instruct` | **+60** | 8/10 | 3/5 | 14.8B | 8.6 GB | 17 |
| 4 | `ornith-1.0:9b` | **+20** | 6/10 | 3/5 | 9.0B | 5.5 GB | 31 |
| 5 | `qwen2.5-coder:1.5b-instruct` | **+20** | 6/10 | 2/5 | 1.5B | 1.3 GB | 40 |
| 6 | `qwen2.5:1.5b-instruct` | **+20** | 6/10 | 1/5 | 1.5B | 1.3 GB | 94 |
| 7 | `qwen3:4b` | **+20** | 6/10 | 2/5 | 4.0B | 2.7 GB | 18 |
| 8 | `qwen2.5-vl:3b-instruct` | **0** | 5/10 | 1/5 | 3.1B | 2.2 GB | 50 |
| 9 | `qwen2.5:0.5b-instruct` | **-20** | 4/10 | 1/5 | 494M | 0.8 GB | 90 |

</details>

<details>
<summary><b>data_analyst</b> — 9 tested, 4 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `kimi-linear-48b-a3b-instruct` | **+100** | 10/10 | 0/0 | 49.1B | 27.5 GB | 9 |
| 2 | `ornith-1.0:9b` | **+100** | 10/10 | 0/0 | 9.0B | 5.5 GB | 33 |
| 3 | `qwen3:4b` | **+100** | 10/10 | 0/0 | 4.0B | 2.7 GB | 13 |
| 4 | `qwen2.5:14b-instruct` | **+60** | 8/10 | 0/0 | 14.8B | 8.6 GB | 31 |
| 5 | `qwen2.5-vl:7b` | **0** | 5/10 | 0/0 | 7.6B | 4.7 GB | 44 |
| 6 | `qwen2.5:1.5b-instruct` | **0** | 5/10 | 0/0 | 1.5B | 1.3 GB | 122 |
| 7 | `qwen2.5-coder:1.5b-instruct` | **-20** | 4/10 | 0/0 | 1.5B | 1.3 GB | 55 |
| 8 | `qwen2.5-vl:3b-instruct` | **-20** | 4/10 | 0/0 | 3.1B | 2.2 GB | 61 |
| 9 | `qwen2.5:0.5b-instruct` | **-60** | 2/10 | 0/0 | 494M | 0.8 GB | 115 |

</details>

<details>
<summary><b>preflight</b> — 9 tested, 3 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `kimi-linear-48b-a3b-instruct` | **+20** | 6/10 | 0/0 | 49.1B | 27.5 GB | 6 |
| 2 | `qwen2.5-vl:3b-instruct` | **+20** | 6/10 | 0/0 | 3.1B | 2.2 GB | 36 |
| 3 | `qwen2.5:14b-instruct` | **+20** | 6/10 | 0/0 | 14.8B | 8.6 GB | 13 |
| 4 | `qwen2.5-vl:7b` | **0** | 5/10 | 0/0 | 7.6B | 4.7 GB | 15 |
| 5 | `qwen2.5-coder:1.5b-instruct` | **-40** | 3/10 | 0/0 | 1.5B | 1.3 GB | 35 |
| 6 | `qwen2.5:0.5b-instruct` | **-60** | 2/10 | 0/0 | 494M | 0.8 GB | 107 |
| 7 | `qwen2.5:1.5b-instruct` | **-60** | 2/10 | 0/0 | 1.5B | 1.3 GB | 53 |
| 8 | `ornith-1.0:9b` | **-100** | 0/10 | 0/0 | 9.0B | 5.5 GB | 30 |
| 9 | `qwen3:4b` | **-100** | 0/10 | 0/0 | 4.0B | 2.7 GB | 14 |

</details>

<details>
<summary><b>postcheck</b> — 9 tested, 5 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `kimi-linear-48b-a3b-instruct` | **+80** | 9/10 | 0/0 | 49.1B | 27.5 GB | 6 |
| 2 | `qwen2.5:14b-instruct` | **+80** | 9/10 | 0/0 | 14.8B | 8.6 GB | 12 |
| 3 | `ornith-1.0:9b` | **+60** | 8/10 | 0/0 | 9.0B | 5.5 GB | 31 |
| 4 | `qwen2.5-vl:7b` | **+60** | 8/10 | 0/0 | 7.6B | 4.7 GB | 22 |
| 5 | `qwen3:4b` | **+40** | 7/10 | 0/0 | 4.0B | 2.7 GB | 14 |
| 6 | `qwen2.5-coder:1.5b-instruct` | **-20** | 4/10 | 0/0 | 1.5B | 1.3 GB | 43 |
| 7 | `qwen2.5-vl:3b-instruct` | **-20** | 4/10 | 0/0 | 3.1B | 2.2 GB | 51 |
| 8 | `qwen2.5:1.5b-instruct` | **-20** | 4/10 | 0/0 | 1.5B | 1.3 GB | 95 |
| 9 | `qwen2.5:0.5b-instruct` | **-40** | 3/10 | 0/0 | 494M | 0.8 GB | 104 |

</details>

<details>
<summary><b>postmortem</b> — 9 tested, 3 passing (score > 0)</summary>

| Rank | Model | Score | Passed | WOW | Params | VRAM | Tok/s |
|-----:|-------|------:|:------:|:---:|:------:|-----:|------:|
| 1 | `qwen2.5:14b-instruct` | **+60** | 8/10 | 4/5 | 14.8B | 8.6 GB | 22 |
| 2 | `kimi-linear-48b-a3b-instruct` | **+20** | 6/10 | 3/5 | 49.1B | 27.5 GB | 8 |
| 3 | `qwen2.5-coder:1.5b-instruct` | **+20** | 6/10 | 2/5 | 1.5B | 1.3 GB | 52 |
| 4 | `qwen2.5-vl:7b` | **0** | 5/10 | 3/5 | 7.6B | 4.7 GB | 35 |
| 5 | `qwen2.5-vl:3b-instruct` | **-20** | 4/10 | 2/5 | 3.1B | 2.2 GB | 57 |
| 6 | `qwen2.5:1.5b-instruct` | **-40** | 3/10 | 1/5 | 1.5B | 1.3 GB | 111 |
| 7 | `ornith-1.0:9b` | **-100** | 0/10 | 0/5 | 9.0B | 5.5 GB | 33 |
| 8 | `qwen2.5:0.5b-instruct` | **-100** | 0/10 | 0/5 | 494M | 0.8 GB | 106 |
| 9 | `qwen3:4b` | **-100** | 0/10 | 0/5 | 4.0B | 2.7 GB | 17 |

</details>

## Full Score Matrix

<details>
<summary>All tested models × all roles (scroll horizontally — click to expand)</summary>

| Model | Total | rtr | orc | pln | cod | rev | sum | arc | crt | tst | dbg | rsh | rfc | trn | dat | prf | psc | pst |
|-------|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|------:|
| `kimi-linear-48b-a3b-instruct` | **+1020** | +30 | +70 | -20 | +60 | +60 | +40 | +20 | +60 | +100 | +100 | +60 | +80 | +60 | +100 | +20 | +80 | +20 |
| `qwen2.5:14b-instruct` | **+980** | +60 | +80 | 0 | +60 | +20 | +80 | 0 | +60 | +80 | +80 | +80 | +40 | +60 | +60 | +20 | +80 | +60 |
| `qwen2.5-vl:7b` | **+700** | +60 | +80 | 0 | +80 | 0 | +60 | -20 | +60 | +60 | +60 | +40 | +40 | +60 | 0 | 0 | +60 | 0 |
| `ministral-3:14b` | **+590** | +80 | +80 | +40 | +80 | +40 | +100 | +40 | +60 | +70 | — | — | — | — | — | — | — | — |
| `ornith-1.0:9b` | **+480** | -100 | -100 | +60 | +60 | +20 | +100 | +60 | +60 | +80 | +100 | +80 | +40 | +20 | +100 | -100 | +60 | -100 |
| `qwen3:4b` | **+260** | -100 | -100 | +40 | -20 | 0 | +80 | +60 | +60 | +40 | +80 | +80 | +40 | +20 | +100 | -100 | +40 | -100 |
| `qwen3-30b-a3b-instruct` | **+230** | +80 | +100 | +50 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| `qwen2.5-coder:32b` | **+160** | +60 | +80 | +20 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| `gemma-4:12b-it` | **+90** | +40 | — | +50 | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| `qwen2.5-coder:1.5b-instruct` | **+20** | +60 | +40 | -40 | +40 | -40 | 0 | -60 | 0 | +40 | 0 | +60 | -20 | +20 | -20 | -40 | -20 | +20 |
| `qwen2.5-vl:3b-instruct` | **-60** | +60 | 0 | 0 | +60 | -80 | +20 | -60 | 0 | +20 | -40 | +40 | -60 | 0 | -20 | +20 | -20 | -20 |
| `qwen2.5:1.5b-instruct` | **-60** | +40 | 0 | +40 | +20 | -40 | +40 | -40 | 0 | -60 | -20 | +40 | 0 | +20 | 0 | -60 | -20 | -40 |
| `laguna-xs-2.1` | **-100** | -100 | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| `qwen2.5:0.5b-instruct` | **-740** | -20 | -40 | -60 | +20 | -60 | -20 | -60 | -80 | -20 | -20 | 0 | -60 | -20 | -60 | -60 | -40 | -100 |

**Abbreviation key:** `rtr` = router, `orc` = orchestrator, `pln` = planner, `cod` = coder, `rev` = reviewer, `sum` = summarizer, `arc` = architect, `crt` = critic, `tst` = tester, `dbg` = debugger, `rsh` = researcher, `rfc` = refactorer, `trn` = translator, `dat` = data_analyst, `prf` = preflight, `psc` = postcheck, `pst` = postmortem

</details>

---

*Raw data: [`models-catalog.json`](./models-catalog.json).*  
*Regenerate this file: `node generate-catalog-md.js` (or `generate-catalog-md.bat`).*
