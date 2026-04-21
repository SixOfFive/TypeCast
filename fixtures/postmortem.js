function parsePostmortemJson(output) {
  const clean = output.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try { return JSON.parse(clean); } catch { return null; }
}

module.exports = [
  // ============================================================
  // 1. CORE: Missing import failure
  // ============================================================
  {
    id: 'postmortem-core-missing-import',
    difficulty: 'core',
    inputLength: 'medium',
    temperature: 0.1,
    maxTokens: 2000,
    input: `## Failure Reason
ModuleNotFoundError: No module named 'requests'

## Original User Request
Fetch the top 10 Hacker News stories and save them to a JSON file.

## Run Transcript
[orchestrator - Step 1]: Plan — use Python requests to fetch HN API, parse JSON, write to file.
[coder - Step 2]: Wrote fetch_hn.py:
\`\`\`python
import requests
import json

resp = requests.get("https://hacker-news.firebaseio.com/v0/topstories.json")
top_ids = resp.json()[:10]
stories = []
for sid in top_ids:
    r = requests.get(f"https://hacker-news.firebaseio.com/v0/item/{sid}.json")
    stories.append(r.json())
with open("hn_top10.json", "w") as f:
    json.dump(stories, f, indent=2)
print(f"Saved {len(stories)} stories")
\`\`\`
[execute - Step 3]: FAILED
Traceback (most recent call last):
  File "fetch_hn.py", line 1, in <module>
    import requests
ModuleNotFoundError: No module named 'requests'
[orchestrator - Step 4]: Pipeline failed. No pip install was attempted before execution.`,
    validate(output) {
      const parsed = parsePostmortemJson(output);
      if (!parsed) return { pass: false, reason: 'Output must be valid JSON' };
      if (!parsed.analysis || typeof parsed.analysis !== 'string' || parsed.analysis.length < 10)
        return { pass: false, reason: 'Must have a non-empty "analysis" field' };
      const a = parsed.analysis.toLowerCase();
      if (!(/requests/.test(a) || /module/.test(a) || /import/.test(a) || /dependenc/.test(a) || /pip/.test(a)))
        return { pass: false, reason: 'Analysis must mention the missing module (requests), import, or dependency' };
      if (!parsed.rule || !parsed.rule.trigger)
        return { pass: false, reason: 'Must propose a rule with a trigger about installing dependencies before executing' };
      const ruleTxt = JSON.stringify(parsed.rule).toLowerCase();
      if (!(/install/.test(ruleTxt) || /pip/.test(ruleTxt) || /dependenc/.test(ruleTxt)))
        return { pass: false, reason: 'Rule must mention installing dependencies or pip' };
      if (!parsed.retry || typeof parsed.retry.confidence !== 'number')
        return { pass: false, reason: 'Must propose a retry with numeric confidence' };
      if (parsed.retry.confidence < 0.8)
        return { pass: false, reason: `Retry confidence should be >= 0.8 for a mechanical fix (got ${parsed.retry.confidence})` };
      return { pass: true };
    },
  },

  // ============================================================
  // 2. CORE: Empty done output
  // ============================================================
  {
    id: 'postmortem-core-empty-done',
    difficulty: 'core',
    inputLength: 'medium',
    temperature: 0.1,
    maxTokens: 2000,
    input: `## Failure Reason
Orchestrator called done with empty input field. No result was produced.

## Original User Request
What's the weather in Tokyo right now?

## Run Transcript
[orchestrator - Step 1]: Received user request about Tokyo weather.
[orchestrator - Step 2]: Thinking about how to get weather data.
[orchestrator - Step 3]: Considering available tools — fetcher, coder, execute.
[orchestrator - Step 4]: Decided the answer is known. Preparing final response.
[orchestrator - Step 5]: Called done with input: ""
Pipeline ended: done was called but the input field was empty. No fetcher or coder was ever invoked. The user question required live data that was never retrieved.`,
    validate(output) {
      const parsed = parsePostmortemJson(output);
      if (!parsed) return { pass: false, reason: 'Output must be valid JSON' };
      if (!parsed.analysis || typeof parsed.analysis !== 'string' || parsed.analysis.length < 10)
        return { pass: false, reason: 'Must have a non-empty "analysis" field' };
      const a = parsed.analysis.toLowerCase();
      if (!(/skip/.test(a) || /never.*(fetch|call|invok|request)/.test(a) || /no.*(fetch|call|invok|request)/.test(a) || /didn.t.*(fetch|call|invok)/.test(a) || /fail.*to.*(fetch|call|invok|retrieve|use)/.test(a) || /missing.*(fetch|step|call)/.test(a)))
        return { pass: false, reason: 'Analysis must identify that the orchestrator skipped the fetch step or never called a tool to get live data' };
      if (parsed.retry && typeof parsed.retry.confidence === 'number' && parsed.retry.confidence >= 0.8)
        return { pass: false, reason: `Retry confidence must be < 0.8 — the orchestrator fundamentally chose wrong, not a mechanical error (got ${parsed.retry.confidence})` };
      return { pass: true };
    },
  },

  // ============================================================
  // 3. APPLIED: Loop cap hit
  // ============================================================
  {
    id: 'postmortem-applied-loop-cap',
    difficulty: 'applied',
    inputLength: 'long',
    temperature: 0.1,
    maxTokens: 2500,
    input: `## Failure Reason
Loop cap hit: 15 iterations reached without resolution.

## Original User Request
Write a Python script that reads a CSV, groups rows by category, and outputs a summary.

## Run Transcript
[orchestrator - Step 1]: Plan — write a CSV grouping script.
[coder - Step 2]: Wrote group_csv.py using pandas.
[execute - Step 3]: FAILED — TypeError: 'DataFrame' object is not callable (line 12: df("category"))
[orchestrator - Step 4]: Error occurred, rewriting script.
[coder - Step 5]: Rewrote group_csv.py — same approach, changed variable names.
[execute - Step 6]: FAILED — TypeError: 'DataFrame' object is not callable (line 14: df("category"))
[orchestrator - Step 7]: Error occurred again, rewriting script.
[coder - Step 8]: Rewrote group_csv.py — added try/except but same core logic.
[execute - Step 9]: FAILED — TypeError: 'DataFrame' object is not callable (line 12: df("category"))
[orchestrator - Step 10]: Rewriting again.
[coder - Step 11]: Rewrote group_csv.py — same df("category") pattern.
[execute - Step 12]: FAILED — TypeError: 'DataFrame' object is not callable
[orchestrator - Step 13]: Rewriting again.
[coder - Step 14]: Rewrote group_csv.py — still uses df("category").
[execute - Step 15]: FAILED — TypeError: 'DataFrame' object is not callable
Pipeline terminated: loop cap of 15 iterations reached. The same error repeated 5 times with no progress.`,
    validate(output) {
      const parsed = parsePostmortemJson(output);
      if (!parsed) return { pass: false, reason: 'Output must be valid JSON' };
      if (!parsed.analysis || typeof parsed.analysis !== 'string' || parsed.analysis.length < 10)
        return { pass: false, reason: 'Must have a non-empty "analysis" field' };
      const a = parsed.analysis.toLowerCase();
      if (!(/loop/.test(a) || /repeat/.test(a) || /same error/.test(a) || /same bug/.test(a) || /same pattern/.test(a) || /stuck/.test(a) || /cycle/.test(a) || /identical/.test(a)))
        return { pass: false, reason: 'Analysis must identify the repeating loop pattern (same error over and over)' };
      if (!parsed.rule || !parsed.rule.trigger)
        return { pass: false, reason: 'Must propose a rule with a trigger about sending errors to debugger instead of blindly rewriting' };
      const ruleTxt = JSON.stringify(parsed.rule).toLowerCase();
      if (!(/debug/.test(ruleTxt) || /different/.test(ruleTxt) || /escalat/.test(ruleTxt) || /analyz/.test(ruleTxt) || /diagnos/.test(ruleTxt) || /stop.*(rewrit|repeat)/.test(ruleTxt)))
        return { pass: false, reason: 'Rule must mention debugging, diagnosing, escalating, or using a different approach instead of rewriting' };
      if (parsed.retry && typeof parsed.retry.confidence === 'number' && parsed.retry.confidence >= 0.8)
        return { pass: false, reason: `Retry confidence must be < 0.8 — needs a different approach, not the same thing again (got ${parsed.retry.confidence})` };
      return { pass: true };
    },
  },

  // ============================================================
  // 4. APPLIED: Guard abort
  // ============================================================
  {
    id: 'postmortem-applied-guard-abort',
    difficulty: 'applied',
    inputLength: 'medium',
    temperature: 0.1,
    maxTokens: 2500,
    input: `## Failure Reason
Preflight guard aborted action: DELETE operation on critical path blocked.

## Original User Request
Clean up the project directory by removing unused files.

## Run Transcript
[orchestrator - Step 1]: Plan — identify unused files, then delete them.
[coder - Step 2]: Wrote cleanup.py that scans for unused imports and temp files.
[execute - Step 3]: Script identified 5 temp files and 2 __pycache__ directories.
[orchestrator - Step 4]: Proceeding to delete identified files.
[coder - Step 5]: Wrote delete_files.py:
\`\`\`python
import shutil, os
targets = ["/app/src/__pycache__", "/app/config/__pycache__", "/app/.env", "/app/tmp/cache_1.dat", "/app/tmp/cache_2.dat", "/app/tmp/session_a.tmp", "/app/tmp/session_b.tmp"]
for t in targets:
    if os.path.isdir(t):
        shutil.rmtree(t)
    else:
        os.remove(t)
print("Cleanup complete")
\`\`\`
[preflight - Step 6]: ABORT — delete_files.py attempts to delete /app/.env which is on the critical path blocklist. This file contains production secrets and must not be removed. Pipeline halted.`,
    validate(output) {
      const parsed = parsePostmortemJson(output);
      if (!parsed) return { pass: false, reason: 'Output must be valid JSON' };
      if (!parsed.analysis || typeof parsed.analysis !== 'string' || parsed.analysis.length < 10)
        return { pass: false, reason: 'Must have a non-empty "analysis" field' };
      const a = parsed.analysis.toLowerCase();
      if (!(/correct/.test(a) || /justified/.test(a) || /right/.test(a) || /proper/.test(a) || /appropriat/.test(a) || /should have/.test(a) || /guard/.test(a) || /blocked/.test(a) || /\.env/.test(a) || /secret/.test(a) || /critical/.test(a)))
        return { pass: false, reason: 'Analysis must identify that the guard abort was correct/justified (e.g., .env is critical, guard was right to block)' };
      if (!parsed.user_prompt)
        return { pass: false, reason: 'Must propose a user_prompt explaining what happened and what the user should decide' };
      if (parsed.retry && typeof parsed.retry.confidence === 'number' && parsed.retry.confidence >= 0.8)
        return { pass: false, reason: `Should NOT propose a high-confidence retry — the guard was right to stop it (got ${parsed.retry.confidence})` };
      return { pass: true };
    },
  },

  // ============================================================
  // 5. EDGE: Failure was in an early step, not the last one
  // ============================================================
  {
    id: 'postmortem-edge-root-cause-tracing',
    difficulty: 'edge',
    inputLength: 'long',
    temperature: 0.1,
    maxTokens: 2500,
    input: `## Failure Reason
json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)

## Original User Request
Get the current Bitcoin price from CoinGecko and format it nicely.

## Run Transcript
[orchestrator - Step 1]: Plan — fetch Bitcoin price from CoinGecko API, parse JSON, format output.
[fetcher - Step 2]: Fetched URL: https://www.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd
Response status: 200
Response body (first 500 chars): <!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>CoinGecko - 404 Not Found</title></head><body><h1>Page Not Found</h1><p>The page you are looking for does not exist.</p></body></html>
Note: The correct API base URL is https://api.coingecko.com not https://www.coingecko.com
[coder - Step 3]: Wrote format_price.py:
\`\`\`python
import json
import sys

data = sys.stdin.read()
parsed = json.loads(data)
price = parsed["bitcoin"]["usd"]
print(f"Bitcoin: \${price:,.2f}")
\`\`\`
[execute - Step 4]: Piped fetcher output to format_price.py
FAILED:
Traceback (most recent call last):
  File "format_price.py", line 4, in <module>
    parsed = json.loads(data)
json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)

The execute step received HTML instead of JSON because the fetcher used the wrong URL.`,
    validate(output) {
      const parsed = parsePostmortemJson(output);
      if (!parsed) return { pass: false, reason: 'Output must be valid JSON' };
      if (!parsed.analysis || typeof parsed.analysis !== 'string' || parsed.analysis.length < 10)
        return { pass: false, reason: 'Must have a non-empty "analysis" field' };
      const a = parsed.analysis.toLowerCase();
      const mentionsJsonErrorOnly = /jsondecodeerror|json\.loads|json parse|parse error/.test(a) || /step (3|4)|coder|format_price/.test(a);
      const tracesBackToFetch = /url/.test(a) || /wrong.*url/.test(a) || /incorrect.*url/.test(a) ||
        /fetch/.test(a) || /step (1|2)/.test(a) || /coingecko\.com/.test(a) || /api\.coingecko/.test(a) ||
        /html/.test(a) || /wrong.*endpoint/.test(a) || /wrong.*base/.test(a) || /404/.test(a) ||
        /not.*json/.test(a) || /returned.*html/.test(a);
      if (!tracesBackToFetch)
        return { pass: false, reason: 'Analysis must trace back to the root cause: the wrong URL or the fetcher returning HTML instead of JSON — not just the JSONDecodeError' };
      return { pass: true };
    },
  },

  // ============================================================
  // 6. WOW: Distinguish fixable failure from fundamental design flaw
  // ============================================================
  {
    id: 'postmortem-wow-design-flaw',
    difficulty: 'wow',
    inputLength: 'long',
    temperature: 0.1,
    maxTokens: 3000,
    input: `## Failure Reason
ModuleNotFoundError: No module named 'websockets'

## Original User Request
Build a real-time dashboard that shows live server metrics (CPU, memory, disk) updating every second.

## Run Transcript
[orchestrator - Step 1]: Plan — build a WebSocket-based real-time dashboard. Architect will design, coder will implement.
[architect - Step 2]: Designed solution:
- Backend: Python WebSocket server using 'websockets' library, pushes metrics every second
- Frontend: HTML + JS with WebSocket client, renders live charts
- Data collection: psutil for system metrics
Architecture requires: websockets, psutil, aiohttp
[coder - Step 3]: Wrote ws_server.py (WebSocket server using asyncio + websockets library)
[coder - Step 4]: Wrote dashboard.html (WebSocket client JS)
[coder - Step 5]: Wrote metrics_collector.py (uses psutil)
[execute - Step 6]: pip install websockets psutil aiohttp
FAILED:
WARNING: pip is configured with no network access.
ERROR: Could not find a version that satisfies the requirement websockets
ERROR: No matching distribution found for websockets
Note: This environment is air-gapped with no internet access. Only stdlib and pre-installed packages are available.
[orchestrator - Step 7]: pip install failed, retrying with --no-index
[execute - Step 8]: pip install --no-index websockets
FAILED:
ERROR: No matching distribution found for websockets
[orchestrator - Step 9]: Trying to install from local cache
[execute - Step 10]: pip install --no-index --find-links=/tmp/pip-cache websockets
FAILED:
ERROR: Directory '/tmp/pip-cache' does not exist or is empty.
Pipeline terminated after 10 steps. Cannot install required dependencies in this environment.

Environment constraints discovered during run:
- No network access (air-gapped)
- No local package cache
- Only Python stdlib and pre-installed packages available
- Pre-installed: flask, sqlite3, csv, http.server (all stdlib or bundled)`,
    validate(output) {
      const parsed = parsePostmortemJson(output);
      if (!parsed) return { pass: false, reason: 'Output must be valid JSON' };
      if (!parsed.analysis || typeof parsed.analysis !== 'string' || parsed.analysis.length < 10)
        return { pass: false, reason: 'Must have a non-empty "analysis" field' };
      const a = parsed.analysis.toLowerCase();
      const recognizesDesignFlaw =
        /architect/.test(a) || /design/.test(a) || /approach/.test(a) || /fundamental/.test(a) ||
        /no.?network/.test(a) || /air.?gap/.test(a) || /offline/.test(a) || /cannot.*install/.test(a) ||
        /environment.*constraint/.test(a) || /environment.*limit/.test(a) || /incompatible/.test(a) ||
        /websocket.*won.?t.*work/.test(a) || /wrong.*choice/.test(a) || /rethink/.test(a) ||
        /different.*approach/.test(a) || /stdlib/.test(a) || /http\.server/.test(a) || /polling/.test(a);
      if (!recognizesDesignFlaw)
        return { pass: false, reason: 'Must recognize this is a fundamental design/architecture problem (air-gapped environment cannot support WebSocket approach), not just a pip install issue' };
      // If it proposes a retry that just does pip install again, it fails
      if (parsed.retry && typeof parsed.retry.confidence === 'number') {
        if (parsed.retry.confidence >= 0.8) {
          const retryTxt = JSON.stringify(parsed.retry).toLowerCase();
          if (/pip install/.test(retryTxt) && !(/http\.server/.test(retryTxt) || /polling/.test(retryTxt) || /stdlib/.test(retryTxt) || /redesign/.test(retryTxt) || /different/.test(retryTxt) || /architect/.test(retryTxt)))
            return { pass: false, reason: 'High-confidence retry that just retries pip install is wrong — pip install is impossible in an air-gapped environment' };
        }
      }
      return { pass: true };
    },
  },

  // ============================================================
  // 7. WOW-2: Identify that the failure was caused by an incorrect assumption in the architect phase
  // ============================================================
  {
    id: 'postmortem-wow-2',
    difficulty: 'wow',
    inputLength: 'long',
    temperature: 0.1,
    maxTokens: 3000,
    input: `## Failure Reason
ConnectionRefusedError: [Errno 111] Connection refused (port 5432)

## Original User Request
Query the PostgreSQL database for all users who signed up in the last 30 days and export to CSV.

## Run Transcript
[architect - Step 1]: Designed solution assuming PostgreSQL is running and accessible on localhost:5432. Plan: connect to DB, run query, export results to CSV. No step was included to verify or start the database.
[planner - Step 2]: Created 3-step plan:
  (a) Write query script using psycopg2
  (b) Execute script to query users table
  (c) Save output as signups_last_30d.csv
Note: No "start PostgreSQL" or "verify PostgreSQL is running" step was included.
[coder - Step 3]: Wrote export_signups.py:
\`\`\`python
import psycopg2
import csv

conn = psycopg2.connect(host="localhost", port=5432, dbname="appdb", user="admin")
cursor = conn.cursor()
cursor.execute("SELECT * FROM users WHERE created_at > NOW() - INTERVAL '30 days'")
rows = cursor.fetchall()
with open("signups_last_30d.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow([desc[0] for desc in cursor.description])
    writer.writerows(rows)
print(f"Exported {len(rows)} rows")
\`\`\`
[execute - Step 4]: FAILED
Traceback (most recent call last):
  File "export_signups.py", line 4, in <module>
    conn = psycopg2.connect(host="localhost", port=5432, dbname="appdb", user="admin")
psycopg2.OperationalError: could not connect to server: Connection refused
    Is the server running on host "localhost" and accepting TCP/IP connections on port 5432?
[orchestrator - Step 5]: Pipeline failed. PostgreSQL was never verified to be running. The architect assumed it would be available but never included a verification or startup step.`,
    validate(output) {
      const parsed = parsePostmortemJson(output);
      if (!parsed) return { pass: false, reason: 'Output must be valid JSON' };
      if (!parsed.analysis || typeof parsed.analysis !== 'string' || parsed.analysis.length < 10)
        return { pass: false, reason: 'Must have a non-empty "analysis" field' };
      const a = parsed.analysis.toLowerCase();
      const tracesToArchitect = /architect|assumption|design|prerequisite|unverified|never.*(check|verif|confirm|start|ensur)|took.*for.*granted|presume/.test(a);
      if (!tracesToArchitect)
        return { pass: false, reason: 'Analysis must trace the root cause to the architect phase or the unverified assumption that PostgreSQL would be running, not just say "database not running"' };
      if (!parsed.rule || !parsed.rule.trigger)
        return { pass: false, reason: 'Must propose a rule with a trigger about verifying runtime dependencies or service availability before coding against them' };
      const ruleTxt = JSON.stringify(parsed.rule).toLowerCase();
      if (!/verif|check|ensure|confirm|running|available|depend|prerequisite|service|runtime/.test(ruleTxt))
        return { pass: false, reason: 'Rule must mention verifying runtime dependencies, checking service availability, or confirming prerequisites before proceeding' };
      return { pass: true };
    },
  },

  // ============================================================
  // 8. WOW-3: Synthesize a generalizable rule from a chain of 3 cascading failures
  // ============================================================
  {
    id: 'postmortem-wow-3',
    difficulty: 'wow',
    inputLength: 'long',
    temperature: 0.1,
    maxTokens: 3000,
    input: `## Failure Reason
Data corruption: output file contains garbage/unusable content.

## Original User Request
Fetch the latest market data from the financial API and update the portfolio spreadsheet.

## Run Transcript
[orchestrator - Step 1]: Plan — fetch market data from API, process it, update portfolio.csv.
[fetcher - Step 2]: Fetching from https://api.marketdata.example/v2/quotes
Response: HTTP 429 Too Many Requests. Rate limit exceeded. Retry-After: 60 seconds.
[orchestrator - Step 3]: Fetch failed with 429. Retrying immediately.
[fetcher - Step 4]: Retry 1 — HTTP 429 Too Many Requests.
[fetcher - Step 5]: Retry 2 — HTTP 429 Too Many Requests.
[fetcher - Step 6]: Retry 3 — HTTP 429 Too Many Requests. Budget warning: 80% of API call budget consumed by retries.
[fetcher - Step 7]: Retry 4 — HTTP 429 Too Many Requests.
[fetcher - Step 8]: Retry 5 — HTTP 429 Too Many Requests. Budget EXHAUSTED. No more API calls available.
[orchestrator - Step 9]: Primary model budget exhausted. Falling back to lightweight model (tiny-llm-v1) to complete the task.
[tiny-llm-v1 - Step 10]: Attempting to generate market data from context. Produced output:
"AAPL: $mumbai, GOOGL: $yes, MSFT: $tomorrow, TSLA: $undefined"
Note: The fallback model is too small to understand financial data. It produced nonsensical output.
[orchestrator - Step 11]: Received output from fallback model. Proceeding to write results.
[execute - Step 12]: Wrote fallback output to portfolio.csv. File now contains:
ticker,price,change
AAPL,$mumbai,N/A
GOOGL,$yes,N/A
MSFT,$tomorrow,N/A
TSLA,$undefined,N/A
[orchestrator - Step 13]: Pipeline completed but portfolio.csv is corrupted with garbage data. Original valid data has been overwritten.

## Cascade Summary
1. Rate limit (429) on the API
2. Aggressive retry burned through the entire API budget without backing off
3. Budget exhaustion forced fallback to an inadequate model
4. Fallback model produced garbage output
5. Garbage output was written to the file, corrupting the user's data`,
    validate(output) {
      const parsed = parsePostmortemJson(output);
      if (!parsed) return { pass: false, reason: 'Output must be valid JSON' };
      if (!parsed.analysis || typeof parsed.analysis !== 'string' || parsed.analysis.length < 10)
        return { pass: false, reason: 'Must have a non-empty "analysis" field' };
      const a = parsed.analysis.toLowerCase();
      // Must identify at least 3 stages of the cascade
      const mentionsRateLimit = /rate.limit|429|too many request|throttl/.test(a);
      const mentionsBudgetRetry = /budget|retry|aggressive|exhaust|burn|back.?off/.test(a);
      const mentionsDataCorruption = /corrupt|garbage|invalid.*output|bad.*data|overwrit|nonsens|unusable|destroy/.test(a);
      const stagesIdentified = [mentionsRateLimit, mentionsBudgetRetry, mentionsDataCorruption].filter(Boolean).length;
      if (stagesIdentified < 3)
        return { pass: false, reason: `Must identify at least 3 stages of the cascade (rate limit, budget/retry exhaustion, data corruption). Only identified ${stagesIdentified} stage(s).` };
      if (!parsed.rule || !parsed.rule.trigger)
        return { pass: false, reason: 'Must propose a rule with a trigger' };
      const ruleTxt = JSON.stringify(parsed.rule).toLowerCase();
      const isGeneralizable = /validat|verif|quality|check.*output|gate|guard|before.*writ|inspect|sanity|never.*write.*without|output.*quality|confirm.*before/.test(ruleTxt) ||
        /destruct|write.*must|must.*valid|must.*verif/.test(ruleTxt);
      if (!isGeneralizable)
        return { pass: false, reason: 'Rule must be generalizable — must mention output quality verification, validation before writes, or gating destructive actions on output checks. Cannot just say "handle 429 errors".' };
      return { pass: true };
    },
  },

  // ============================================================
  // 9. WOW-4: Identify that a failure was caused by an implicit version incompatibility across 3 components
  // ============================================================
  {
    id: "postmortem-wow-4",
    difficulty: "wow",
    inputLength: "long",
    temperature: 0.1,
    maxTokens: 3000,
    input: `## Failure Reason
ImportError: numpy.core.multiarray failed to import

## Original User Request
Analyze the dataset using pandas and scikit-learn to build a classification model.

## Run Transcript
[orchestrator - Step 1]: Plan — install dependencies, write analysis script, execute.
[execute - Step 2]: pip install numpy==2.0.0 -> SUCCESS. Installed numpy 2.0.0.
[execute - Step 3]: pip install pandas==1.5.3 -> SUCCESS. Installed pandas 1.5.3.
Note: pandas 1.5.3 requires numpy>=1.20.3 and numpy<2.0.0. The installer did not downgrade numpy because it was already satisfied by version constraint at install time, but pandas internal C extensions were compiled against numpy<2.0.0 ABI.
[execute - Step 4]: pip install scikit-learn==1.2.0 -> SUCCESS. Installed scikit-learn 1.2.0.
[coder - Step 5]: Wrote analysis.py using pandas DataFrame operations and sklearn classifiers.
[execute - Step 6]: python analysis.py -> FAILED:
Traceback (most recent call last):
  File "analysis.py", line 1, in <module>
    import pandas as pd
  File "pandas/__init__.py", line 22, in <module>
    from pandas.compat import numpy as numpy_compat
ImportError: numpy.core.multiarray failed to import
The numpy 2.0.0 ABI is incompatible with pandas 1.5.3 which was built against numpy<2.0.0.`,
    validate(output) {
      const parsed = parsePostmortemJson(output);
      if (!parsed) return { pass: false, reason: "Output must be valid JSON" };
      if (!parsed.analysis || typeof parsed.analysis !== "string" || parsed.analysis.length < 10)
        return { pass: false, reason: 'Must have a non-empty "analysis" field' };
      const a = parsed.analysis.toLowerCase();
      const mentionsNumpy = /numpy/.test(a);
      const mentionsVersion = /version|compat|conflict|2\.0|incompatib/.test(a);
      const mentionsPandas = /pandas|dependenc/.test(a);
      if (!mentionsNumpy)
        return { pass: false, reason: "Analysis must mention numpy as part of the version conflict" };
      if (!mentionsVersion)
        return { pass: false, reason: "Analysis must mention version incompatibility or conflict, not just say reinstall" };
      if (!mentionsPandas)
        return { pass: false, reason: "Analysis must mention pandas or the dependency chain" };
      // Must not just say "reinstall" without identifying the specific conflict
      const justReinstall = /reinstall/.test(a) && !mentionsVersion;
      if (justReinstall)
        return { pass: false, reason: "Must identify the specific version conflict, not just say reinstall" };
      if (!parsed.rule || !parsed.rule.trigger)
        return { pass: false, reason: "Must propose a rule with a trigger about checking version compatibility" };
      const ruleTxt = JSON.stringify(parsed.rule).toLowerCase();
      if (!/version|compat|conflict|depend|constraint|pin/.test(ruleTxt))
        return { pass: false, reason: "Rule must generalize about checking version compatibility before installing packages" };
      return { pass: true };
    },
  },

  // ============================================================
  // 10. WOW-5: Identify a failure that was actually a success — the guard correctly prevented damage
  // ============================================================
  {
    id: "postmortem-wow-5",
    difficulty: "wow",
    inputLength: "long",
    temperature: 0.1,
    maxTokens: 3000,
    input: `## Failure Reason
Guard abort: preflight blocked the delete operation. Pipeline terminated.

## Original User Request
Delete all temp files in /tmp to free up disk space.

## Run Transcript
[orchestrator - Step 1]: Plan — list files in /tmp, delete temporary files.
[execute - Step 2]: list_dir /tmp -> Found 12 files:
  cache_001.tmp, cache_002.tmp, session_a.tmp, session_b.tmp,
  upload_buffer.dat, render_queue.dat, important_production_backup.sql,
  debug.log, trace.log, metrics_dump.csv, heap_snapshot.bin, core_dump.out
[orchestrator - Step 3]: Proceeding to delete all listed files as temp files.
[execute - Step 4]: delete_file /tmp/cache_001.tmp -> SUCCESS
[execute - Step 5]: delete_file /tmp/cache_002.tmp -> SUCCESS
[execute - Step 6]: delete_file /tmp/important_production_backup.sql
[preflight - Step 7]: ABORT — "important_production_backup.sql" matches pattern for production backup files. Deleting production backups is a catastrophic risk. Operation blocked.
Pipeline terminated with status: guard abort.
The file important_production_backup.sql (2.3 GB) contains the latest production database backup taken 4 hours ago. It was placed in /tmp during a migration operation and had not yet been moved to permanent storage.`,
    validate(output) {
      const parsed = parsePostmortemJson(output);
      if (!parsed) return { pass: false, reason: "Output must be valid JSON" };
      if (!parsed.analysis || typeof parsed.analysis !== "string" || parsed.analysis.length < 10)
        return { pass: false, reason: 'Must have a non-empty "analysis" field' };
      const a = parsed.analysis.toLowerCase();
      const recognizesCorrectGuard = /correct|working as intended|prevented|guard.*right|not.*failure|success|proper|rightly|appropriat|saved|caught/.test(a);
      if (!recognizesCorrectGuard)
        return { pass: false, reason: "Analysis must recognize the guard abort was correct/successful — the system prevented data loss, this is not a failure to fix" };
      if (!parsed.user_prompt)
        return { pass: false, reason: "Must have a user_prompt informing the user about the backup file that was almost deleted" };
      const userMsg = (typeof parsed.user_prompt === "string" ? parsed.user_prompt : JSON.stringify(parsed.user_prompt)).toLowerCase();
      if (!/backup|important_production|production/.test(userMsg))
        return { pass: false, reason: "user_prompt must mention the backup file or production data that was almost deleted" };
      if (parsed.retry && typeof parsed.retry.confidence === "number" && parsed.retry.confidence >= 0.8)
        return { pass: false, reason: "Must NOT propose a high-confidence retry (got " + parsed.retry.confidence + "). Retrying would bypass the guard and delete the production backup. Catastrophic fail." };
      return { pass: true };
    },
  },
];
