module.exports = [
  // ============================================================
  // 1. CORE: Missing import
  // ============================================================
  {
    id: 'debugger-core-missing-import',
    difficulty: 'core',
    inputLength: 'short',
    temperature: 0.1,
    maxTokens: 1500,
    input: `The following Python script crashes on startup. Identify the root cause and provide a minimal fix.

Error:
\`\`\`
Traceback (most recent call last):
  File "parser.py", line 9, in <module>
    result = parse_config("config.json")
  File "parser.py", line 5, in parse_config
    data = json.loads(text)
NameError: name 'json' is not defined
\`\`\`

Source:
\`\`\`python
# parser.py
def parse_config(filepath):
    with open(filepath, "r") as f:
        text = f.read()
    data = json.loads(text)
    return data

def get_setting(config, key, default=None):
    return config.get(key, default)

if __name__ == "__main__":
    result = parse_config("config.json")
    print(f"Loaded {len(result)} keys")
\`\`\``,
    validate(output) {
      const o = output.toLowerCase();
      if (!o.includes('import json'))
        return { pass: false, reason: 'Must mention "import json" as the fix' };
      return { pass: true };
    },
  },

  // ============================================================
  // 2. CORE: Wrong method (missing parentheses)
  // ============================================================
  {
    id: 'debugger-core-wrong-method',
    difficulty: 'core',
    inputLength: 'short',
    temperature: 0.1,
    maxTokens: 1500,
    input: `This Node.js code crashes when fetching data from an API. Identify the root cause and provide a minimal fix.

Error:
\`\`\`
TypeError: response.json is not a function
    at fetchUser (/app/api.js:5:34)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at main (/app/api.js:11:20)
\`\`\`

Source:
\`\`\`javascript
// api.js
const fetch = require('node-fetch');

async function fetchUser(id) {
  const response = await fetch(\`https://api.example.com/users/\${id}\`);
  const data = response.json;   // line 5
  return data;
}

async function main() {
  try {
    const user = await fetchUser(42);
    console.log("User:", user.name);
  } catch (err) {
    console.error(err);
  }
}

main();
\`\`\``,
    validate(output) {
      const o = output.toLowerCase();
      const mentionsParens = o.includes('()') || o.includes('call') || o.includes('invoke') || o.includes('function');
      const mentionsJson = o.includes('response.json()') || o.includes('.json()');
      if (!mentionsParens && !mentionsJson)
        return { pass: false, reason: 'Must identify missing parentheses on response.json — needs () to call it' };
      return { pass: true };
    },
  },

  // ============================================================
  // 3. APPLIED: Off-by-one (range starts at 1 instead of 0)
  // ============================================================
  {
    id: 'debugger-applied-off-by-one',
    difficulty: 'applied',
    inputLength: 'medium',
    temperature: 0.1,
    maxTokens: 2000,
    input: `This Python script processes a list of records but the first item is always missing from the output. There is no crash or traceback — it just silently skips the first record every time. Find the bug and provide a minimal fix.

Reported behavior:
- Input: ["alice", "bob", "carol"]
- Expected output: "Processed: alice, bob, carol"
- Actual output: "Processed: bob, carol"

Source:
\`\`\`python
# process_records.py
import sys

def load_data(filename):
    with open(filename) as f:
        lines = [line.strip() for line in f if line.strip()]
    return lines

def process(data):
    results = []
    for i in range(1, len(data)):
        item = data[i]
        results.append(item.title())
    return results

def format_output(results):
    return "Processed: " + ", ".join(results)

if __name__ == "__main__":
    filename = sys.argv[1] if len(sys.argv) > 1 else "records.txt"
    data = load_data(filename)
    results = process(data)
    print(format_output(results))
\`\`\``,
    validate(output) {
      const o = output.toLowerCase();
      const mentionsFix =
        o.includes('range(0') ||
        o.includes('range(len') ||
        o.includes('starts at 1') ||
        o.includes('skips first') ||
        o.includes('skips the first') ||
        o.includes('off-by-one') ||
        o.includes('off by one') ||
        o.includes('index 0') ||
        o.includes('start at 0') ||
        o.includes('begin at 0') ||
        o.includes('should be 0') ||
        o.includes('for item in data');
      if (!mentionsFix)
        return { pass: false, reason: 'Must identify that range starts at 1 instead of 0, skipping the first element' };
      return { pass: true };
    },
  },

  // ============================================================
  // 4. APPLIED: Type error from CSV string data
  // ============================================================
  {
    id: 'debugger-applied-type-error',
    difficulty: 'applied',
    inputLength: 'medium',
    temperature: 0.1,
    maxTokens: 2000,
    input: `This Python script reads prices from a CSV and tries to sum them, but crashes. Identify the root cause and provide a minimal fix.

Error:
\`\`\`
Traceback (most recent call last):
  File "totals.py", line 19, in <module>
    result = calculate_total("sales.csv")
  File "totals.py", line 14, in calculate_total
    total = sum(prices)
TypeError: unsupported operand type(s) for +: 'int' and 'str'
\`\`\`

Source:
\`\`\`python
# totals.py
import csv

def read_prices(filename):
    prices = []
    with open(filename, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            prices.append(row["price"])
    return prices

def calculate_total(filename):
    prices = read_prices(filename)
    total = sum(prices)
    return round(total, 2)

def format_total(amount):
    return f"\${amount:,.2f}"

if __name__ == "__main__":
    result = calculate_total("sales.csv")
    print(format_total(result))
\`\`\`

Sample CSV (sales.csv):
\`\`\`
item,price
Widget,9.99
Gadget,24.50
Doohickey,4.75
\`\`\``,
    validate(output) {
      const o = output.toLowerCase();
      const mentionsConversion =
        o.includes('int(') ||
        o.includes('float(') ||
        o.includes('type conversion') ||
        o.includes('convert') ||
        o.includes('cast') ||
        o.includes('string') ||
        (o.includes('str') && o.includes('price'));
      if (!mentionsConversion)
        return { pass: false, reason: 'Must identify that CSV prices are strings and need conversion to int/float' };
      return { pass: true };
    },
  },

  // ============================================================
  // 5. EDGE: Misleading error — real bug is wrong parse method
  // ============================================================
  {
    id: 'debugger-edge-misleading-error',
    difficulty: 'edge',
    inputLength: 'medium',
    temperature: 0.1,
    maxTokens: 2000,
    input: `This Python script crashes with a KeyError, but the suggested fix of adding a key check doesn't solve it. Something deeper is wrong. Find the REAL root cause.

Error:
\`\`\`
Traceback (most recent call last):
  File "user_service.py", line 18, in <module>
    display_user(1)
  File "user_service.py", line 15, in display_user
    email = user["email"]
TypeError: string indices must be integers, not 'str'
\`\`\`

Source:
\`\`\`python
# user_service.py
import requests

def fetch_user(user_id):
    url = f"https://api.example.com/users/{user_id}"
    response = requests.get(url)
    if response.status_code != 200:
        raise RuntimeError(f"API error: {response.status_code}")
    user = response.text        # line 8
    return user

def display_user(user_id):
    user = fetch_user(user_id)
    name = user["name"]         # line 13
    email = user["email"]       # line 14 — crashes here
    phone = user.get("phone", "N/A")
    print(f"{name} <{email}> | Phone: {phone}")

if __name__ == "__main__":
    display_user(1)
\`\`\`

A previous developer tried adding \`if "email" in user:\` on line 14 but it still crashes with the same error.`,
    validate(output) {
      const o = output.toLowerCase();
      const identifiesRealCause =
        o.includes('response.json()') ||
        o.includes('.json()') ||
        o.includes('response.text') ||
        o.includes('line 8') ||
        (o.includes('string') && o.includes('not a dict')) ||
        (o.includes('string') && o.includes('not a dictionary')) ||
        (o.includes('text') && o.includes('json')) ||
        o.includes('parsed as') ||
        o.includes('parse the response');
      const justSymptomFix =
        o.includes('.get("email"') &&
        !identifiesRealCause;
      if (justSymptomFix)
        return { pass: false, reason: 'Only addresses the symptom (missing key) not the root cause (response.text instead of response.json())' };
      if (!identifiesRealCause)
        return { pass: false, reason: 'Must identify that the real bug is on line 8: response.text returns a string, should be response.json()' };
      return { pass: true };
    },
  },

  // ============================================================
  // 6. WOW: Variable shadowing — loop var overwrites accumulator
  // ============================================================
  {
    id: 'debugger-wow-variable-shadowing',
    difficulty: 'wow',
    inputLength: 'medium',
    temperature: 0.1,
    maxTokens: 2000,
    input: `This Python code produces the wrong total. No crash, no error — just a silently incorrect result. The expected total is 30 but the output is "Total: 21". Why?

Output:
\`\`\`
Total: 21
\`\`\`

Expected:
\`\`\`
Total: 30
\`\`\`

Source:
\`\`\`python
# cart.py
def calculate_cart_total(items):
    total = 0
    for total in range(len(items)):
        total += items[total]["price"]
    print(f"Total: {total}")
    return total

if __name__ == "__main__":
    items = [
        {"name": "Widget A", "price": 10},
        {"name": "Widget B", "price": 20},
    ]
    result = calculate_cart_total(items)
\`\`\``,
    validate(output) {
      const o = output.toLowerCase();
      const identifiesShadowing =
        o.includes('shadow') ||
        o.includes('loop variable') ||
        o.includes('reuse') ||
        o.includes('overwrite') ||
        o.includes('overwritten') ||
        o.includes('same variable') ||
        o.includes('both the loop') ||
        o.includes('used as both') ||
        (o.includes('for total') && o.includes('accumulator')) ||
        (o.includes('loop') && o.includes('total') && (o.includes('conflict') || o.includes('collide') || o.includes('clash')));
      const suggestsFix =
        o.includes(' i ') ||
        o.includes(' i,') ||
        o.includes('for i in') ||
        o.includes('for idx') ||
        o.includes('for index') ||
        o.includes('rename') ||
        o.includes('different variable') ||
        o.includes('different name') ||
        o.includes('enumerate');
      if (!identifiesShadowing)
        return { pass: false, reason: 'Must identify that "total" is used as both the loop variable and the accumulator (variable shadowing)' };
      if (!suggestsFix)
        return { pass: false, reason: 'Must suggest using a different loop variable name (i, idx, index, etc.)' };
      return { pass: true };
    },
  },

  // ============================================================
  // 7. WOW-2: Closure over mutable default argument
  // ============================================================
  {
    id: 'debugger-wow-2',
    difficulty: 'wow',
    inputLength: 'medium',
    temperature: 0.1,
    maxTokens: 2000,
    input: `This Python function behaves unexpectedly across multiple calls. There is no crash — it just returns wrong results after the first call. Find the root cause and provide a minimal fix.

Reported behavior:
- \`add_item("a")\` returns \`['a']\` — correct
- \`add_item("b")\` returns \`['a', 'b']\` — expected \`['b']\`
- \`add_item("c")\` returns \`['a', 'b', 'c']\` — expected \`['c']\`

The user says: "First call returns ['a'], but second call returns ['a', 'b'] even though I'm not passing the items parameter."

Source:
\`\`\`python
def add_item(item, items=[]):
    items.append(item)
    return items

# Three calls:
print(add_item("a"))  # ['a']
print(add_item("b"))  # ['a', 'b']  — why?
print(add_item("c"))  # ['a', 'b', 'c'] — why?
\`\`\``,
    validate(output) {
      const o = output.toLowerCase();
      const identifiesCause =
        /mutable.?default/i.test(output) ||
        /default.?argument/i.test(output) ||
        /shared.{0,20}list/i.test(output) ||
        /default.{0,20}mutable/i.test(output) ||
        (o.includes('default') && o.includes('evaluated once')) ||
        (o.includes('default') && o.includes('same list')) ||
        (o.includes('default') && o.includes('shared'));
      const suggestsFix =
        o.includes('items=none') ||
        o.includes('items = none') ||
        (o.includes('none') && o.includes('if items is none'));
      if (!identifiesCause)
        return { pass: false, reason: 'Must identify mutable default argument as the root cause (e.g. "mutable default", "default argument", "shared list")' };
      if (!suggestsFix)
        return { pass: false, reason: 'Must suggest fix using None as default: items=None then if items is None: items = []' };
      return { pass: true };
    },
  },

  // ============================================================
  // 8. WOW-3: Floating-point comparison bug
  // ============================================================
  {
    id: 'debugger-wow-3',
    difficulty: 'wow',
    inputLength: 'medium',
    temperature: 0.1,
    maxTokens: 2000,
    input: `This Python function works most of the time but intermittently produces wrong results. There is no crash — it just sometimes returns 0 when it should return a discount. Find the root cause and provide a minimal fix.

Reported behavior:
- \`calculate_discount([50.0, 50.0])\` returns \`10.0\` — correct
- \`calculate_discount([33.33, 33.33, 33.34])\` returns \`0\` — expected \`10.0\`

The user says: "Sometimes \`calculate_discount([33.33, 33.33, 33.34])\` returns 0 instead of 10.0, even though those prices clearly sum to 100.00."

Source:
\`\`\`python
def calculate_discount(prices):
    total = sum(prices)
    if total == 100.0:
        return total * 0.10  # 10% discount for exactly $100
    return 0

# Works:
print(calculate_discount([50.0, 50.0]))           # 10.0

# Fails:
print(calculate_discount([33.33, 33.33, 33.34]))  # 0 — should be 10.0
\`\`\`

The bug is intermittent — some price combinations work, others don't, even when they clearly add up to 100.`,
    validate(output) {
      const o = output.toLowerCase();
      const identifiesCause =
        /floating.?point/i.test(output) ||
        /float.{0,20}precision/i.test(output) ||
        /float.{0,20}comparison/i.test(output) ||
        /ieee/i.test(output) ||
        /epsilon/i.test(output) ||
        (o.includes('float') && o.includes('exact')) ||
        (o.includes('floating') && o.includes('equal')) ||
        /representation.{0,30}error/i.test(output) ||
        /rounding.{0,20}error/i.test(output);
      const suggestsFix =
        /abs\(.{0,30}epsilon/i.test(output) ||
        o.includes('math.isclose') ||
        o.includes('decimal.decimal') ||
        o.includes('isclose') ||
        (o.includes('abs(') && o.includes('< ')) ||
        o.includes('tolerance') ||
        /round\(.{0,20}total/i.test(output);
      if (!identifiesCause)
        return { pass: false, reason: 'Must identify floating-point precision as the root cause (e.g. "floating point", "float precision", "IEEE", "epsilon")' };
      if (!suggestsFix)
        return { pass: false, reason: 'Must suggest fix using abs(total - 100.0) < epsilon, math.isclose, decimal.Decimal, or rounding' };
      return { pass: true };
    },
  },

  // ============================================================
  // 9. WOW-4: GIL-related concurrency bug under load
  // ============================================================
  {
    id: "debugger-wow-4",
    difficulty: "wow",
    inputLength: "medium",
    temperature: 0.1,
    maxTokens: 2000,
    input: `This Python code uses threading for parallel HTTP requests. Under low load it works fine, but under high load (100+ threads) results are silently wrong — some responses get assigned to the wrong request. Find the root cause and provide a fix.

Reported behavior:
- With 5 threads: all results correct
- With 100+ threads: some results[i] contain data from a different URL than expected

Source:
\`\`\`python
import threading, requests

results = {}

def fetch(url, key):
    response = requests.get(url)
    results[key] = response.text

threads = []
for i in range(100):
    url = f"https://api.example.com/item/{i}"
    t = threading.Thread(target=fetch, args=(url, i))
    threads.append(t)
    t.start()
for t in threads:
    t.join()
\`\`\`

User reports: "Some results[i] contain data from a different URL than expected, but only when running 100+ requests."`,
    validate(output) {
      const o = output.toLowerCase();
      const identifiesCause =
        /shared.{0,30}(mutable|state|dict)/i.test(output) ||
        /thread.{0,20}safe/i.test(output) ||
        o.includes("lock") ||
        /synchroniz/i.test(output) ||
        o.includes("concurrent.futures") ||
        o.includes("threadpool");
      const justErrorHandling =
        !identifiesCause &&
        o.includes("try") &&
        o.includes("except");
      if (justErrorHandling)
        return { pass: false, reason: "Only suggests error handling (try/except) — the issue is concurrency, not error handling" };
      if (!identifiesCause)
        return { pass: false, reason: "Must mention shared/mutable state, thread safety, Lock, synchronization, concurrent.futures, or ThreadPool" };
      return { pass: true };
    },
  },

  // ============================================================
  // 10. WOW-5: Integer interning boundary bug
  // ============================================================
  {
    id: "debugger-wow-5",
    difficulty: "wow",
    inputLength: "medium",
    temperature: 0.1,
    maxTokens: 2000,
    input: `This Python function works in unit tests but randomly returns False in production for IDs over 256. Find the root cause and provide a fix.

Reported behavior:
- \`check_cache_hit(42, 42)\` returns True — correct
- \`check_cache_hit(100, 100)\` returns True — correct
- \`check_cache_hit(500, 500)\` returns False sometimes — expected True

User reports: "check_cache_hit works in unit tests but randomly returns False in production for IDs over 256."

Source:
\`\`\`python
def check_cache_hit(expected_id, actual_id):
    return expected_id is actual_id

# Works fine in tests:
assert check_cache_hit(42, 42) == True    # passes
assert check_cache_hit(100, 100) == True  # passes

# Fails in production:
# check_cache_hit(500, 500) returns False sometimes
\`\`\``,
    validate(output) {
      const o = output.toLowerCase();
      const identifiesCause =
        o.includes("intern") ||
        /is.{0,20}==|==.{0,20}is/.test(o) ||
        /identity.{0,20}equality|equality.{0,20}identity/.test(o) ||
        o.includes("256") ||
        /cache.{0,20}integer/.test(o) ||
        /small.{0,20}integer/.test(o) ||
        /object.{0,20}identity/.test(o);
      const recommendsEq = o.includes("==");
      const justSaysIsChecksIdentity =
        o.includes("is checks identity") &&
        !o.includes("intern") &&
        !o.includes("256") &&
        !o.includes("small integer") &&
        !o.includes("cached");
      if (justSaysIsChecksIdentity)
        return { pass: false, reason: "Says 'is checks identity' without explaining the interning boundary — must mention integer interning or the 256 boundary" };
      if (!identifiesCause)
        return { pass: false, reason: "Must mention integer interning, identity vs equality, 256 boundary, small integer cache, or object identity" };
      if (!recommendsEq)
        return { pass: false, reason: "Must recommend using == instead of is for value comparison" };
      return { pass: true };
    },
  },
];
