function parseOrcJson(output) {
  const clean = output.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try { return JSON.parse(clean); } catch { return null; }
}

module.exports = [
  // 1. Core: Simple lookup — must fetch, not code/done/plan
  {
    name: 'Core: Simple lookup picks fetch',
    input: `The user wants to know the current Bitcoin price.

## Recent Work
[router - Step 1]:
Classification: "question"
The user is asking for real-time data about Bitcoin's current price. This requires fetching live information from an external source.

## Current Task
Decide the next action.`,
    validate(output) {
      const obj = parseOrcJson(output);
      if (!obj) return { pass: false, reason: 'Output is not valid JSON' };
      if (typeof obj.action !== 'string') return { pass: false, reason: 'Missing "action" field (string)' };
      if (obj.action !== 'fetch') return { pass: false, reason: `Expected action "fetch", got "${obj.action}"` };
      return { pass: true };
    }
  },

  // 2. Core: Direct answer — must output done with input containing "4"
  {
    name: 'Core: Direct answer returns done',
    input: `The user asks "What is 2+2?".

## Recent Work
[router - Step 1]:
Classification: "question"
This is a trivial arithmetic question that can be answered directly without any tools or external lookups.

## Current Task
Decide the next action.`,
    validate(output) {
      const obj = parseOrcJson(output);
      if (!obj) return { pass: false, reason: 'Output is not valid JSON' };
      if (typeof obj.action !== 'string') return { pass: false, reason: 'Missing "action" field (string)' };
      if (obj.action !== 'done') return { pass: false, reason: `Expected action "done", got "${obj.action}"` };
      if (typeof obj.input !== 'string' || !obj.input.includes('4')) return { pass: false, reason: 'Action is "done" but "input" field does not contain "4"' };
      return { pass: true };
    }
  },

  // 3. Applied: Code task needs execution — code already written, must execute
  {
    name: 'Applied: Code exists so pick execute',
    input: `The user asked to write a Python function that sorts a list using merge sort.

## Recent Work
[router - Step 1]:
Classification: "code_task"
The user wants a Python merge sort implementation.

[coder - Step 2]:
\`\`\`python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

print(merge_sort([38, 27, 43, 3, 9, 82, 10]))
\`\`\`

## Current Task
Decide the next action.`,
    validate(output) {
      const obj = parseOrcJson(output);
      if (!obj) return { pass: false, reason: 'Output is not valid JSON' };
      if (typeof obj.action !== 'string') return { pass: false, reason: 'Missing "action" field (string)' };
      if (obj.action !== 'execute') return { pass: false, reason: `Expected action "execute", got "${obj.action}"` };
      return { pass: true };
    }
  },

  // 4. Applied: Project needs architect first
  {
    name: 'Applied: Project starts with architect',
    input: `The user wants to build a real-time chat system with WebSocket support, user authentication, message persistence, and typing indicators.

## Recent Work
[router - Step 1]:
Classification: "project"
This is a multi-component software project requiring architecture design, planning, and implementation across multiple files and technologies.

## Current Task
Decide the next action.`,
    validate(output) {
      const obj = parseOrcJson(output);
      if (!obj) return { pass: false, reason: 'Output is not valid JSON' };
      if (typeof obj.action !== 'string') return { pass: false, reason: 'Missing "action" field (string)' };
      if (obj.action !== 'architect') return { pass: false, reason: `Expected action "architect", got "${obj.action}"` };
      return { pass: true };
    }
  },

  // 5. Edge: Don't fetch when browse is needed — JS-rendered page needs a real browser
  {
    name: 'Edge: JS-rendered page needs browse not fetch',
    input: `The user asks "What does the homepage of news.ycombinator.com look like right now?".

## Recent Work
[router - Step 1]:
Classification: "research"
The user wants to visually inspect a live webpage. This requires rendering the page in a browser to see the current state of the UI, layout, and dynamic content.

## Current Task
Decide the next action.`,
    validate(output) {
      const obj = parseOrcJson(output);
      if (!obj) return { pass: false, reason: 'Output is not valid JSON' };
      if (typeof obj.action !== 'string') return { pass: false, reason: 'Missing "action" field (string)' };
      const valid = ['browse', 'browser_agent'];
      if (!valid.includes(obj.action)) return { pass: false, reason: `Expected action "browse" or "browser_agent", got "${obj.action}"` };
      return { pass: true };
    }
  },

  // 6. WOW: Failed execution needs debug, NOT rewrite
  {
    name: 'WOW: Failed execute sends to debug not code',
    input: `The user asked to build a web scraper that extracts article titles and summaries from a news website.

## Recent Work
[router - Step 1]:
Classification: "project"
Multi-step coding project requiring architecture, planning, and implementation.

[architect - Step 2]:
Architecture: Single Python script using requests + BeautifulSoup. Target URL passed as CLI arg. Output as JSON. Components: fetcher module, parser module, main entry point.

[planner - Step 3]:
Plan:
1. Create scraper.py with argument parsing
2. Implement fetch_page(url) using requests
3. Implement parse_articles(html) using BeautifulSoup
4. Wire up main() to fetch, parse, and output JSON
5. Add error handling for network failures

[coder - Step 4]:
\`\`\`python
import requests
from bs4 import BeautifulSoup
import json
import sys

def fetch_page(url):
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    return response.text

def parse_articles(html):
    soup = BeautifulSoup(html, 'html.parser')
    articles = []
    for item in soup.find('div', class_='articles-container').find_all('article'):
        title = item.find('h2').text.strip()
        summary = item.find('p', class_='summary').text.strip()
        articles.append({'title': title, 'summary': summary})
    return articles

def main():
    if len(sys.argv) < 2:
        print("Usage: python scraper.py <url>")
        sys.exit(1)
    url = sys.argv[1]
    html = fetch_page(url)
    articles = parse_articles(html)
    print(json.dumps(articles, indent=2))

if __name__ == '__main__':
    main()
\`\`\`

[execute - Step 5]:
EXIT CODE: 1
STDERR:
Traceback (most recent call last):
  File "scraper.py", line 23, in parse_articles
    for item in soup.find('div', class_='articles-container').find_all('article'):
AttributeError: 'NoneType' object has no attribute 'find_all'

The div with class 'articles-container' was not found on the page, causing soup.find() to return None. Line 23 then tried to call .find_all() on None.

## Current Task
Decide the next action.`,
    validate(output) {
      const obj = parseOrcJson(output);
      if (!obj) return { pass: false, reason: 'Output is not valid JSON' };
      if (typeof obj.action !== 'string') return { pass: false, reason: 'Missing "action" field (string)' };
      if (obj.action === 'code') return { pass: false, reason: 'Got action "code" — orchestrator must send errors to "debug" for surgical fix, not rewrite via "code"' };
      if (obj.action !== 'debug') return { pass: false, reason: `Expected action "debug", got "${obj.action}"` };
      return { pass: true };
    }
  },

  // 7. WOW-2: Must parallelize independent reviews instead of sequential
  {
    id: 'orchestrator-wow-2',
    name: 'WOW-2: Must parallelize independent reviews instead of sequential',
    difficulty: 'wow',
    input: `The user asked to build a web app with authentication and a REST API.

## Recent Work
[router - Step 1]:
Classification: "project"
Multi-component web application requiring architecture, planning, and implementation of auth and API modules.

[architect - Step 2]:
Architecture:
- auth.js: Express middleware handling JWT-based authentication (login, register, token refresh, session management). Standalone module with no dependency on api.js.
- api.js: REST API endpoints for CRUD operations on user data and resources. Standalone module with no dependency on auth.js.
- server.js: Entry point that wires auth and api together with Express.
Note: auth.js and api.js are fully independent modules that do not import or reference each other. They are composed only at the server.js level.

[planner - Step 3]:
Plan:
1. Code auth.js (JWT middleware, login/register routes)
2. Code api.js (CRUD endpoints, validation, error handling)
3. Review auth.js
4. Review api.js
5. Code server.js to integrate both
6. Execute and test

[coder - Step 4]:
File: auth.js
\`\`\`javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

const users = new Map();
const SECRET = process.env.JWT_SECRET || 'dev-secret';

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (users.has(username)) return res.status(409).json({ error: 'User exists' });
  const hash = await bcrypt.hash(password, 10);
  users.set(username, { username, hash });
  res.status(201).json({ message: 'Registered' });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.get(username);
  if (!user || !(await bcrypt.compare(password, user.hash)))
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

module.exports = { router, authenticateToken };
\`\`\`

[coder - Step 5]:
File: api.js
\`\`\`javascript
const express = require('express');
const router = express.Router();

const resources = new Map();
let nextId = 1;

router.get('/resources', (req, res) => {
  res.json([...resources.values()]);
});

router.post('/resources', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const id = nextId++;
  const resource = { id, name, description: description || '', createdBy: req.user.username };
  resources.set(id, resource);
  res.status(201).json(resource);
});

router.put('/resources/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const existing = resources.get(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  if (existing.createdBy !== req.user.username) return res.status(403).json({ error: 'Forbidden' });
  Object.assign(existing, req.body, { id, createdBy: existing.createdBy });
  res.json(existing);
});

router.delete('/resources/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (!resources.has(id)) return res.status(404).json({ error: 'Not found' });
  resources.delete(id);
  res.sendStatus(204);
});

module.exports = router;
\`\`\`

## Current Task
Both auth.js and api.js are coded. Neither has been reviewed yet. They are independent modules with no shared dependencies. Decide the next action.`,
    validate(output) {
      const obj = parseOrcJson(output);
      if (!obj) return { pass: false, reason: 'Output is not valid JSON' };
      if (typeof obj.action !== 'string') return { pass: false, reason: 'Missing "action" field (string)' };
      if (obj.action === 'review') return { pass: false, reason: 'Got single "review" — auth.js and api.js are independent and must be reviewed in parallel, not sequentially' };
      if (obj.action !== 'parallel') return { pass: false, reason: `Expected action "parallel" to review both modules concurrently, got "${obj.action}"` };
      if (!Array.isArray(obj.steps)) return { pass: false, reason: 'Action is "parallel" but missing "steps" array' };
      if (obj.steps.length < 2) return { pass: false, reason: `"steps" array has ${obj.steps.length} item(s), need at least 2 parallel review actions` };
      const reviewSteps = obj.steps.filter(s => s && (s.action === 'review' || s.agent === 'review' || (typeof s === 'string' && s.includes('review'))));
      if (reviewSteps.length < 2) return { pass: false, reason: `Found ${reviewSteps.length} review step(s) in "steps", need at least 2 (one for auth.js, one for api.js)` };
      return { pass: true };
    }
  },

  // 8. WOW-3: Contradictory scratchpad — must detect stale data and re-fetch
  {
    id: 'orchestrator-wow-3',
    name: 'WOW-3: Contradictory scratchpad — must detect stale data and re-fetch',
    difficulty: 'wow',
    input: `The user asked: "Build me a crypto portfolio dashboard and show the current Bitcoin price on it."

## Recent Work
[router - Step 1]:
Classification: "project"
Multi-step project: build a dashboard UI and integrate live crypto data.

[fetch - Step 2]:
Timestamp: 2025-06-14T09:12:00Z
Source: CoinGecko API
Result: { "bitcoin": { "usd": 67432, "last_updated_at": "2025-06-14T09:11:48Z" } }
Bitcoin price: $67,432.00 as of 2025-06-14 09:12 UTC.

[architect - Step 3]:
Architecture: Single-page dashboard using vanilla HTML/CSS/JS. Components: price display widget, portfolio table, chart placeholder. Data fetched via CoinGecko public API.

[planner - Step 4]:
Plan:
1. Fetch current Bitcoin price (done in Step 2)
2. Design dashboard layout (HTML/CSS)
3. Code price display widget
4. Code portfolio holdings table
5. Add chart placeholder with mock data
6. Wire up and test

[coder - Step 5]:
File: index.html — Dashboard layout with header, grid layout for widgets, portfolio table, chart area. Complete HTML/CSS scaffold.

[coder - Step 6]:
File: portfolio.js — Portfolio table component, reads holdings from localStorage, calculates totals, renders table rows.

[coder - Step 7]:
File: chart.js — Chart placeholder using canvas element, draws mock sine wave data as placeholder for future real chart integration.

[user - Step 8]:
"Now display the current Bitcoin price on the dashboard."

## Current Task
The user wants the current Bitcoin price displayed. The scratchpad has a Bitcoin price from Step 2, but that fetch was performed at 2025-06-14T09:12:00Z — over 3 hours ago (current time: 2025-06-14T12:34:00Z). Crypto prices are highly volatile. Decide the next action.`,
    validate(output) {
      const obj = parseOrcJson(output);
      if (!obj) return { pass: false, reason: 'Output is not valid JSON' };
      if (typeof obj.action !== 'string') return { pass: false, reason: 'Missing "action" field (string)' };
      if (obj.action === 'done') return { pass: false, reason: 'Got "done" — the orchestrator used the stale $67,432 price from 3+ hours ago instead of recognizing it is outdated and re-fetching' };
      if (obj.action === 'code') return { pass: false, reason: 'Got "code" — the orchestrator is coding with stale price data from 3+ hours ago instead of re-fetching current price first' };
      if (obj.action !== 'fetch') return { pass: false, reason: `Expected action "fetch" to get fresh Bitcoin price (Step 2 data is 3+ hours stale), got "${obj.action}"` };
      return { pass: true };
    }
  },

  // 9. WOW-4: Must recognize a completed task with implicit done condition
  {
    id: 'orchestrator-wow-4',
    name: 'WOW-4: Must recognize a completed task with implicit done condition',
    difficulty: 'wow',
    input: `The user asked: "Is my server running?"

## Recent Work
[router - Step 1]:
Classification: "question"
The user wants to know if their server is currently operational. This requires checking service status and connectivity.

[service_status - Step 2]:
Target: nginx
Result: nginx is active (running) since 3 days ago. Uptime: 72h 14m. CPU: 0.2%, Memory: 48MB. 0 errors in the last 24h. Workers: 4/4 healthy.

[check_port - Step 3]:
Host: localhost
Results:
  - port 80 (HTTP): OPEN, accepting connections, response time 1ms
  - port 443 (HTTPS): OPEN, accepting connections, TLS handshake OK, response time 2ms

## Current Task
The scratchpad fully answers the user's question: nginx is active and running for 3 days with zero errors, and both HTTP/HTTPS ports are open and responding. Decide the next action.`,
    validate(output) {
      const obj = parseOrcJson(output);
      if (!obj) return { pass: false, reason: 'Output is not valid JSON' };
      if (typeof obj.action !== 'string') return { pass: false, reason: 'Missing "action" field (string)' };
      if (obj.action !== 'done') return { pass: false, reason: `Expected action "done" — the question is fully answered by the scratchpad, but got "${obj.action}" (over-doing it)` };
      if (typeof obj.input !== 'string') return { pass: false, reason: 'Action is "done" but missing "input" field (string) with the summarized answer' };
      const lower = obj.input.toLowerCase();
      if (!lower.includes('running') && !lower.includes('active')) return { pass: false, reason: 'Action is "done" but "input" does not contain "running" or "active" — must summarize the answer' };
      return { pass: true };
    }
  },

  // 10. WOW-5: Must chain 3 tool results to deduce the correct next action via inference
  {
    id: 'orchestrator-wow-5',
    name: 'WOW-5: Must chain 3 tool results to deduce the correct next action via inference',
    difficulty: 'wow',
    input: `The user asked: "Deploy my app to production."

## Recent Work
[router - Step 1]:
Classification: "project"
The user wants to deploy their application. This requires understanding the project structure, build process, and deployment steps.

[read_file - Step 2]:
File: package.json
\`\`\`json
{
  "name": "user-api-service",
  "version": "2.1.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc && esbuild src/index.ts --bundle --platform=node --outfile=dist/index.js",
    "start": "node dist/index.js",
    "deploy": "npm run build && scp -r dist/ prod-server:/app/"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "esbuild": "^0.19.11"
  }
}
\`\`\`

[list_dir - Step 3]:
Directory: ./ (project root)
Contents:
  src/
    index.ts
    routes/
    middleware/
    db/
  package.json
  tsconfig.json
  node_modules/
  .env
  README.md

Note: There is NO dist/ directory present in the project root.

[read_file - Step 4]:
File: tsconfig.json
\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true
  },
  "include": ["src/**/*"]
}
\`\`\`

## Current Task
The scratchpad shows: package.json entry point is dist/index.js, but dist/ does not exist. A build script ("tsc && esbuild ...") is available. The app cannot be deployed without building first. Decide the next action.`,
    validate(output) {
      const obj = parseOrcJson(output);
      if (!obj) return { pass: false, reason: 'Output is not valid JSON' };
      if (typeof obj.action !== 'string') return { pass: false, reason: 'Missing "action" field (string)' };
      if (obj.action === 'read_file' || obj.action === 'list_dir') return { pass: false, reason: `Got "${obj.action}" — the orchestrator is re-reading files instead of acting on information already in the scratchpad` };
      if (obj.action === 'deploy') return { pass: false, reason: 'Got "deploy" — cannot deploy without building first, dist/ directory does not exist' };
      if (obj.action === 'done') return { pass: false, reason: 'Got "done" — the app has not been deployed yet, dist/ needs to be built first' };
      if (obj.action !== 'execute') return { pass: false, reason: `Expected action "execute" to run the build step, got "${obj.action}"` };
      if (typeof obj.input !== 'string') return { pass: false, reason: 'Action is "execute" but missing "input" field with the build command' };
      const lower = obj.input.toLowerCase();
      if (!lower.includes('build') && !lower.includes('tsc') && !lower.includes('esbuild') && !lower.includes('npm run build')) return { pass: false, reason: `Action is "execute" but "input" ("${obj.input}") does not contain a build command (expected "build", "tsc", "esbuild", or "npm run build")` };
      return { pass: true };
    }
  }
];
