module.exports = [
  // 1. Core: Simple function — Palindrome checker
  {
    id: 'coder-core-palindrome',
    difficulty: 'core',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      'Write a Python function called `is_palindrome` that takes a string and returns True if it\'s a palindrome (case-insensitive, ignoring spaces and punctuation).',
    validate(output) {
      const o = output.toLowerCase();
      if (!o.includes('def is_palindrome'))
        return { pass: false, reason: 'Missing def is_palindrome' };
      if (!o.includes('return'))
        return { pass: false, reason: 'Missing return statement' };
      if (!o.includes('.lower()') && !o.includes('casefold'))
        return { pass: false, reason: 'Missing case-insensitive handling (.lower() or casefold)' };
      return { pass: true };
    },
  },

  // 2. Core: With output — Fibonacci printer
  {
    id: 'coder-core-fibonacci',
    difficulty: 'core',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      'Write a Python script that generates the first 20 Fibonacci numbers and prints them as a comma-separated list.',
    validate(output) {
      const o = output.toLowerCase();
      if (!o.includes('print'))
        return { pass: false, reason: 'Missing print statement' };
      const hasLoop = o.includes('for ') || o.includes('while ') || o.includes('def fib');
      if (!hasLoop)
        return { pass: false, reason: 'Missing loop or recursion pattern (for/while/def fib)' };
      return { pass: true };
    },
  },

  // 3. Applied: Error handling — safe_divide
  {
    id: 'coder-applied-safe-divide',
    difficulty: 'applied',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      "Write a Python function called `safe_divide(a, b)` that divides a by b, returns the result rounded to 2 decimal places, raises ValueError if either input is not a number, and raises ZeroDivisionError with message 'Cannot divide by zero' if b is 0.",
    validate(output) {
      if (!output.includes('def safe_divide'))
        return { pass: false, reason: 'Missing def safe_divide' };
      if (!output.includes('ValueError'))
        return { pass: false, reason: 'Missing ValueError' };
      if (!output.includes('ZeroDivisionError'))
        return { pass: false, reason: 'Missing ZeroDivisionError' };
      if (!output.includes('Cannot divide by zero'))
        return { pass: false, reason: "Missing exact message 'Cannot divide by zero'" };
      if (!output.includes('round'))
        return { pass: false, reason: 'Missing round() call' };
      return { pass: true };
    },
  },

  // 4. Applied: File I/O — Word frequency counter
  {
    id: 'coder-applied-file-io',
    difficulty: 'applied',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      "Write a Python script that reads a file called 'data.txt', counts the frequency of each word (case-insensitive), and writes the results to 'word_counts.json' sorted by frequency descending.",
    validate(output) {
      const o = output.toLowerCase();
      if (!output.includes('open('))
        return { pass: false, reason: 'Missing open() call' };
      if (!output.includes('json'))
        return { pass: false, reason: 'Missing json module usage' };
      if (!o.includes('.lower()'))
        return { pass: false, reason: 'Missing .lower() for case-insensitive handling' };
      if (!output.includes('data.txt'))
        return { pass: false, reason: "Missing filename 'data.txt'" };
      if (!output.includes('word_counts.json'))
        return { pass: false, reason: "Missing filename 'word_counts.json'" };
      return { pass: true };
    },
  },

  // 5. Edge: Must not use placeholder — Node.js HTTP server
  {
    id: 'coder-edge-http-server',
    difficulty: 'edge',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      "Write a complete Node.js HTTP server using only the built-in 'http' module (no express) that responds to GET /health with JSON {\"status\":\"ok\"} and GET /time with the current ISO timestamp. All other routes return 404.",
    validate(output) {
      if (!output.includes("require('http')") && !output.includes('require("http")'))
        return { pass: false, reason: "Missing require('http') or require(\"http\")" };
      if (!output.includes('/health'))
        return { pass: false, reason: 'Missing /health route' };
      if (!output.includes('/time'))
        return { pass: false, reason: 'Missing /time route' };
      if (!output.includes('404'))
        return { pass: false, reason: 'Missing 404 status code' };
      if (output.includes('// TODO') || output.includes('...') || output.includes('pass') || output.includes('<your code>'))
        return { pass: false, reason: 'Contains placeholder code (// TODO, ..., pass, or <your code>)' };
      return { pass: true };
    },
  },

  // 6. WOW: Algorithmic precision — Merge sorted lists
  {
    id: 'coder-wow-merge-sorted',
    difficulty: 'wow',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      'Write a Python function called `merge_sorted_lists(list_a, list_b)` that merges two already-sorted lists into one sorted list in O(n) time. Do NOT use the built-in `sorted()` function or `.sort()` method.',
    validate(output) {
      if (!output.includes('def merge_sorted_lists'))
        return { pass: false, reason: 'Missing def merge_sorted_lists' };
      if (output.includes('sorted('))
        return { pass: false, reason: 'Uses forbidden sorted() function' };
      if (output.includes('.sort('))
        return { pass: false, reason: 'Uses forbidden .sort() method' };
      const usesTwoPointer =
        (output.includes('list_a[') && output.includes('list_b[')) ||
        (output.includes('a[') && output.includes('b['));
      if (!usesTwoPointer)
        return { pass: false, reason: 'Missing two-pointer/merge approach (no element comparison between both lists)' };
      return { pass: true };
    },
  },

  // 7. WOW: LRU Cache with O(1) get/put using doubly-linked list
  {
    id: 'coder-wow-2',
    difficulty: 'wow',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      'Write a Python class `LRUCache` with `__init__(self, capacity)`, `get(self, key)`, and `put(self, key, value)` methods. Both get and put must be O(1). Use a doubly-linked list and a dictionary — do NOT use `collections.OrderedDict` or `functools.lru_cache`.',
    validate(output) {
      const o = output.toLowerCase();
      if (!output.includes('class LRUCache'))
        return { pass: false, reason: 'Missing class LRUCache' };
      if (!o.includes('def get('))
        return { pass: false, reason: 'Missing get method' };
      if (!o.includes('def put('))
        return { pass: false, reason: 'Missing put method' };
      if (output.includes('OrderedDict'))
        return { pass: false, reason: 'Uses forbidden OrderedDict' };
      if (output.includes('lru_cache'))
        return { pass: false, reason: 'Uses forbidden lru_cache' };
      const hasLinkedList =
        (o.includes('prev') && o.includes('next')) ||
        (o.includes('head') && o.includes('tail'));
      if (!hasLinkedList)
        return { pass: false, reason: 'Missing linked list concepts (prev/next or head/tail)' };
      const hasDict =
        o.includes('dict') || o.includes('{}') || o.includes('hash') || o.includes('self.cache') || o.includes('self.map');
      if (!hasDict)
        return { pass: false, reason: 'Missing dict/hash for O(1) lookup' };
      return { pass: true };
    },
  },

  // 8. WOW: Raft consensus heartbeat with term logic
  {
    id: 'coder-wow-3',
    difficulty: 'wow',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      "Write a Python class `RaftNode` that implements the leader heartbeat portion of the Raft consensus protocol. The node has a `term` (monotonically increasing integer), a `state` (follower/candidate/leader), and a `voted_for` field. Implement: `receive_heartbeat(leader_term, leader_id)` — if leader_term >= current term, reset election timer, update term, become follower, return success. If leader_term < current term, reject. `start_election()` — increment term, vote for self, become candidate. `receive_vote(voter_term, granted)` — track votes, become leader if majority. Handle the split-brain edge case where two nodes claim leadership with the same term.",
    validate(output) {
      const o = output.toLowerCase();
      if (!output.includes('class RaftNode'))
        return { pass: false, reason: 'Missing class RaftNode' };
      const hasTermComparison =
        o.includes('leader_term') && (o.includes('self.term') || o.includes('current_term'));
      if (!hasTermComparison)
        return { pass: false, reason: 'Missing term comparison (leader_term vs self.term or current_term)' };
      const hasAllStates =
        o.includes('follower') && o.includes('candidate') && o.includes('leader');
      if (!hasAllStates)
        return { pass: false, reason: 'Missing one or more states (follower/candidate/leader)' };
      const hasVoteCounting =
        o.includes('vote') && (o.includes('count') || o.includes('majority') || o.includes('len(') || o.includes('votes'));
      if (!hasVoteCounting)
        return { pass: false, reason: 'Missing vote counting logic' };
      const hasTermGte = o.includes('>=') || o.includes('> =');
      const hasTermLt = o.includes('<');
      if (!hasTermGte || !hasTermLt)
        return { pass: false, reason: 'Missing split-brain term comparison logic (>= and < comparisons on term)' };
      return { pass: true };
    },
  },

  // 9. WOW: Lock-free concurrent queue using CAS operations
  {
    id: 'coder-wow-4',
    name: 'WOW-4: Implement a lock-free concurrent queue using CAS operations',
    difficulty: 'wow',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      'Write a Python class `LockFreeQueue` that implements a thread-safe FIFO queue using only atomic compare-and-swap (CAS) operations. Do NOT use `threading.Lock`, `queue.Queue`, `collections.deque` with locks, or any mutex/semaphore. Use `ctypes` or a custom CAS implementation. The queue must support `enqueue(item)` and `dequeue()` methods that are safe to call from multiple threads simultaneously.',
    validate(output) {
      const o = output.toLowerCase();
      if (!output.includes('class LockFreeQueue'))
        return { pass: false, reason: 'Missing class LockFreeQueue' };
      if (!o.includes('enqueue'))
        return { pass: false, reason: 'Missing enqueue method' };
      if (!o.includes('dequeue'))
        return { pass: false, reason: 'Missing dequeue method' };
      if (output.includes('Lock(') || output.includes('threading.Lock') || output.includes('queue.Queue') || output.includes('Semaphore'))
        return { pass: false, reason: 'Uses forbidden Lock/Queue/Semaphore' };
      const hasCas =
        o.includes('cas') || o.includes('compare_and_swap') || o.includes('compare_exchange') || o.includes('ctypes') || o.includes('atomic');
      if (!hasCas)
        return { pass: false, reason: 'Missing CAS/atomic implementation (cas, compare_and_swap, compare_exchange, ctypes, or atomic)' };
      return { pass: true };
    },
  },

  // 10. WOW: UTF-8 encoder/decoder from scratch
  {
    id: 'coder-wow-5',
    name: 'WOW-5: Implement a correct UTF-8 encoder/decoder from scratch without library calls',
    difficulty: 'wow',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      "Write two Python functions: `utf8_encode(text: str) -> bytes` and `utf8_decode(data: bytes) -> str`. Implement the full UTF-8 encoding/decoding algorithm from scratch — handle 1-byte (ASCII), 2-byte, 3-byte, and 4-byte sequences. Do NOT use `str.encode()`, `bytes.decode()`, `codecs`, or any built-in encoding functions. Must handle the full Unicode range including emoji (U+1F600 range). Include proper error handling for invalid byte sequences.",
    validate(output) {
      const o = output.toLowerCase();
      if (!output.includes('def utf8_encode'))
        return { pass: false, reason: 'Missing def utf8_encode' };
      if (!output.includes('def utf8_decode'))
        return { pass: false, reason: 'Missing def utf8_decode' };
      if (output.includes('.encode(') || output.includes('.decode(') || output.includes('codecs'))
        return { pass: false, reason: 'Uses forbidden .encode()/.decode()/codecs' };
      const has4Byte =
        output.includes('0xF0') || output.includes('0b11110') || output.includes('240') || o.includes('4-byte') || o.includes('four byte');
      if (!has4Byte)
        return { pass: false, reason: 'Missing 4-byte sequence handling (0xF0 / 0b11110 / 240 prefix pattern)' };
      const hasErrorHandling =
        output.includes('raise') || output.includes('ValueError') || o.includes('invalid');
      if (!hasErrorHandling)
        return { pass: false, reason: 'Missing error handling (raise / ValueError / invalid)' };
      return { pass: true };
    },
  },
];
