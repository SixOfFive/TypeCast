module.exports = [
  // ===========================================================================
  // 1. Core: Missing dependency step
  // ===========================================================================
  {
    id: 'critic-core-missing-dependency',
    input:
      'Review this plan for a Python web scraper and find any flaws:\n' +
      '1. Write scraper.py with requests and BeautifulSoup\n' +
      '2. Run scraper.py\n' +
      '3. Save results to JSON',
    validate(output) {
      const text = output.toLowerCase();
      const mentionsInstall = /install|pip|dependenc|requirements/.test(text);
      if (!mentionsInstall)
        return { pass: false, reason: 'Must flag the missing dependency install step (pip install / requirements)' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 2. Core: Approve a good plan
  // ===========================================================================
  {
    id: 'critic-core-approve-good-plan',
    input:
      'Review this plan for a todo CLI app and find any flaws:\n' +
      '1. npm init, install dependencies\n' +
      '2. Create CLI entry point with commander.js\n' +
      '3. Implement add/list/done commands with SQLite storage\n' +
      '4. Add input validation and error handling\n' +
      '5. Test all commands manually',
    validate(output) {
      const text = output.toLowerCase();
      const approved = /approved/.test(text);
      const hasCriticalIssues = /critical|warning|flaw|missing|problem|issue|bug|wrong/.test(text);
      if (approved) return { pass: true };
      if (!hasCriticalIssues) return { pass: true };
      return { pass: false, reason: 'Should approve this solid plan or at least not invent CRITICAL/WARNING issues — the plan covers deps, structure, storage, validation, error handling, and testing' };
    }
  },

  // ===========================================================================
  // 3. Applied: Wrong ordering
  // ===========================================================================
  {
    id: 'critic-applied-wrong-ordering',
    input:
      'Review this plan and find any flaws:\n' +
      '1. Deploy to production\n' +
      '2. Write unit tests\n' +
      '3. Write the application code\n' +
      '4. Design the database schema',
    validate(output) {
      const text = output.toLowerCase();
      const mentionsOrder = /order|sequence|before|backward|deploy.*too early|deploy.*first|deploy.*premature|wrong.*order|reversed|step.*1.*should|rearrange/.test(text);
      if (!mentionsOrder)
        return { pass: false, reason: 'Must flag that the steps are in the wrong order (deploy before code, tests before implementation, etc.)' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 4. Applied: Over-engineered
  // ===========================================================================
  {
    id: 'critic-applied-over-engineered',
    input:
      'Review this plan for a personal recipe book app (single user, runs locally) and find any flaws:\n' +
      '1. Set up Kubernetes cluster\n' +
      '2. Configure Redis cache\n' +
      '3. Set up PostgreSQL with read replicas\n' +
      '4. Implement GraphQL API with Apollo\n' +
      '5. Build React Native mobile app\n' +
      '6. Set up CI/CD with Jenkins\n' +
      '7. Configure monitoring with Datadog',
    validate(output) {
      const text = output.toLowerCase();
      const mentionsOverEngineered = /over.?engineer|overkill|complex|simple|unnecessary|personal|local|single.?user/.test(text);
      if (!mentionsOverEngineered)
        return { pass: false, reason: 'Must flag that Kubernetes/Redis/replicas are overkill for a personal local single-user recipe app' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 5. Edge: Subtle missing error handling
  // ===========================================================================
  {
    id: 'critic-edge-missing-error-handling',
    input:
      'Review this plan for a payment processing API and find any flaws:\n' +
      '1. Create POST /charge endpoint\n' +
      '2. Validate card number format\n' +
      '3. Call Stripe API\n' +
      '4. Return success response\n' +
      '5. Log transaction',
    validate(output) {
      const text = output.toLowerCase();
      const mentionsErrorHandling = /error|fail|retry|idempoten|what happens.*(?:step 3|stripe)|stripe.*fail|exception|timeout/.test(text);
      if (!mentionsErrorHandling)
        return { pass: false, reason: 'Must flag missing error handling — what if the Stripe call fails? No retry logic, no idempotency, no failure path' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 6. WOW: Catch a security flaw hidden in a reasonable plan
  // ===========================================================================
  {
    id: 'critic-wow-security-flaw-md5',
    input:
      'Review this plan for user authentication and find any flaws:\n' +
      '1. Create registration endpoint, hash password with MD5\n' +
      '2. Create login endpoint, compare hashes\n' +
      '3. Generate JWT token on success\n' +
      '4. Add token middleware to protected routes\n' +
      '5. Add rate limiting to login',
    validate(output) {
      const text = output.toLowerCase();
      const flagsMd5 = /md5.*(weak|insecure|broken|obsolete|vulnerable|unsuitable|unsafe|rainbow|crack|collision|fast)|(?:weak|insecure|broken|obsolete|vulnerable|unsuitable|unsafe|don't|never|avoid|shouldn't|should not).*md5/.test(text);
      if (!flagsMd5)
        return { pass: false, reason: 'Must flag MD5 as weak/insecure/broken for password hashing' };
      const suggestsBetter = /bcrypt|argon2|scrypt|pbkdf2/.test(text);
      if (!suggestsBetter)
        return { pass: false, reason: 'Must suggest a proper alternative: bcrypt, argon2, scrypt, or PBKDF2' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 7. WOW-2: Catch implicit vendor lock-in in a migration plan
  // ===========================================================================
  {
    id: 'critic-wow-2',
    input:
      'Review this plan for migrating from self-hosted infrastructure to cloud and find any flaws:\n' +
      '1. Move database to AWS RDS Aurora\n' +
      '2. Replace file storage with S3\n' +
      '3. Move caching to ElastiCache\n' +
      '4. Replace message queue with SQS\n' +
      '5. Replace search with CloudSearch\n' +
      '6. Deploy on EKS\n' +
      '7. Set up CloudWatch monitoring',
    validate(output) {
      const text = output.toLowerCase();
      const flagsLockIn = /vendor.?lock|lock.?in|proprietary|single.*provider|cloud.*agnostic|abstraction|portab/.test(text);
      if (!flagsLockIn)
        return { pass: false, reason: 'Must flag vendor lock-in risk — every single component is AWS-proprietary with no abstraction layer' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 8. WOW-3: Identify that the plan solves the wrong problem entirely
  // ===========================================================================
  {
    id: 'critic-wow-3',
    scratchpad:
      'Performance profiling shows 95% of response time is spent in the Stripe API call at line 47 of checkout.py',
    input:
      'Review this plan for "improving API response times" and find any flaws.\n' +
      'Context from profiling: 95% of response time is spent in the Stripe API call at line 47 of checkout.py.\n\n' +
      'Plan:\n' +
      '1. Add Redis caching layer\n' +
      '2. Implement CDN for static assets\n' +
      '3. Add database indexes\n' +
      '4. Enable gzip compression\n' +
      '5. Implement connection pooling',
    validate(output) {
      const text = output.toLowerCase();
      const identifiesRealCause = /stripe|payment|external.*call|api.*call|bottleneck|synchronous/.test(text);
      if (!identifiesRealCause)
        return { pass: false, reason: 'Must identify that the real bottleneck is the Stripe/payment API call, not the areas the plan addresses' };
      const flagsWrongTarget = /wrong.*problem|doesn.?t.*address|won.?t.*help|miss.*actual|miss.*root|miss.*real|ignor|irrelevant|not.*address|actual.*cause|root.*cause|real.*issue|real.*problem|doesn.?t.*solve|won.?t.*solve/.test(text);
      if (!flagsWrongTarget)
        return { pass: false, reason: 'Must explain that the plan optimizations do not address the actual cause of slow response times' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 9. WOW-4: Detect that the plan optimizes for the wrong metric entirely
  // ===========================================================================
  {
    id: 'critic-wow-4',
    input:
      'Review this plan for "improving user engagement" on a learning platform and find any flaws:\n' +
      '1. Add gamification (badges, points, streaks)\n' +
      '2. Send push notifications every 2 hours\n' +
      '3. Add social features (leaderboards, sharing)\n' +
      '4. Implement dark patterns (hard-to-find unsubscribe, guilt-tripping exit modals)\n' +
      '5. Track and optimize for time-on-site metric',
    validate(output) {
      const text = output.toLowerCase();
      let flagCount = 0;

      // Check for dark patterns / ethics concern
      if (/dark.?pattern|unethical|manipulat/.test(text)) flagCount++;
      // Check for wrong metric identification
      if (/wrong.?metric|time.?on.?site.*not|engagement.*not.*learning/.test(text)) flagCount++;
      // Check for push notification spam concern
      if (/push.*spam|notif.*too|every 2 hours/.test(text)) flagCount++;

      if (flagCount < 2)
        return {
          pass: false,
          reason: `Must flag at least 2 of: dark patterns/ethics, wrong metric (time-on-site vs learning outcomes), push notification spam. Found ${flagCount}`,
        };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 10. WOW-5: Identify an unfixable race condition inherent in the plan's architecture
  // ===========================================================================
  {
    id: 'critic-wow-5',
    input:
      'Review this plan for a ticket booking system and find any flaws:\n' +
      '1. Check seat availability via API\n' +
      '2. Display available seats to user\n' +
      '3. User selects seat\n' +
      '4. Reserve the selected seat\n' +
      '5. Process payment\n' +
      '6. Confirm booking',
    validate(output) {
      const text = output.toLowerCase();

      // Must identify the race condition
      const identifiesRace = /race|toctou|concurrent/.test(text);
      if (!identifiesRace)
        return {
          pass: false,
          reason: 'Must identify the race condition / TOCTOU / concurrency issue between checking availability and reserving',
        };

      // Must propose a proper architectural solution
      const proposesSolution = /lock|reservation.*expir|ttl|hold|optimistic|pessimistic|atomic/.test(text);
      if (!proposesSolution)
        return {
          pass: false,
          reason: 'Must propose a solution pattern (locking, reservation with expiry/TTL, hold, optimistic/pessimistic locking, or atomic operation) — just saying "add error handling" is not enough',
        };

      return { pass: true };
    }
  }
];
