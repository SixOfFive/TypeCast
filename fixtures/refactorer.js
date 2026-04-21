module.exports = [
  // 1. Core: Replace range(len) with enumerate
  {
    id: 'refactorer-core-enumerate',
    difficulty: 'core',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      'Refactor the following Python code to be more idiomatic. Output the complete refactored code and a brief summary of changes.\n\n```python\ndef print_items(items):\n    for i in range(len(items)):\n        print(items[i])\n\ndef print_indexed(items):\n    for i in range(len(items)):\n        print(str(i) + ": " + items[i])\n```',
    validate(output) {
      const o = output.toLowerCase();
      if (!o.includes('enumerate') && !o.includes('for item in'))
        return { pass: false, reason: 'Must use enumerate() or direct iteration (for item in)' };
      if (o.includes('range(len('))
        return { pass: false, reason: 'Still contains range(len()) — should be refactored out' };
      if (!o.includes('def print_items') || !o.includes('def print_indexed'))
        return { pass: false, reason: 'Missing one or both function definitions' };
      return { pass: true };
    },
  },

  // 2. Core: Replace var with const/let
  {
    id: 'refactorer-core-var-to-const-let',
    difficulty: 'core',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      'Refactor the following JavaScript code to use modern best practices. Output the complete refactored code and a brief summary of changes.\n\n```javascript\nfunction processUsers(data) {\n    var results = [];\n    var total = 0;\n    for (var i = 0; i < data.length; i++) {\n        var user = data[i];\n        var score = user.points * 2;\n        total += score;\n        results.push({ name: user.name, score: score });\n    }\n    return { results: results, total: total };\n}\n```',
    validate(output) {
      const o = output.toLowerCase();
      // Extract code blocks if present, otherwise check full output
      const codeBlockMatch = output.match(/```[\s\S]*?```/g);
      const codeSection = codeBlockMatch ? codeBlockMatch.join('\n') : output;
      // Check that var is gone from the code (not from the summary text)
      const lines = codeSection.split('\n').filter(l => !l.startsWith('//') && !l.startsWith('*') && !l.startsWith('#'));
      const code = lines.join('\n');
      if (!code.includes('const') && !code.includes('let'))
        return { pass: false, reason: 'Must use const or let instead of var' };
      if (/\bvar\b/.test(code))
        return { pass: false, reason: 'Code still contains "var" — all should be replaced with const/let' };
      if (!o.includes('processusers'))
        return { pass: false, reason: 'Missing processUsers function' };
      return { pass: true };
    },
  },

  // 3. Applied: Extract duplication
  {
    id: 'refactorer-applied-extract-duplication',
    difficulty: 'applied',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      'Refactor the following code to eliminate duplication. Output the complete refactored code and a brief summary of changes.\n\n```python\ndef process_reports():\n    # Process sales report\n    name = "sales"\n    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")\n    header = f"=== {name.upper()} REPORT ==="\n    footer = f"--- Generated: {timestamp} ---"\n    print(header)\n    print(get_sales_data())\n    print(footer)\n\n    # Process inventory report\n    name = "inventory"\n    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")\n    header = f"=== {name.upper()} REPORT ==="\n    footer = f"--- Generated: {timestamp} ---"\n    print(header)\n    print(get_inventory_data())\n    print(footer)\n\n    # Process shipping report\n    name = "shipping"\n    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")\n    header = f"=== {name.upper()} REPORT ==="\n    footer = f"--- Generated: {timestamp} ---"\n    print(header)\n    print(get_shipping_data())\n    print(footer)\n```',
    validate(output) {
      const o = output.toLowerCase();
      // Must define a helper/extracted function
      const hasHelper = o.includes('def print_report') || o.includes('def generate_report') ||
        o.includes('def format_report') || o.includes('def render_report') || o.includes('def display_report') ||
        o.includes('def run_report') || o.includes('def create_report') || o.includes('def process_report');
      if (!hasHelper)
        return { pass: false, reason: 'Must extract duplicated block into a reusable function (e.g., def print_report)' };
      // The duplicated pattern should not appear 3 times
      const headerCount = (o.match(/=== .*report ===/g) || []).length;
      if (headerCount >= 3)
        return { pass: false, reason: 'Duplicated header pattern still appears 3+ times — extraction incomplete' };
      return { pass: true };
    },
  },

  // 4. Applied: Simplify deep nesting
  {
    id: 'refactorer-applied-reduce-nesting',
    difficulty: 'applied',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      'Refactor the following code to reduce nesting depth using early returns or guard clauses. Output the complete refactored code and a brief summary of changes.\n\n```python\ndef process_order(order):\n    if order is not None:\n        if order.get("status") == "active":\n            if order.get("items"):\n                if order.get("customer_id"):\n                    total = 0\n                    for item in order["items"]:\n                        if item.get("price") and item.get("quantity"):\n                            total += item["price"] * item["quantity"]\n                    if total > 0:\n                        return {"customer": order["customer_id"], "total": total, "status": "processed"}\n                    else:\n                        return {"error": "Empty cart total"}\n                else:\n                    return {"error": "No customer ID"}\n            else:\n                return {"error": "No items"}\n        else:\n            return {"error": "Order not active"}\n    else:\n        return {"error": "No order"}\n```',
    validate(output) {
      const o = output;
      if (!o.includes('def process_order'))
        return { pass: false, reason: 'Missing def process_order' };
      // Count max indentation in the refactored code block
      const codeBlockMatch = output.match(/```(?:python)?\s*\n([\s\S]*?)```/);
      const codeBlock = codeBlockMatch ? codeBlockMatch[1] : output;
      const lines = codeBlock.split('\n').filter(l => l.trim().length > 0);
      let maxIndent = 0;
      for (const line of lines) {
        const match = line.match(/^(\s*)/);
        if (match) {
          const spaces = match[1].replace(/\t/g, '    ').length;
          if (spaces > maxIndent) maxIndent = spaces;
        }
      }
      // Original has 7+ levels (28+ spaces). Refactored should be under 5 levels (20 spaces).
      if (maxIndent >= 24)
        return { pass: false, reason: 'Nesting still too deep (max indent ' + maxIndent + ' spaces). Use early returns to flatten.' };
      // Should use early return pattern
      const hasGuards = o.includes('if order is None') || o.includes('if not order') ||
        o.includes('is None') || o.includes('return {"error"');
      if (!hasGuards)
        return { pass: false, reason: 'Expected guard clauses or early returns for error cases' };
      return { pass: true };
    },
  },

  // 5. Edge: Don't change the API
  {
    id: 'refactorer-edge-preserve-api',
    difficulty: 'edge',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      'Refactor the internals of this function for clarity, but DO NOT change the function name, parameters, default values, or return value semantics. Output the complete refactored code and a brief summary.\n\n```python\ndef calculate_total(items, tax_rate=0.1, discount=0):\n    t = 0\n    for i in range(len(items)):\n        x = items[i]\n        if type(x) == dict:\n            p = x["price"]\n            q = x["qty"]\n            t = t + p * q\n        elif type(x) == list:\n            p = x[0]\n            q = x[1]\n            t = t + p * q\n    t2 = t - discount\n    if t2 < 0:\n        t2 = 0\n    tax = t2 * tax_rate\n    final = t2 + tax\n    return round(final, 2)\n```',
    validate(output) {
      const o = output;
      // Must keep exact function signature
      const sigMatch = o.match(/def\s+calculate_total\s*\(([^)]*)\)/);
      if (!sigMatch)
        return { pass: false, reason: 'Missing function: def calculate_total(...)' };
      const params = sigMatch[1];
      if (!params.includes('items'))
        return { pass: false, reason: 'Signature must include "items" parameter' };
      if (!params.includes('tax_rate') || !params.includes('0.1'))
        return { pass: false, reason: 'Signature must keep tax_rate=0.1 default' };
      if (!/discount\s*=\s*0/.test(params))
        return { pass: false, reason: 'Signature must keep discount=0 default' };
      // Must still return a rounded value
      if (!o.includes('round'))
        return { pass: false, reason: 'Must preserve round() for return value' };
      return { pass: true };
    },
  },

  // 6. WOW: Spot the hidden O(n^3) and fix it
  {
    id: 'refactorer-wow-hidden-cubic',
    difficulty: 'wow',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      'Refactor the following code for clarity and performance. Output the complete refactored code and a summary explaining all improvements.\n\n```python\ndef find_common_pairs(list_a, list_b):\n    """Find all pairs (a, b) where a is in list_a and b is in list_b\n    and a + b exists in list_a."""\n    results = []\n    for a in list_a:\n        for b in list_b:\n            target = a + b\n            if target != a and list_a.index(target) >= 0 if target in list_a else False:\n                results.append((a, b, target))\n    return results\n```',
    validate(output) {
      const o = output.toLowerCase();
      if (!o.includes('def find_common_pairs'))
        return { pass: false, reason: 'Missing def find_common_pairs' };
      // Must recognize and fix the O(n^3) / O(n^2) complexity issue
      const hasOptimization = o.includes('set(') || o.includes('set ') || o.includes('dict(') ||
        o.includes('dict ') || o.includes('lookup') || o.includes('hash') ||
        o.includes('o(n') || o.includes('set_a') || o.includes('a_set') || o.includes('frozenset');
      if (!hasOptimization)
        return { pass: false, reason: 'Must convert list.index()/membership check to set/dict for O(1) lookup, or mention the complexity issue (O(n), set, dict, hash, lookup)' };
      // Should NOT still use .index() for the lookup
      const codeBlockMatch = output.match(/```(?:python)?\s*\n([\s\S]*?)```/);
      const codeBlock = codeBlockMatch ? codeBlockMatch[1] : '';
      if (codeBlock.includes('.index('))
        return { pass: false, reason: 'Refactored code still uses .index() — should use set/dict membership test' };
      return { pass: true };
    },
  },

  // 7. WOW: Refactor callback hell to async/await without changing error semantics
  {
    id: "refactorer-wow-2",
    difficulty: "wow",
    temperature: 0.1,
    maxTokens: 4000,
    input:
      "Refactor the following JavaScript code from nested callbacks to async/await. You MUST preserve ALL specific error messages exactly as they appear — do not generalize them into a single catch block. Output the complete refactored code and a brief summary of changes.\n\n```javascript\nfunction deployApplication(config, callback) {\n    validateConfig(config, function(err, validConfig) {\n        if (err) {\n            console.error(\"CONFIG_VALIDATION_FAILED: \" + err.message);\n            return callback(new Error(\"Deploy aborted: invalid configuration\"));\n        }\n        buildArtifact(validConfig, function(err, artifact) {\n            if (err) {\n                console.error(\"BUILD_ARTIFACT_FAILED: \" + err.message);\n                return callback(new Error(\"Deploy aborted: build step failed\"));\n            }\n            uploadToServer(artifact, validConfig.server, function(err, uploadResult) {\n                if (err) {\n                    console.error(\"UPLOAD_TO_SERVER_FAILED: \" + err.message);\n                    return callback(new Error(\"Deploy aborted: upload failed\"));\n                }\n                runHealthCheck(uploadResult.url, function(err, status) {\n                    if (err) {\n                        console.error(\"HEALTH_CHECK_FAILED: \" + err.message);\n                        return callback(new Error(\"Deploy aborted: health check failed\"));\n                    }\n                    console.log(\"Deployment successful: \" + status.url);\n                    callback(null, { url: status.url, artifact: artifact.id });\n                });\n            });\n        });\n    });\n}\n```",
    validate(output) {
      const o = output;
      const lower = o.toLowerCase();
      if (!lower.includes("async") || !lower.includes("await"))
        return { pass: false, reason: "Must use async/await pattern" };
      // Check that nesting is reduced — should not have 4-level callback nesting
      const codeBlockMatch = o.match(/```(?:javascript|js)?\s*\n([\s\S]*?)```/);
      const codeBlock = codeBlockMatch ? codeBlockMatch[1] : o;
      const lines = codeBlock.split("\n").filter(l => l.trim().length > 0);
      let maxIndent = 0;
      for (const line of lines) {
        const match = line.match(/^(\s*)/);
        if (match) {
          const spaces = match[1].replace(/\t/g, "    ").length;
          if (spaces > maxIndent) maxIndent = spaces;
        }
      }
      if (maxIndent >= 24)
        return { pass: false, reason: "Nesting still too deep (max indent " + maxIndent + " spaces). Callback hell not flattened." };
      // Check ALL four specific error messages are preserved
      const requiredMessages = [
        "CONFIG_VALIDATION_FAILED",
        "BUILD_ARTIFACT_FAILED",
        "UPLOAD_TO_SERVER_FAILED",
        "HEALTH_CHECK_FAILED"
      ];
      for (const msg of requiredMessages) {
        if (!o.includes(msg))
          return { pass: false, reason: "Missing error message: " + msg + " — all original error semantics must be preserved" };
      }
      const requiredAbortMessages = [
        "Deploy aborted: invalid configuration",
        "Deploy aborted: build step failed",
        "Deploy aborted: upload failed",
        "Deploy aborted: health check failed"
      ];
      for (const msg of requiredAbortMessages) {
        if (!o.includes(msg))
          return { pass: false, reason: "Missing abort message: " + msg + " — error semantics changed" };
      }
      return { pass: true };
    },
  },

  // 8. WOW: Refactor stateful code with hidden temporal coupling
  {
    id: "refactorer-wow-3",
    difficulty: "wow",
    temperature: 0.1,
    maxTokens: 4000,
    input:
      "Refactor the following Python code to eliminate the hidden temporal coupling caused by the shared mutable module-level dict. Make data flow explicit — either through parameters/return values or by creating a class. The refactored code must produce the same results. Output the complete refactored code and a brief summary of changes.\n\n```python\n_state = {}\n\ndef init_data(items):\n    _state[\"raw\"] = items\n    _state[\"count\"] = len(items)\n\ndef process_data():\n    _state[\"processed\"] = [x * 2 for x in _state[\"raw\"]]\n    _state[\"total\"] = sum(_state[\"processed\"])\n\ndef generate_report():\n    return f\"Processed {_state[\"count\"]} items. Total: {_state[\"total\"]}\"\n```",
    validate(output) {
      const o = output;
      const lower = o.toLowerCase();
      // Check that _state as a module-level dict is gone or converted to class
      const codeBlockMatch = o.match(/```(?:python)?\s*\n([\s\S]*?)```/);
      const codeBlock = codeBlockMatch ? codeBlockMatch[1] : o;
      const hasModuleLevelState = /^_state\s*=\s*\{\s*\}/m.test(codeBlock);
      const hasClass = /class\s+\w+/.test(codeBlock);
      const hasExplicitParams = /def\s+process_data\s*\([^)]+\)/.test(codeBlock) || /def\s+generate_report\s*\([^)]+\)/.test(codeBlock);
      if (hasModuleLevelState && !hasClass)
        return { pass: false, reason: "Still uses _state = {} as module-level dict without converting to class — temporal coupling not eliminated" };
      if (!hasClass && !hasExplicitParams)
        return { pass: false, reason: "Must use explicit data flow: either class with self attributes or functions with parameters/return values" };
      // If class-based, check for self usage
      if (hasClass && !codeBlock.includes("self."))
        return { pass: false, reason: "Class defined but does not use self. attributes — state still not explicit" };
      // If function-based, check that process_data and generate_report take parameters
      if (!hasClass) {
        if (!/def\s+process_data\s*\([^)]+\)/.test(codeBlock))
          return { pass: false, reason: "process_data must accept explicit parameters if not using a class" };
        if (!/def\s+generate_report\s*\([^)]+\)/.test(codeBlock))
          return { pass: false, reason: "generate_report must accept explicit parameters if not using a class" };
      }
      // Must still produce a report string
      if (!lower.includes("processed") || !lower.includes("total"))
        return { pass: false, reason: "Must still produce a report containing Processed and Total" };
      return { pass: true };
    },
  },

  // 9. WOW: Refactor sync I/O to async without changing the public API contract
  {
    id: "refactorer-wow-4",
    difficulty: "wow",
    temperature: 0.1,
    maxTokens: 4000,
    input:
      "Refactor the following Python class to use async I/O internally (using aiofiles or asyncio) for better performance, but keep the public API synchronous so existing callers do not break. You may provide both sync and async versions of methods, or wrap async internals. Output the complete refactored code and a brief summary of changes.\n\n```python\nimport os\n\nclass FileStore:\n    def __init__(self, base_dir):\n        self.base_dir = base_dir\n        os.makedirs(base_dir, exist_ok=True)\n\n    def _full_path(self, path):\n        return os.path.join(self.base_dir, path)\n\n    def read(self, path):\n        with open(self._full_path(path), \"r\") as f:\n            return f.read()\n\n    def write(self, path, data):\n        with open(self._full_path(path), \"w\") as f:\n            f.write(data)\n\n    def delete(self, path):\n        fp = self._full_path(path)\n        if os.path.exists(fp):\n            os.remove(fp)\n\n    def list_files(self):\n        return os.listdir(self.base_dir)\n\n    def exists(self, path):\n        return os.path.exists(self._full_path(path))\n```",
    validate(output) {
      const o = output;
      const lower = o.toLowerCase();
      const codeBlockMatch = o.match(/```(?:python)?\s*\n([\s\S]*?)```/);
      const codeBlock = codeBlockMatch ? codeBlockMatch[1] : o;
      // Must contain async somewhere (internal async conversion happened)
      if (!codeBlock.includes("async"))
        return { pass: false, reason: "Must contain async keyword — internal async conversion did not happen" };
      // Must still have a synchronous public read method OR provide both sync and async
      const hasSyncRead = /\n\s+def read\s*\(/.test(codeBlock);
      const hasAsyncRead = /\n\s+async def read\s*\(/.test(codeBlock);
      const hasBothVersions = /async def (async_read|aread|_async_read|read_async)\s*\(/.test(codeBlock) && hasSyncRead;
      if (!hasSyncRead && !hasBothVersions)
        return { pass: false, reason: "Public def read() method must remain synchronous (or provide both sync and async versions) — all callers would break" };
      if (hasAsyncRead && !hasBothVersions)
        return { pass: false, reason: "read() was converted to async def read() without keeping a sync version — existing callers would break" };
      // Must use aiofiles or asyncio
      if (!lower.includes("aiofiles") && !lower.includes("asyncio") && !lower.includes("async with"))
        return { pass: false, reason: "Must use aiofiles, asyncio, or async with for internal async I/O" };
      return { pass: true };
    },
  },

  // 10. WOW: Refactor recursive to iterative without changing output
  {
    id: "refactorer-wow-5",
    difficulty: "wow",
    temperature: 0.1,
    maxTokens: 4000,
    input:
      "Refactor the following recursive tree-flattening function to an iterative approach that can handle trees with 10,000+ depth without hitting Python's recursion limit. The refactored code MUST preserve the exact DFS pre-order traversal output. Output the complete refactored code and a brief summary of changes.\n\n```python\nclass TreeNode:\n    def __init__(self, value, children=None):\n        self.value = value\n        self.children = children or []\n\ndef flatten_tree(node):\n    if node is None:\n        return []\n    result = [node.value]\n    for child in node.children:\n        result.extend(flatten_tree(child))\n    return result\n```",
    validate(output) {
      const o = output;
      const lower = o.toLowerCase();
      const codeBlockMatch = o.match(/```(?:python)?\s*\n([\s\S]*?)```/);
      const codeBlock = codeBlockMatch ? codeBlockMatch[1] : o;
      // Extract just the flatten_tree function body
      const funcMatch = codeBlock.match(/def flatten_tree\s*\([^)]*\):\s*\n([\s\S]*?)(?=\ndef |\nclass |\Z)/);
      const funcBody = funcMatch ? funcMatch[1] : codeBlock;
      // Must NOT contain recursive call to flatten_tree inside itself
      if (/flatten_tree\s*\(/.test(funcBody) && funcMatch)
        return { pass: false, reason: "flatten_tree still calls itself recursively — must be converted to iterative" };
      // Must contain explicit stack/queue/deque structure
      const hasIterStructure =
        lower.includes("stack") ||
        lower.includes("queue") ||
        lower.includes("deque") ||
        (codeBlock.includes("while ") && (codeBlock.includes(".pop(") || codeBlock.includes(".append(")));
      if (!hasIterStructure)
        return { pass: false, reason: "Must use an explicit stack, queue, deque, or iterative structure (while + pop/append)" };
      // Must process node value before children (pre-order)
      // Check that append/value comes before children processing in the loop
      const hasPreOrder =
        /append\s*\([^)]*\.value/.test(codeBlock) ||
        /result\.append/.test(codeBlock) ||
        /\bvalue\b/.test(codeBlock);
      if (!hasPreOrder)
        return { pass: false, reason: "Must preserve pre-order traversal — process node value before children" };
      // Check children are reversed when pushed to stack (to maintain left-to-right order)
      const reversesChildren =
        codeBlock.includes("reversed(") ||
        codeBlock.includes("[::-1]") ||
        codeBlock.includes(".reverse()") ||
        lower.includes("reverse") ||
        lower.includes("right to left") ||
        lower.includes("prepend");
      if (!reversesChildren && codeBlock.includes(".pop("))
        return { pass: false, reason: "Children must be reversed when pushed to stack to maintain left-to-right pre-order traversal" };
      return { pass: true };
    },
  },
];
