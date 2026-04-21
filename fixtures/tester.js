module.exports = [
  // 1. Core: Simple function tests
  {
    id: 'tester-core-simple-function',
    difficulty: 'core',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      'Write a complete, runnable Python test suite with assertions for:\n\n```python\ndef add(a, b):\n    return a + b\n```\n\nCover happy path, edge cases, and error paths.',
    validate(output) {
      const o = output.toLowerCase();
      const testFuncCount = (o.match(/def test_/g) || []).length;
      if (testFuncCount < 3)
        return {
          pass: false,
          reason: `Must contain at least 3 test functions (def test_), found ${testFuncCount}`,
        };
      if (!o.includes('assert'))
        return { pass: false, reason: 'Missing assert statements' };
      if (!o.includes('add(1') && !o.includes('add( 1'))
        return {
          pass: false,
          reason: 'Must test basic case like add(1, 2)',
        };
      return { pass: true };
    },
  },

  // 2. Core: Test error paths
  {
    id: 'tester-core-error-paths',
    difficulty: 'core',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      'Write a complete, runnable Python test suite with assertions for:\n\n```python\ndef divide(a, b):\n    if b == 0:\n        raise ValueError("division by zero")\n    return a / b\n```\n\nMake sure to test the error path where b is 0, and the happy path.',
    validate(output) {
      const o = output.toLowerCase();
      const hasExceptionTest =
        o.includes('pytest.raises') ||
        o.includes('assertraises') ||
        (o.includes('try') && o.includes('except'));
      if (!hasExceptionTest)
        return {
          pass: false,
          reason:
            'Must test ValueError using pytest.raises, assertRaises, or try/except',
        };
      const testsZero =
        o.includes('divide(') &&
        (o.includes(', 0)') || o.includes(',0)') || o.includes(', 0 )'));
      if (!testsZero)
        return {
          pass: false,
          reason: 'Must specifically test the zero case (divide(..., 0))',
        };
      return { pass: true };
    },
  },

  // 3. Applied: Mock external dependency
  {
    id: 'tester-applied-mock-dependency',
    difficulty: 'applied',
    temperature: 0.1,
    maxTokens: 6000,
    input:
      'Write a complete, runnable Python test suite with assertions for:\n\n```python\nimport requests\n\ndef fetch_json(url):\n    response = requests.get(url)\n    response.raise_for_status()\n    return response.json()\n```\n\nDo NOT make real HTTP calls. Mock the dependency. Test both success and failure cases.',
    validate(output) {
      const o = output.toLowerCase();
      const hasMock =
        o.includes('mock') ||
        o.includes('patch') ||
        o.includes('monkeypatch');
      if (!hasMock)
        return {
          pass: false,
          reason:
            'Must use mock/Mock/patch/monkeypatch to mock the HTTP call',
        };
      // Check for success case testing
      const hasSuccessTest =
        o.includes('.json()') ||
        o.includes('return_value') ||
        o.includes('mock_get');
      if (!hasSuccessTest)
        return {
          pass: false,
          reason: 'Must test the success case (mock returning JSON)',
        };
      // Check for failure case testing
      const hasFailureTest =
        o.includes('raise') ||
        o.includes('error') ||
        o.includes('exception') ||
        o.includes('status_code') ||
        o.includes('httperror') ||
        o.includes('side_effect');
      if (!hasFailureTest)
        return {
          pass: false,
          reason: 'Must test the failure case (HTTP error or exception)',
        };
      return { pass: true };
    },
  },

  // 4. Applied: Edge cases
  {
    id: 'tester-applied-edge-cases',
    difficulty: 'applied',
    temperature: 0.1,
    maxTokens: 5000,
    input:
      'Write a complete, runnable Python test suite with assertions for:\n\n```python\ndef find_max(lst):\n    return max(lst)\n```\n\nFocus heavily on edge cases: empty list, single element, negative numbers, duplicates, etc.',
    validate(output) {
      const o = output.toLowerCase();
      let edgeCaseCount = 0;

      // Check empty list test
      if (o.includes('[]')) edgeCaseCount++;
      // Check single element test (list with one item)
      const hasSingleElement =
        /\[\s*-?\d+\s*\]/.test(o) || o.includes('single') || o.includes('one element');
      if (hasSingleElement) edgeCaseCount++;
      // Check negative numbers
      if (/\[\s*.*-\d+/.test(o) || o.includes('negative')) edgeCaseCount++;
      // Check duplicates
      const hasDuplicates =
        /\[\s*\d+\s*,\s*\d+\s*,\s*\d+/.test(o) &&
        (o.includes('duplicate') ||
          /(\d+)[,\s]+\1/.test(o) ||
          o.includes('[5, 5') ||
          o.includes('[1, 1') ||
          o.includes('[3, 3') ||
          o.includes('[2, 2'));
      if (hasDuplicates) edgeCaseCount++;

      if (edgeCaseCount < 3)
        return {
          pass: false,
          reason: `Must cover at least 3 of 4 edge cases (empty list, single element, negatives, duplicates). Found ${edgeCaseCount}`,
        };
      return { pass: true };
    },
  },

  // 5. Edge: Test the test — tests must match CODE behavior, not misleading docstring
  {
    id: 'tester-edge-test-the-test',
    difficulty: 'edge',
    temperature: 0.1,
    maxTokens: 5000,
    input:
      'Write a complete, runnable Python test suite with assertions for:\n\n```python\ndef is_even(n):\n    """Returns True for odd numbers, False for even numbers."""\n    return n % 2 == 0\n```\n\nWrite tests that validate the actual behavior of the code.',
    validate(output) {
      const o = output;
      // The code: is_even(2) returns True, is_even(3) returns False
      // The docstring LIES: says True for odd, False for even
      // Good tests follow the CODE, not the docstring

      // Check that tests treat is_even(2) as True (correct per code)
      const treatsEven2AsTrue =
        /is_even\s*\(\s*2\s*\)\s*(==\s*True|is\s+True)/.test(o) ||
        /assert\s+is_even\s*\(\s*2\s*\)/.test(o) ||
        /assertTrue.*is_even\s*\(\s*2\s*\)/.test(o) ||
        /is_even\s*\(\s*2\s*\)\s*==\s*True/.test(o);

      // Check that tests treat is_even(3) as False (correct per code)
      const treatsOdd3AsFalse =
        /is_even\s*\(\s*3\s*\)\s*(==\s*False|is\s+False)/.test(o) ||
        /assert\s+not\s+is_even\s*\(\s*3\s*\)/.test(o) ||
        /assertFalse.*is_even\s*\(\s*3\s*\)/.test(o) ||
        /is_even\s*\(\s*3\s*\)\s*==\s*False/.test(o);

      // Detect WRONG behavior: following the docstring instead of code
      const wrongFollowsDocstring =
        /is_even\s*\(\s*3\s*\)\s*(==\s*True|is\s+True)/.test(o) ||
        /assertTrue.*is_even\s*\(\s*3\s*\)/.test(o) ||
        /is_even\s*\(\s*2\s*\)\s*(==\s*False|is\s+False)/.test(o) ||
        /assertFalse.*is_even\s*\(\s*2\s*\)/.test(o);

      if (wrongFollowsDocstring)
        return {
          pass: false,
          reason:
            'Tests follow the WRONG docstring instead of actual code behavior. is_even(2) should be True, is_even(3) should be False',
        };

      if (!treatsEven2AsTrue && !treatsOdd3AsFalse)
        return {
          pass: false,
          reason:
            'Tests must validate actual code behavior: is_even(2)==True, is_even(3)==False',
        };

      return { pass: true };
    },
  },

  // 6. WOW: Property-based / boundary tests for binary search
  {
    id: 'tester-wow-binary-search',
    difficulty: 'wow',
    temperature: 0.2,
    maxTokens: 8000,
    input:
      'Write a thorough, production-quality Python test suite with assertions for:\n\n```python\ndef binary_search(arr, target):\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1\n```\n\nGo beyond basic tests. Think about invariants, boundaries, property-based testing, potential integer overflow issues with `(lo + hi) // 2` for very large arrays, sorted input requirements, and any subtle bugs.',
    validate(output) {
      const o = output.toLowerCase();

      // Must test element not found returns -1
      if (!o.includes('-1'))
        return {
          pass: false,
          reason: 'Must test that element not in list returns -1',
        };

      // Must test first element
      const testsFirst =
        o.includes('[0]') ||
        o.includes('first') ||
        /binary_search\s*\(\s*\[.*\]\s*,\s*\d+\s*\)\s*==\s*0/.test(o);
      if (!testsFirst)
        return {
          pass: false,
          reason: 'Must test finding the first element',
        };

      // Must test last element
      const testsLast =
        o.includes('last') ||
        o.includes('len(') ||
        o.includes('[-1]') ||
        /result\s*==\s*(len|4|9)/.test(o);
      if (!testsLast)
        return {
          pass: false,
          reason: 'Must test finding the last element',
        };

      // Must test single-element list
      const testsSingle =
        /binary_search\s*\(\s*\[\s*\d+\s*\]/.test(o) || o.includes('single');
      if (!testsSingle)
        return {
          pass: false,
          reason: 'Must test single-element list',
        };

      // Must mention sorted requirement
      const testsSorted =
        o.includes('sorted') || o.includes('unsorted') || o.includes('sort');
      if (!testsSorted)
        return {
          pass: false,
          reason:
            'Must test or mention that the function requires a sorted list',
        };

      // WOW factor: overflow awareness
      const hasOverflowAwareness =
        o.includes('overflow') ||
        o.includes('lo + (hi - lo)') ||
        o.includes('lo+(hi-lo)') ||
        /large|huge|big.*number|sys\.maxsize|2\s*\*\*\s*(31|32|63|64)|\d{10,}/.test(o);
      if (!hasOverflowAwareness)
        return {
          pass: false,
          reason:
            'WOW factor missing: must address the integer overflow bug in (lo+hi)//2 or test with very large numbers',
        };

      return { pass: true };
    },
  },

  // 7. WOW-2: Generate mutation-aware tests that catch subtle operator bugs
  {
    id: 'tester-wow-2',
    difficulty: 'wow',
    temperature: 0.2,
    maxTokens: 8000,
    input:
      'Write a thorough, production-quality Python test suite with assertions for:\n\n```python\ndef clamp(value, min_val, max_val):\n    if value < min_val:\n        return min_val\n    if value > max_val:\n        return max_val\n    return value\n```\n\nYour tests must be mutation-resilient — if someone changed `<` to `<=` or `>` to `>=`, at least one test should fail. Think carefully about exact boundary values like `clamp(5, 5, 10)` and `clamp(10, 5, 10)`.',
    validate(output) {
      const o = output.toLowerCase();

      // Must test value == min_val and expect min_val back
      const testsExactMin =
        /clamp\s*\(\s*5\s*,\s*5\s*,\s*10\s*\)/.test(o) ||
        /clamp\s*\(\s*0\s*,\s*0\s*,/.test(o) ||
        /clamp\s*\(\s*1\s*,\s*1\s*,/.test(o) ||
        /value\s*==\s*min|value\s*equals?\s*min|boundary.*min|min.*boundary|exact.*min/.test(o);
      if (!testsExactMin)
        return {
          pass: false,
          reason: 'Must test exact boundary where value equals min_val (e.g., clamp(5, 5, 10) == 5) to catch < vs <= mutation',
        };

      // Must test value == max_val and expect max_val back
      const testsExactMax =
        /clamp\s*\(\s*10\s*,\s*5\s*,\s*10\s*\)/.test(o) ||
        /clamp\s*\(\s*10\s*,\s*0\s*,\s*10\s*\)/.test(o) ||
        /clamp\s*\(\s*\d+\s*,\s*\d+\s*,\s*\1\s*\)/.test(o) ||
        /value\s*==\s*max|value\s*equals?\s*max|boundary.*max|max.*boundary|exact.*max/.test(o);
      if (!testsExactMax)
        return {
          pass: false,
          reason: 'Must test exact boundary where value equals max_val (e.g., clamp(10, 5, 10) == 10) to catch > vs >= mutation',
        };

      // Must have assertions
      if (!o.includes('assert'))
        return { pass: false, reason: 'Missing assert statements' };

      return { pass: true };
    },
  },

  // 8. WOW-3: Identify and test for an untestable side effect hidden in the code
  {
    id: 'tester-wow-3',
    difficulty: 'wow',
    temperature: 0.2,
    maxTokens: 8000,
    input:
      'Write a thorough, production-quality Python test suite with assertions for:\n\n```python\nimport logging\n_call_count = 0\n\ndef process_order(order):\n    global _call_count\n    _call_count += 1\n    if _call_count % 100 == 0:\n        logging.warning(f"Processed {_call_count} orders")\n    total = order["quantity"] * order["price"]\n    tax = total * 0.08\n    return {"subtotal": total, "tax": round(tax, 2), "total": round(total + tax, 2)}\n```\n\nThis function has hidden complexity: global mutable state, a logging side effect every 100th call, and the global state means test order matters. Be thorough — test the math AND the side effects.',
    validate(output) {
      const o = output.toLowerCase();

      // Must reference the global state
      const referencesGlobal =
        o.includes('_call_count') || o.includes('call_count') || o.includes('global');
      if (!referencesGlobal)
        return {
          pass: false,
          reason: 'Must reference _call_count or global state — ignoring the global side effect is a failure',
        };

      // Must mock or patch logging
      const mocksLogging =
        o.includes('mock') || o.includes('patch');
      if (!mocksLogging)
        return {
          pass: false,
          reason: 'Must use mock or patch for the logging side effect',
        };

      // Must test the counting / reset behavior
      const testsCountBehavior =
        o.includes('100') ||
        o.includes('reset') ||
        /call_count\s*=\s*0/.test(o) ||
        /call_count\s*=\s*99/.test(o);
      if (!testsCountBehavior)
        return {
          pass: false,
          reason: 'Must test the 100th-call logging behavior or reset _call_count between tests',
        };

      // Must also test the math
      const testsMath =
        o.includes('subtotal') || o.includes('tax') || o.includes('total');
      if (!testsMath)
        return {
          pass: false,
          reason: 'Must also test the math (subtotal, tax, total)',
        };

      return { pass: true };
    },
  },

  // 9. WOW-4: Generate tests that detect non-deterministic behavior from dict ordering
  {
    id: 'tester-wow-4',
    difficulty: 'wow',
    temperature: 0.2,
    maxTokens: 8000,
    input:
      'Write a thorough, production-quality Python test suite with assertions for:\n\n```python\ndef build_config(settings):\n    parts = []\n    for key in settings:\n        parts.append(f"{key}={settings[key]}")\n    return ";".join(parts)\n```\n\nThis function builds a config string from a dict. In Python 3.7+ dicts are ordered by insertion, but the caller may construct dicts in different orders. Think carefully about whether the output is deterministic and what that means for testing.',
    validate(output) {
      const o = output.toLowerCase();

      // Must reference dict
      if (!o.includes('dict'))
        return {
          pass: false,
          reason: 'Must reference dict in the tests',
        };

      // Must address ordering concern
      const addressesOrder = /order|sort|deterministic/.test(o);
      if (!addressesOrder)
        return {
          pass: false,
          reason: 'Must address dict ordering — either test with different insertion orders, sort before comparing, or mention "order"/"sort"/"deterministic" in tests or comments',
        };

      return { pass: true };
    },
  },

  // 10. WOW-5: Write tests for a function that has a halting problem edge case
  {
    id: 'tester-wow-5',
    difficulty: 'wow',
    temperature: 0.2,
    maxTokens: 8000,
    input:
      'Write a thorough, production-quality Python test suite with assertions for:\n\n```python\ndef collatz_steps(n):\n    if n <= 0:\n        raise ValueError("n must be positive")\n    steps = 0\n    while n != 1:\n        if n % 2 == 0:\n            n = n // 2\n        else:\n            n = 3 * n + 1\n        steps += 1\n    return steps\n```\n\nThis function counts the steps in a well-known mathematical sequence. Be thorough — test known values, error cases, and think about what theoretical guarantees (or lack thereof) this function has regarding termination.',
    validate(output) {
      const o = output.toLowerCase();

      // Must have basic tests: n=1 returns 0
      const testsN1 =
        /collatz_steps\s*\(\s*1\s*\)\s*==\s*0/.test(o) ||
        /assert.*collatz_steps\s*\(\s*1\s*\).*0/.test(o) ||
        (o.includes('collatz_steps(1)') && o.includes('0'));
      if (!testsN1)
        return {
          pass: false,
          reason: 'Must test that collatz_steps(1) returns 0',
        };

      // Must test error case n<=0
      const testsError =
        o.includes('pytest.raises') ||
        o.includes('assertraises') ||
        (o.includes('valueerror') && (o.includes('0') || o.includes('-') || o.includes('negative')));
      if (!testsError)
        return {
          pass: false,
          reason: 'Must test that n<=0 raises ValueError',
        };

      // WOW factor: must recognize this is the Collatz conjecture / termination issue
      const recognizesCollatz =
        /collatz|conjecture|unproven|terminat|halt|max.?iter|timeout|max.?step/.test(o);
      if (!recognizesCollatz)
        return {
          pass: false,
          reason: 'WOW factor missing: must recognize this as the Collatz conjecture and mention termination concerns, or include a timeout/max-iterations guard in a test',
        };

      return { pass: true };
    },
  },
];
