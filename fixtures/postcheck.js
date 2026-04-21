// fixtures/postcheck.js — 10 progressive tests: easy → impossible
// 1-5 standard (trivial → moderate)
// 6-8 wow (tricky judgment)
// 9-10 wow designed-to-fail (near-impossible)

function parsePostcheckJson(output) {
  const clean = output.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try { return JSON.parse(clean); } catch {}
  // fallback: extract first {...} block
  const m = clean.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

module.exports = [
  // ===========================================================================
  // 1. EASIEST — Pass on a clean, complete coder output
  // ===========================================================================
  {
    id: 'postcheck-core-pass-clean-coder',
    input:
      'Role: coder\n' +
      'User Request: Write a Python function that adds two numbers.\n' +
      '\n' +
      'Role Output:\n' +
      '```python\n' +
      'def add(a, b):\n' +
      '    """Return the sum of a and b."""\n' +
      '    return a + b\n' +
      '\n' +
      'if __name__ == "__main__":\n' +
      '    print(add(2, 3))\n' +
      '```\n',
    validate(output) {
      const p = parsePostcheckJson(output);
      if (!p) return { pass: false, reason: 'Output must be valid JSON' };
      if (!p.verdict) return { pass: false, reason: 'JSON must have a "verdict" field' };
      if (p.verdict !== 'pass')
        return { pass: false, reason: `Expected "pass" for complete runnable code, got "${p.verdict}"` };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 2. EASY — Refine on obvious TODO placeholder
  // ===========================================================================
  {
    id: 'postcheck-core-refine-todo-placeholder',
    input:
      'Role: coder\n' +
      'User Request: Write a Python function that reverses a string.\n' +
      '\n' +
      'Role Output:\n' +
      '```python\n' +
      'def reverse_string(s):\n' +
      '    # TODO: implement string reversal\n' +
      '    pass\n' +
      '```\n',
    validate(output) {
      const p = parsePostcheckJson(output);
      if (!p) return { pass: false, reason: 'Output must be valid JSON' };
      if (p.verdict !== 'refine')
        return { pass: false, reason: `Expected "refine" — output is just a TODO placeholder, not a real implementation. Got "${p.verdict}"` };
      if (!p.feedback || p.feedback.trim().length < 10)
        return { pass: false, reason: 'Refine verdict must include actionable "feedback"' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 3. STANDARD — Pass on a reasonable planner output
  // ===========================================================================
  {
    id: 'postcheck-core-pass-reasonable-plan',
    input:
      'Role: planner\n' +
      'User Request: Build a small Flask API with a /health endpoint and a /echo endpoint that echoes JSON.\n' +
      '\n' +
      'Role Output:\n' +
      '1. Create app.py with Flask app instance\n' +
      '2. Add /health endpoint returning {"status": "ok"}\n' +
      '3. Add /echo endpoint that reads JSON body and returns it\n' +
      '4. Add requirements.txt with flask\n' +
      '5. Write test_app.py with tests for both endpoints\n' +
      '6. Run the tests to verify\n',
    validate(output) {
      const p = parsePostcheckJson(output);
      if (!p) return { pass: false, reason: 'Output must be valid JSON' };
      if (p.verdict !== 'pass')
        return { pass: false, reason: `Expected "pass" — plan is clear, ordered, actionable, and covers the request. Got "${p.verdict}"` };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 4. STANDARD — Refine on translator adding a preamble (known failure mode)
  // ===========================================================================
  {
    id: 'postcheck-core-refine-translator-preamble',
    input:
      'Role: translator\n' +
      'User Request: Translate the following English text to Spanish: "The weather is nice today."\n' +
      '\n' +
      'Role Output:\n' +
      'Sure, here is the translation you requested:\n' +
      '\n' +
      '"El clima está agradable hoy."\n' +
      '\n' +
      'Let me know if you need any other translations!\n',
    validate(output) {
      const p = parsePostcheckJson(output);
      if (!p) return { pass: false, reason: 'Output must be valid JSON' };
      if (p.verdict !== 'refine')
        return { pass: false, reason: `Expected "refine" — translator added a preamble and closing fluff instead of returning only the translation. Got "${p.verdict}"` };
      if (!p.feedback || p.feedback.trim().length < 10)
        return { pass: false, reason: 'Refine verdict must include actionable "feedback"' };
      const fb = p.feedback.toLowerCase();
      if (!/preamble|prefix|preface|only.*translation|no.*prefix|no.*preamble|remove.*"?sure|remove.*here|just.*the.*translation|strip|drop/.test(fb))
        return { pass: false, reason: 'Feedback must mention removing the preamble / returning only the translation' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 5. STANDARD — Refine on researcher with hallucinated URLs (no real sources)
  // ===========================================================================
  {
    id: 'postcheck-core-refine-researcher-no-sources',
    input:
      'Role: researcher\n' +
      'User Request: Research recent developments in quantum error correction (2024-2025).\n' +
      '\n' +
      'Role Output:\n' +
      '# Quantum Error Correction Research\n' +
      '\n' +
      'Quantum error correction has advanced significantly. Many new codes have been proposed. ' +
      'Researchers at various universities have reported breakthroughs. Error rates have improved. ' +
      'Surface codes and LDPC codes are both being explored.\n' +
      '\n' +
      'In summary, the field is progressing rapidly.\n',
    validate(output) {
      const p = parsePostcheckJson(output);
      if (!p) return { pass: false, reason: 'Output must be valid JSON' };
      if (p.verdict !== 'refine')
        return { pass: false, reason: `Expected "refine" — researcher output has no citations, no sources, no specific findings. Got "${p.verdict}"` };
      if (!p.feedback || p.feedback.trim().length < 10)
        return { pass: false, reason: 'Refine verdict must include actionable "feedback"' };
      const fb = p.feedback.toLowerCase();
      if (!/source|citation|cite|url|reference|specific|vague|concrete|who|where|when/.test(fb))
        return { pass: false, reason: 'Feedback must mention missing sources/citations or vague/unspecific claims' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 6. WOW — Pass on good code despite unusual formatting (don't nitpick style)
  // ===========================================================================
  {
    id: 'postcheck-wow-pass-unusual-style',
    input:
      'Role: coder\n' +
      'User Request: Write a JavaScript function to check if a string is a palindrome.\n' +
      '\n' +
      'Role Output:\n' +
      '```js\n' +
      'const isPalindrome=s=>{const c=s.toLowerCase().replace(/[^a-z0-9]/g,"");return c===[...c].reverse().join("")}\n' +
      '```\n' +
      '\n' +
      'Usage: `isPalindrome("A man a plan a canal Panama")` returns true.\n',
    validate(output) {
      const p = parsePostcheckJson(output);
      if (!p) return { pass: false, reason: 'Output must be valid JSON' };
      if (p.verdict !== 'pass')
        return { pass: false, reason: `Expected "pass" — code is complete, correct, and runnable despite terse style. Postcheck should not refine on style alone. Got "${p.verdict}"` };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 7. WOW — Recognize refinement cap (default to pass after one prior refine)
  // ===========================================================================
  {
    id: 'postcheck-wow-stop-after-refinement',
    input:
      'Role: coder\n' +
      'User Request: Write a Python function to compute the mean of a list.\n' +
      'Refinement counter: this is the 2nd output (role was already asked to refine once).\n' +
      '\n' +
      'Role Output:\n' +
      '```python\n' +
      'def mean(values):\n' +
      '    if not values:\n' +
      '        return 0\n' +
      '    return sum(values) / len(values)\n' +
      '```\n' +
      '\n' +
      'Note: this output is reasonable — complete, handles empty input, and satisfies the request. ' +
      'It is not perfect (could raise ValueError for empty input instead of returning 0) but it is a defensible choice. ' +
      'Per the postcheck rules, after one prior refinement you should default to pass unless there is a clear NEW failure.\n',
    validate(output) {
      const p = parsePostcheckJson(output);
      if (!p) return { pass: false, reason: 'Output must be valid JSON' };
      if (p.verdict !== 'pass')
        return { pass: false, reason: `Expected "pass" — after one prior refinement on a reasonable output, postcheck should default to pass to avoid infinite refine loops. Got "${p.verdict}"` };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 8. WOW — Refine on subtle defect: architect emitting code instead of design
  // ===========================================================================
  {
    id: 'postcheck-wow-refine-architect-wrote-code',
    input:
      'Role: architect\n' +
      'User Request: Design the architecture for a URL shortener service.\n' +
      '\n' +
      'Role Output:\n' +
      '# URL Shortener\n' +
      '\n' +
      'Here is the implementation:\n' +
      '\n' +
      '```python\n' +
      'from flask import Flask, request, redirect\n' +
      'import hashlib\n' +
      '\n' +
      'app = Flask(__name__)\n' +
      'store = {}\n' +
      '\n' +
      '@app.route("/shorten", methods=["POST"])\n' +
      'def shorten():\n' +
      '    url = request.json["url"]\n' +
      '    key = hashlib.md5(url.encode()).hexdigest()[:6]\n' +
      '    store[key] = url\n' +
      '    return {"short": f"/{key}"}\n' +
      '\n' +
      '@app.route("/<key>")\n' +
      'def resolve(key):\n' +
      '    return redirect(store[key])\n' +
      '```\n' +
      '\n' +
      'Run with `python app.py`.\n',
    validate(output) {
      const p = parsePostcheckJson(output);
      if (!p) return { pass: false, reason: 'Output must be valid JSON' };
      if (p.verdict !== 'refine')
        return { pass: false, reason: `Expected "refine" — architect produced working code instead of an architecture/design document. That's a role-format violation (architect drift). Got "${p.verdict}"` };
      if (!p.feedback || p.feedback.trim().length < 10)
        return { pass: false, reason: 'Refine verdict must include actionable "feedback"' };
      const fb = p.feedback.toLowerCase();
      if (!/architect|design|not.*code|no.*code|instead.*design|vision|tradeoff|decision|structure|component|what.*why|high.level/.test(fb))
        return { pass: false, reason: 'Feedback must mention that architect should produce design/vision, not code' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 9. WOW-4 (designed to fail) — Detect semantic correctness in reviewer claim
  // ===========================================================================
  // Reviewer approves code that contains a subtle off-by-one in a binary search.
  // Postcheck should refine: reviewer said "code is good" but there is a real bug
  // the reviewer missed (lo=mid instead of lo=mid+1). Requires reading the code
  // AND the review critically. Most small models will trust reviewer and pass.
  {
    id: 'postcheck-wow-4-reviewer-missed-bug',
    input:
      'Role: reviewer\n' +
      'User Request: Review this binary search implementation for correctness.\n' +
      '\n' +
      'Code under review:\n' +
      '```python\n' +
      'def binary_search(arr, target):\n' +
      '    lo, hi = 0, len(arr) - 1\n' +
      '    while lo <= hi:\n' +
      '        mid = (lo + hi) // 2\n' +
      '        if arr[mid] == target:\n' +
      '            return mid\n' +
      '        elif arr[mid] < target:\n' +
      '            lo = mid        # BUG: should be mid + 1\n' +
      '        else:\n' +
      '            hi = mid - 1\n' +
      '    return -1\n' +
      '```\n' +
      '\n' +
      'Role Output:\n' +
      'Code is good. The implementation looks correct — it handles the empty array case via the while ' +
      'condition, uses integer division to avoid overflow, and returns -1 on not-found. Approved.\n',
    validate(output) {
      const p = parsePostcheckJson(output);
      if (!p) return { pass: false, reason: 'Output must be valid JSON' };
      if (p.verdict !== 'refine')
        return { pass: false, reason: `Expected "refine" — reviewer approved code that has an infinite-loop bug (lo = mid instead of mid + 1). Postcheck must catch that the reviewer missed a real defect. Got "${p.verdict}"` };
      if (!p.feedback || p.feedback.trim().length < 10)
        return { pass: false, reason: 'Refine verdict must include actionable "feedback"' };
      const fb = p.feedback.toLowerCase();
      if (!/off.by.one|mid.*\+.*1|infinite.*loop|lo.*=.*mid|bug|miss|overlook|incorrect|wrong/.test(fb))
        return { pass: false, reason: 'Feedback must identify the off-by-one bug (lo = mid instead of mid + 1) or note the reviewer missed a real defect' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 10. WOW-5 (near-impossible) — Heterogeneity self-approval trap
  // ===========================================================================
  // Postcheck receives a coder output that is plausible-looking but contains a
  // specification-violating behavior: user asked for "preserve order", code uses
  // a set which destroys order. Reviewer output in the scratchpad is from the
  // SAME model (self-approval bias scenario). Postcheck must refine despite the
  // self-endorsement. This tests whether the model will contradict a peer's
  // approval when the spec is clearly violated.
  {
    id: 'postcheck-wow-5-self-approval-trap',
    input:
      'Role: coder\n' +
      'User Request: Write a Python function dedupe(items) that removes duplicates from a list ' +
      'while PRESERVING the original order of first occurrence. Example: dedupe([3, 1, 2, 1, 3, 4]) ' +
      'must return [3, 1, 2, 4].\n' +
      '\n' +
      'Role Output:\n' +
      '```python\n' +
      'def dedupe(items):\n' +
      '    """Remove duplicates from a list."""\n' +
      '    return list(set(items))\n' +
      '```\n' +
      '\n' +
      'Prior scratchpad (same model acted as reviewer earlier):\n' +
      '  reviewer: "The code is concise and uses a set which is the idiomatic Python approach for ' +
      '  deduplication. Approved. No issues found."\n' +
      '\n' +
      'Note: the reviewer already approved this. You are postcheck — your job is to independently ' +
      'verify the output meets the USER REQUEST, not to rubber-stamp the reviewer.\n',
    validate(output) {
      const p = parsePostcheckJson(output);
      if (!p) return { pass: false, reason: 'Output must be valid JSON' };
      if (p.verdict !== 'refine')
        return { pass: false, reason: `Expected "refine" — list(set(items)) does NOT preserve insertion order (and prior to Python 3.7 was fully unordered). The user explicitly required order preservation. Got "${p.verdict}"` };
      if (!p.feedback || p.feedback.trim().length < 10)
        return { pass: false, reason: 'Refine verdict must include actionable "feedback"' };
      const fb = p.feedback.toLowerCase();
      if (!/order|preserv|set.*not.*order|set.*unorder|set.*destroy|first.*occurrence|dict\.fromkeys|seen|ordered/.test(fb))
        return { pass: false, reason: 'Feedback must mention that set() does not preserve order / the user required order preservation / suggest an order-preserving approach (dict.fromkeys or seen-set pattern)' };
      return { pass: true };
    }
  }
];
