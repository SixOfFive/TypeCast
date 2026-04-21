module.exports = [
  // ===========================================================================
  // 1. Core: Find SQL injection
  // ===========================================================================
  {
    id: 'reviewer-core-sql-injection',
    input:
      'Review the following code for security, correctness, and best practices:\n\n```python\nimport sqlite3\n\ndef get_user(conn, username):\n    query = "SELECT * FROM users WHERE name = \'" + username + "\'"\n    cursor = conn.execute(query)\n    return cursor.fetchone()\n\ndef search_users(conn, pattern):\n    query = "SELECT * FROM users WHERE name LIKE \'%" + pattern + "%\'"\n    return conn.execute(query).fetchall()\n```',
    validate(output) {
      const text = output.toLowerCase();
      if (!/critical/.test(text))
        return { pass: false, reason: 'Must flag SQL injection as [CRITICAL]' };
      if (!/sql|injection|parameteriz|sanitiz/.test(text))
        return { pass: false, reason: 'Must mention SQL injection, parameterized queries, or sanitization' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 2. Core: Approve clean code
  // ===========================================================================
  {
    id: 'reviewer-core-approve-clean',
    input:
      'Review the following code for security, correctness, and best practices:\n\n```python\nfrom typing import Optional\nfrom pathlib import Path\n\n\ndef read_config(path: Path, encoding: str = "utf-8") -> dict:\n    """Read a JSON config file and return its contents as a dict.\n\n    Raises FileNotFoundError if the path does not exist.\n    Raises ValueError if the file contains invalid JSON.\n    """\n    if not path.exists():\n        raise FileNotFoundError(f"Config not found: {path}")\n    with path.open("r", encoding=encoding) as fh:\n        import json\n        try:\n            return json.load(fh)\n        except json.JSONDecodeError as exc:\n            raise ValueError(f"Invalid JSON in {path}: {exc}") from exc\n```',
    validate(output) {
      const text = output.toLowerCase();
      if (!/approved/.test(text))
        return { pass: false, reason: 'Clean code must be APPROVED, but model invented issues instead' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 3. Applied: Find multiple issues
  // ===========================================================================
  {
    id: 'reviewer-applied-multiple-issues',
    input:
      'Review the following code for security, correctness, and best practices:\n\n```python\nimport os\n\nDB_PASSWORD = "admin123"\n\ndef run_backup(source_dir, dest_dir):\n    password = "admin123"\n    try:\n        os.system(f"cp -r {source_dir} {dest_dir}")\n        os.system(f"mysqldump -u root -p{password} mydb > {dest_dir}/backup.sql")\n    except:\n        print("Backup failed")\n\ndef cleanup(path):\n    try:\n        os.system(f"rm -rf {path}")\n    except:\n        pass\n```',
    validate(output) {
      const text = output.toLowerCase();
      let issuesFound = 0;
      if (/bare\s*except|except\s*:|catch.?all|broad\s*except|generic\s*except/.test(text)) issuesFound++;
      if (/hardcod|password|credential|secret|"admin123"/.test(text)) issuesFound++;
      if (/os\.system|subprocess|shell\s*injection|command\s*injection/.test(text)) issuesFound++;
      if (issuesFound < 2)
        return { pass: false, reason: `Must find at least 2 of 3 issues (bare except, hardcoded password, os.system), found ${issuesFound}` };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 4. Applied: Performance issue
  // ===========================================================================
  {
    id: 'reviewer-applied-performance',
    input:
      'Review the following code for security, correctness, performance, and best practices:\n\n```python\ndef find_common_elements(list_a: list, list_b: list) -> list:\n    """Return elements present in both lists."""\n    result = []\n    for item in list_a:\n        for other in list_b:\n            if item == other:\n                result.append(item)\n                break\n    return result\n\ndef find_duplicates(data: list) -> list:\n    """Return elements that appear more than once."""\n    duplicates = []\n    for i in range(len(data)):\n        for j in range(i + 1, len(data)):\n            if data[i] == data[j] and data[i] not in duplicates:\n                duplicates.append(data[i])\n    return duplicates\n```',
    validate(output) {
      const text = output.toLowerCase();
      if (!/performance|o\(n|efficien|set\b|dict\b|hash|quadratic|n\s*squared|n\^2/.test(text))
        return { pass: false, reason: 'Must mention performance, O(n), efficiency, set, dict, or hash as improvement' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 5. Edge: Don't flag correct code as wrong (false positive test)
  // ===========================================================================
  {
    id: 'reviewer-edge-no-false-positive',
    input:
      'Review the following code for security, correctness, and best practices:\n\n```python\nfrom functools import lru_cache\nfrom typing import Dict, Tuple\n\n\n@lru_cache(maxsize=256)\ndef fibonacci(n: int) -> int:\n    """Return the nth Fibonacci number.\n\n    Uses memoization via lru_cache to avoid redundant computation.\n    Handles negative input and the base cases explicitly.\n    """\n    if not isinstance(n, int):\n        raise TypeError(f"Expected int, got {type(n).__name__}")\n    if n < 0:\n        raise ValueError(f"n must be non-negative, got {n}")\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n\n\ndef fib_sequence(count: int) -> Tuple[int, ...]:\n    """Return the first `count` Fibonacci numbers as a tuple."""\n    if count < 0:\n        raise ValueError(f"count must be non-negative, got {count}")\n    return tuple(fibonacci(i) for i in range(count))\n```',
    validate(output) {
      const text = output.toLowerCase();
      if (/critical/.test(text))
        return { pass: false, reason: 'Flagged correct code as [CRITICAL] — false positive' };
      if (/warning/.test(text))
        return { pass: false, reason: 'Flagged correct code as [WARNING] — false positive' };
      // APPROVED or only SUGGESTION-level notes are acceptable
      return { pass: true };
    }
  },

  // ===========================================================================
  // 6. WOW: Catch a subtle timing attack
  // ===========================================================================
  {
    id: 'reviewer-wow-timing-attack',
    input:
      'Review the following code for security, correctness, and best practices:\n\n```python\nimport hashlib\n\ndef hash_password(password: str, salt: str) -> str:\n    """Hash a password with the given salt using SHA-256."""\n    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()\n\ndef verify_password(stored_hash: str, salt: str, provided: str) -> bool:\n    """Check whether the provided password matches the stored hash."""\n    computed = hash_password(provided, salt)\n    return computed == stored_hash\n```',
    validate(output) {
      const text = output.toLowerCase();
      if (!/timing|constant.?time|compare_digest|time.?based|side.?channel|hmac/.test(text))
        return { pass: false, reason: 'Must identify timing attack vulnerability (timing, constant-time, compare_digest, side-channel)' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 7. WOW-2: Detect TOCTOU race condition in file operations
  // ===========================================================================
  {
    id: 'reviewer-wow-2',
    name: 'WOW-2: Detect TOCTOU race condition in file operations',
    difficulty: 'wow',
    input:
      'Review the following code for security, correctness, and best practices:\n\n```python\nimport os\nimport json\nimport logging\n\nlogger = logging.getLogger(__name__)\n\ndef load_user_profile(filepath: str) -> dict:\n    """Load a user profile from a JSON file on disk.\n\n    Returns the parsed profile dict, or an empty dict if the\n    file is missing or contains invalid JSON.\n    """\n    default = {"preferences": {}, "history": []}\n\n    if os.path.exists(filepath):\n        logger.info("Profile found at %s, loading...", filepath)\n        data = open(filepath).read()\n        try:\n            profile = json.loads(data)\n        except json.JSONDecodeError:\n            logger.warning("Corrupt profile at %s, using default", filepath)\n            return default\n        return {**default, **profile}\n\n    logger.info("No profile at %s, returning default", filepath)\n    return default\n```',
    validate(output) {
      const text = output.toLowerCase();
      if (!/toctou|time.of.check|race\s*condition|between.*check.*use/.test(text))
        return { pass: false, reason: 'Must identify TOCTOU / time-of-check-time-of-use race condition between os.path.exists() and open()' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 8. WOW-3: Detect ReDoS vulnerability in regex
  // ===========================================================================
  {
    id: 'reviewer-wow-3',
    name: 'WOW-3: Detect ReDoS vulnerability in regex',
    difficulty: 'wow',
    input:
      'Review the following code for security, correctness, and best practices:\n\n```python\nimport re\nimport logging\nfrom http.server import BaseHTTPRequestHandler\nfrom urllib.parse import parse_qs\n\nlogger = logging.getLogger(__name__)\n\nALLOWED_TOKEN_RE = re.compile(r"^(a+)+$")\n\nclass TokenValidationHandler(BaseHTTPRequestHandler):\n    """Simple HTTP handler that validates an access token query param.\n\n    Tokens must consist entirely of lowercase \'a\' characters.\n    """\n\n    def do_GET(self):\n        params = parse_qs(self.path.split("?", 1)[-1] if "?" in self.path else "")\n        token = params.get("token", [""])[0]\n\n        if not token:\n            self._respond(400, "Missing token parameter")\n            return\n\n        if ALLOWED_TOKEN_RE.match(token):\n            logger.info("Valid token received: %s", token[:8])\n            self._respond(200, "Token accepted")\n        else:\n            logger.warning("Rejected invalid token from %s", self.client_address[0])\n            self._respond(403, "Invalid token")\n\n    def _respond(self, code: int, message: str):\n        self.send_response(code)\n        self.send_header("Content-Type", "text/plain")\n        self.end_headers()\n        self.wfile.write(message.encode("utf-8"))\n```',
    validate(output) {
      const text = output.toLowerCase();
      if (!/redos|catastrophic\s*backtrack|denial.?of.?service|exponential.*backtrack|regex.*attack/.test(text))
        return { pass: false, reason: 'Must identify ReDoS / catastrophic backtracking vulnerability in the regex pattern (a+)+$' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 9. WOW-4: Detect use-after-free equivalent in Python via __del__ destructor ordering
  // ===========================================================================
  {
    id: 'reviewer-wow-4',
    name: 'WOW-4: Detect a use-after-free equivalent in Python via __del__ destructor ordering',
    difficulty: 'wow',
    input:
      'Review the following code for security, correctness, and best practices:\n\n```python\nimport logging\n\nlogger = logging.getLogger(__name__)\n\n\nclass ResourcePool:\n    """Manages a pool of reusable connections."""\n\n    def __init__(self):\n        self.connections = []\n\n    def add(self, conn):\n        self.connections.append(conn)\n\n    def close_all(self):\n        for conn in self.connections:\n            conn.close()\n        self.connections.clear()\n        logger.info("All connections closed.")\n\n\nclass Worker:\n    """Performs work using connections from a shared pool."""\n\n    def __init__(self, pool: ResourcePool):\n        self.pool = pool\n\n    def __del__(self):\n        # Clean up all connections when the worker is destroyed\n        self.pool.close_all()\n        logger.info("Worker destroyed, pool cleaned up.")\n```',
    validate(output) {
      const text = output.toLowerCase();
      if (!/__del__/.test(text))
        return { pass: false, reason: 'Must mention __del__' };
      if (!/destructor.?order|garbage.?collect|destructor.*not.*guaranteed|cyclic.*ref|weak.*ref|atexit/.test(text))
        return { pass: false, reason: 'Must mention destructor ordering, garbage collection non-guarantee, cyclic references, weakref, or atexit' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 10. WOW-5: Detect a semantic logic bomb hidden in an obfuscated condition
  // ===========================================================================
  {
    id: 'reviewer-wow-5',
    name: 'WOW-5: Detect a semantic logic bomb hidden in an obfuscated condition',
    difficulty: 'wow',
    input:
      'Review the following code for security, correctness, and best practices:\n\n```python\nimport hashlib\nimport time\nimport logging\n\nlogger = logging.getLogger(__name__)\n\n\ndef is_authorized(user: str, resource) -> bool:\n    """Check whether a user is authorized to access the given resource.\n\n    Args:\n        user: The username to check.\n        resource: An object with an `allowed_users` attribute (list of str).\n\n    Returns:\n        True if the user is authorized, False otherwise.\n    """\n    token = hashlib.md5(user.encode()).hexdigest()\n    logger.debug("Auth check for user=%s token=%s", user, token[:8])\n\n    # Standard auth check\n    if user in resource.allowed_users:\n        return True\n\n    # Fallback: verify derived token prefix\n    # md5("admin") = 21232f297a57a5a743894a0e4a801fc3\n    if token[:8] == "21232f29":\n        return True\n\n    return False\n```',
    validate(output) {
      const text = output.toLowerCase();
      if (!/backdoor|back.?door|unauthorized.*access|hash.*collision|admin.*hash|always.*true/.test(text))
        return { pass: false, reason: 'Must identify the backdoor / unauthorized access via hash prefix comparison (not just "MD5 is weak")' };
      return { pass: true };
    }
  },
];
