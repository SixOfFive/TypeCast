// Test fixtures for the "architect" agent.
// The architect envisions WHAT to build and WHY — no code, no implementation steps.
// Covers architecture, design decisions, error handling, dependencies, edge cases.
//
// Structure: 10 tests with inline validate(output)

module.exports = [
  // ---------------------------------------------------------------------------
  // 1. Core: Simple CLI tool
  // ---------------------------------------------------------------------------
  {
    id: 'architect-core-cli-csv-json',
    difficulty: 'core',
    temperature: 0.1,
    maxTokens: 4000,
    input: 'Design a CLI tool that converts CSV files to JSON.',
    validate(output) {
      const o = output.toLowerCase();

      // Must have structured sections (# headers or numbered sections like "1." "2.")
      const hasHeaders = /^#{1,3}\s+\S/m.test(output) ||
        /^\d+[\.\)]\s+\S/m.test(output);
      if (!hasHeaders)
        return { pass: false, reason: 'Missing structured sections (expected # headers or numbered sections)' };

      // Must mention error handling scenarios
      const mentionsErrors = o.includes('file not found') ||
        o.includes('missing file') ||
        o.includes('malformed') ||
        o.includes('invalid csv') ||
        o.includes('error handling') ||
        o.includes('corrupt') ||
        o.includes('empty file') ||
        o.includes('parse error') ||
        o.includes('graceful');
      if (!mentionsErrors)
        return { pass: false, reason: 'Missing error handling discussion (file not found, malformed CSV, etc.)' };

      // Must NOT contain actual code blocks — architect doesn't write code
      const hasCodeBlocks = /```(?:python|javascript|typescript|js|ts|ruby|go|rust|java|bash|sh)\b[\s\S]*?```/.test(output);
      if (hasCodeBlocks)
        return { pass: false, reason: 'Contains actual code blocks — architect should not produce implementation code' };

      return { pass: true };
    },
  },

  // ---------------------------------------------------------------------------
  // 2. Core: Web app
  // ---------------------------------------------------------------------------
  {
    id: 'architect-core-url-shortener',
    difficulty: 'core',
    temperature: 0.1,
    maxTokens: 4000,
    input: 'Design a URL shortener service.',
    validate(output) {
      const o = output.toLowerCase();

      // Must mention storage/database choice
      const mentionsStorage = o.includes('database') ||
        o.includes('storage') ||
        o.includes('postgres') ||
        o.includes('mysql') ||
        o.includes('redis') ||
        o.includes('dynamo') ||
        o.includes('mongo') ||
        o.includes('sqlite') ||
        o.includes('key-value') ||
        o.includes('persistence');
      if (!mentionsStorage)
        return { pass: false, reason: 'Missing storage/database choice discussion' };

      // Must mention how short codes are generated
      const mentionsCodeGen = o.includes('hash') ||
        o.includes('random') ||
        o.includes('sequential') ||
        o.includes('base62') ||
        o.includes('base58') ||
        o.includes('nanoid') ||
        o.includes('uuid') ||
        o.includes('encode') ||
        o.includes('unique id') ||
        o.includes('collision') ||
        o.includes('short code') ||
        o.includes('slug');
      if (!mentionsCodeGen)
        return { pass: false, reason: 'Missing discussion of how short codes are generated (hash, random, sequential, etc.)' };

      // Must mention redirect mechanism
      const mentionsRedirect = o.includes('redirect') ||
        o.includes('301') ||
        o.includes('302') ||
        o.includes('3xx') ||
        o.includes('http redirect') ||
        o.includes('location header');
      if (!mentionsRedirect)
        return { pass: false, reason: 'Missing redirect mechanism discussion (301/302, HTTP redirect, etc.)' };

      return { pass: true };
    },
  },

  // ---------------------------------------------------------------------------
  // 3. Applied: Real-time system
  // ---------------------------------------------------------------------------
  {
    id: 'architect-applied-collab-editor',
    difficulty: 'applied',
    temperature: 0.1,
    maxTokens: 4000,
    input: 'Design a real-time collaborative text editor like a simplified Google Docs.',
    validate(output) {
      const o = output.toLowerCase();

      // Must mention WebSocket or SSE or real-time protocol
      const mentionsRealtime = o.includes('websocket') ||
        o.includes('web socket') ||
        o.includes('sse') ||
        o.includes('server-sent event') ||
        o.includes('real-time protocol') ||
        o.includes('socket.io') ||
        o.includes('long polling') ||
        o.includes('bidirectional');
      if (!mentionsRealtime)
        return { pass: false, reason: 'Missing real-time protocol discussion (WebSocket, SSE, etc.)' };

      // Must mention conflict resolution
      const mentionsConflict = o.includes('ot') ||
        o.includes('operational transform') ||
        o.includes('crdt') ||
        o.includes('conflict resolution') ||
        o.includes('conflict-free') ||
        o.includes('locking') ||
        o.includes('merge') ||
        o.includes('concurrent edit');
      if (!mentionsConflict)
        return { pass: false, reason: 'Missing conflict resolution strategy (OT, CRDT, locking, etc.)' };

      // Must mention how multiple users/cursors are tracked
      const mentionsCursors = o.includes('cursor') ||
        o.includes('presence') ||
        o.includes('user track') ||
        o.includes('active user') ||
        o.includes('collaborator') ||
        o.includes('awareness') ||
        o.includes('participant') ||
        o.includes('selection');
      if (!mentionsCursors)
        return { pass: false, reason: 'Missing discussion of how multiple users/cursors are tracked' };

      return { pass: true };
    },
  },

  // ---------------------------------------------------------------------------
  // 4. Applied: With constraints
  // ---------------------------------------------------------------------------
  {
    id: 'architect-applied-pi-backup',
    difficulty: 'applied',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      'Design a file backup system that runs on a Raspberry Pi with 1GB RAM, ' +
      'backs up to a remote S3-compatible storage, handles network interruptions gracefully, ' +
      'and supports incremental backups.',
    validate(output) {
      const o = output.toLowerCase();

      // Must mention incremental/delta approach
      const mentionsIncremental = o.includes('incremental') ||
        o.includes('delta') ||
        o.includes('differential') ||
        o.includes('changed files') ||
        o.includes('modification time') ||
        o.includes('mtime') ||
        o.includes('checksum') ||
        o.includes('rsync');
      if (!mentionsIncremental)
        return { pass: false, reason: 'Missing incremental/delta backup approach' };

      // Must mention network retry/resume
      const mentionsRetry = o.includes('retry') ||
        o.includes('resume') ||
        o.includes('reconnect') ||
        o.includes('backoff') ||
        o.includes('network interrupt') ||
        o.includes('network failure') ||
        o.includes('multipart upload') ||
        o.includes('idempotent');
      if (!mentionsRetry)
        return { pass: false, reason: 'Missing network retry/resume strategy' };

      // Must mention memory constraints (streaming, chunking, not loading full files)
      const mentionsMemory = o.includes('stream') ||
        o.includes('chunk') ||
        o.includes('memory') ||
        o.includes('buffer') ||
        o.includes('1 gb') ||
        o.includes('1gb') ||
        o.includes('limited ram') ||
        o.includes('low-memory') ||
        o.includes('resource-constrained') ||
        o.includes('pipeline');
      if (!mentionsMemory)
        return { pass: false, reason: 'Missing memory constraint handling (streaming, chunking, memory-aware design)' };

      return { pass: true };
    },
  },

  // ---------------------------------------------------------------------------
  // 5. Edge: Must not write code
  // ---------------------------------------------------------------------------
  {
    id: 'architect-edge-no-code-ratelimiter',
    difficulty: 'edge',
    temperature: 0.1,
    maxTokens: 4000,
    input: 'Design a rate limiter for an API.',
    validate(output) {
      const o = output.toLowerCase();

      // Must describe the algorithm choice
      const mentionsAlgo = o.includes('token bucket') ||
        o.includes('sliding window') ||
        o.includes('fixed window') ||
        o.includes('leaky bucket') ||
        o.includes('sliding log') ||
        o.includes('rate limit algorithm') ||
        o.includes('counter-based');
      if (!mentionsAlgo)
        return { pass: false, reason: 'Missing rate limiting algorithm choice (token bucket, sliding window, etc.)' };

      // Must NOT contain code blocks with language tags that have function definitions
      // Pseudocode blocks (```pseudocode or ``` without lang) are ok
      const codeBlockRegex = /```(?:python|javascript|typescript|js|ts|ruby|go|rust|java|c\+\+|c#|php|kotlin|swift|scala)\b([\s\S]*?)```/gi;
      let match;
      while ((match = codeBlockRegex.exec(output)) !== null) {
        const block = match[1];
        // Check for function definitions inside the code block
        const hasFuncDef = /\b(?:def |function |func |fn |const \w+ = (?:\(|async)|class |pub fn |private |public |protected )/i.test(block);
        if (hasFuncDef)
          return { pass: false, reason: 'Contains code blocks with function definitions — architect should describe, not implement' };
      }

      return { pass: true };
    },
  },

  // ---------------------------------------------------------------------------
  // 6. WOW: Identify the REAL problem
  // ---------------------------------------------------------------------------
  {
    id: 'architect-wow-pushback-login-email',
    difficulty: 'wow',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      'Design a system that sends an email notification every time a user logs in.',
    validate(output) {
      const o = output.toLowerCase();

      // The architect should push back or propose alternatives.
      // Must mention at least one of these concern/alternative keywords.
      const mentionsPushback = o.includes('suspicious') ||
        o.includes('unusual') ||
        o.includes('digest') ||
        o.includes('preferences') ||
        o.includes('threshold') ||
        o.includes('fatigue') ||
        o.includes('spam') ||
        o.includes('configurable');
      if (!mentionsPushback)
        return {
          pass: false,
          reason:
            'Failed to question the requirement — a good architect should flag notification fatigue/spam ' +
            'and propose alternatives (suspicious login only, digest, configurable preferences, etc.)',
        };

      return { pass: true };
    },
  },

  // ---------------------------------------------------------------------------
  // 7. WOW: Identify the CAP theorem tradeoff and explicitly choose
  // ---------------------------------------------------------------------------
  {
    id: 'architect-wow-2',
    difficulty: 'wow',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      'Design a globally distributed inventory system for an e-commerce platform. ' +
      'It needs to handle 10,000 orders/second across 5 regions, show accurate stock counts, ' +
      'and never oversell.',
    validate(output) {
      const o = output.toLowerCase();

      // Must acknowledge the CAP / consistency tradeoff
      const mentionsCAP = o.includes('cap') ||
        o.includes('consistency') ||
        o.includes('partition') ||
        o.includes('tradeoff') ||
        o.includes('trade-off');
      if (!mentionsCAP)
        return {
          pass: false,
          reason:
            'Failed to acknowledge the CAP theorem tradeoff — "accurate stock counts" + "never oversell" + ' +
            '"globally distributed" is a fundamental distributed systems tension that must be addressed',
        };

      // Must NOT contain actual code blocks — architect doesn't write code
      const hasCodeBlocks = /```(?:python|javascript|typescript|js|ts|ruby|go|rust|java|bash|sh)\b[\s\S]*?```/.test(output);
      if (hasCodeBlocks)
        return { pass: false, reason: 'Contains actual code blocks — architect should not produce implementation code' };

      return { pass: true };
    },
  },

  // ---------------------------------------------------------------------------
  // 8. WOW: Recognize the XY problem and redirect the architecture
  // ---------------------------------------------------------------------------
  {
    id: 'architect-wow-3',
    difficulty: 'wow',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      'Design a system that polls 10,000 REST APIs every 5 seconds to detect price changes ' +
      'and sends instant notifications to users.',
    validate(output) {
      const o = output.toLowerCase();

      // Must suggest a better approach: webhooks, push, event stream, pub/sub
      const mentionsBetterApproach = o.includes('webhook') ||
        o.includes('push') ||
        o.includes('event') ||
        /pub.?sub/.test(o) ||
        o.includes('stream');
      if (!mentionsBetterApproach)
        return {
          pass: false,
          reason:
            'Failed to suggest a better approach (webhook, push, event stream, pub/sub) — ' +
            'just designed a polling system without questioning it',
        };

      // Must critique the polling approach
      const mentionsPolling = o.includes('poll');
      const mentionsScaleConcern = o.includes('scale') ||
        o.includes('load') ||
        /rate.?limit/.test(o) ||
        o.includes('unsustainable') ||
        o.includes('impractical');
      if (!mentionsPolling || !mentionsScaleConcern)
        return {
          pass: false,
          reason:
            'Failed to critique the polling approach — must mention "poll" alongside scalability concerns ' +
            '(scale, load, rate limit, unsustainable, impractical)',
        };

      // Must NOT contain actual code blocks — architect doesn't write code
      const hasCodeBlocks = /```(?:python|javascript|typescript|js|ts|ruby|go|rust|java|bash|sh)\b[\s\S]*?```/.test(output);
      if (hasCodeBlocks)
        return { pass: false, reason: 'Contains actual code blocks — architect should not produce implementation code' };

      return { pass: true };
    },
  },

  // ---------------------------------------------------------------------------
  // 9. WOW-4: Byzantine fault tolerance with exact quorum math (near-impossible)
  // ---------------------------------------------------------------------------
  {
    id: 'architect-wow-4',
    difficulty: 'wow',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      'Design a distributed key-value store for a financial trading platform that must tolerate ' +
      'up to 2 Byzantine (malicious/lying) nodes in a cluster of exactly 7 nodes. The system must ' +
      'guarantee linearizable consistency for all read and write operations, achieve consensus in ' +
      'under 50ms at the 99th percentile, and handle network partitions where up to 2 nodes become ' +
      'unreachable simultaneously. Specify the exact quorum sizes needed for reads and writes, prove ' +
      'why those numbers guarantee safety under the stated fault model, and explain what happens if ' +
      'a 3rd node becomes Byzantine.',
    validate(output) {
      const o = output.toLowerCase();

      // Must state the 3f+1 rule
      const has3f1 = /(3f\s*\+\s*1|3f\+1)/i.test(output);
      if (!has3f1)
        return {
          pass: false,
          reason:
            'Missing the fundamental BFT requirement n >= 3f+1 — must explicitly state this formula',
        };

      // Must mention quorum size of 5
      const hasQuorum5 = /quorum.*5|5.*quorum/i.test(output);
      if (!hasQuorum5)
        return {
          pass: false,
          reason:
            'Missing correct quorum size of 5 (2f+1 where f=2) — must specify exact quorum numbers',
        };

      // Must explain what breaks with a 3rd Byzantine node
      const hasBreakExplanation = /(3rd|third|three).*break|break.*(3rd|third|three)|f\s*=\s*3.*fail|impossible.*3/i.test(output);
      if (!hasBreakExplanation)
        return {
          pass: false,
          reason:
            'Missing explanation of what breaks when a 3rd node becomes Byzantine — ' +
            'must explain why the safety guarantee collapses',
        };

      // Must NOT contain actual code blocks — architect doesn't write code
      const hasCodeBlocks = /```(?:python|javascript|typescript|js|ts|ruby|go|rust|java|bash|sh)\b[\s\S]*?```/.test(output);
      if (hasCodeBlocks)
        return { pass: false, reason: 'Contains actual code blocks — architect should not produce implementation code' };

      return { pass: true };
    },
  },

  // ---------------------------------------------------------------------------
  // 10. WOW-5: Prove impossibility and propose minimal relaxation (virtually impossible)
  // ---------------------------------------------------------------------------
  {
    id: 'architect-wow-5',
    difficulty: 'wow',
    temperature: 0.1,
    maxTokens: 4000,
    input:
      'Design a system that provides all three: (1) exactly-once message delivery between ' +
      'microservices over an unreliable network where messages can be lost, duplicated, or ' +
      'reordered, (2) guaranteed delivery within a bounded time T regardless of network conditions, ' +
      'and (3) zero coordination overhead between sender and receiver — no acknowledgments, no ' +
      'sequence numbers, no state shared between the two services.',
    validate(output) {
      const o = output.toLowerCase();

      // Must identify this as impossible (Two Generals / FLP / impossibility)
      const hasImpossibility = /(two generals|flp|impossib)/i.test(output);
      if (!hasImpossibility)
        return {
          pass: false,
          reason:
            'Failed to identify the fundamental impossibility — must reference Two Generals Problem, ' +
            'FLP impossibility, or explicitly state this combination is impossible',
        };

      // Must propose the minimal relaxation (idempotency / relaxing coordination minimally)
      const hasMinimalRelaxation = /(idempoten|relaxi?|minimal.*coordinat|minimal.*state)/i.test(output);
      if (!hasMinimalRelaxation)
        return {
          pass: false,
          reason:
            'Failed to propose the minimal relaxation — must suggest idempotency keys or explicitly ' +
            'identify which requirement to relax minimally (not just "use Kafka")',
        };

      // Must NOT contain actual code blocks — architect doesn't write code
      const hasCodeBlocks = /```(?:python|javascript|typescript|js|ts|ruby|go|rust|java|bash|sh)\b[\s\S]*?```/.test(output);
      if (hasCodeBlocks)
        return { pass: false, reason: 'Contains actual code blocks — architect should not produce implementation code' };

      return { pass: true };
    },
  },
];
