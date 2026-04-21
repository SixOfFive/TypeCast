module.exports = [
  // ===========================================================================
  // 1. Core: Simple script
  // ===========================================================================
  {
    id: 'planner-core-simple-script',
    input:
      'Create a Python script that reads a CSV file and prints the top 5 rows sorted by the \'revenue\' column',
    validate(output) {
      const text = output.toLowerCase();
      const stepPattern = /^\s*\d+[\.\)]/gm;
      const steps = text.match(stepPattern) || [];
      if (steps.length < 3) return { pass: false, reason: `Expected at least 3 numbered steps, found ${steps.length}` };
      const mentionsPandasOrCsv = /pandas|csv/.test(text);
      if (!mentionsPandasOrCsv) return { pass: false, reason: 'Must mention pandas or csv module' };
      const mentionsFile = /\.csv|file|read/.test(text);
      if (!mentionsFile) return { pass: false, reason: 'Must mention the CSV file or reading a file' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 2. Core: Basic web app
  // ===========================================================================
  {
    id: 'planner-core-basic-webapp',
    input:
      'Build a static HTML page with a form that collects name and email, validates inputs with JavaScript, and shows a success message',
    validate(output) {
      const text = output.toLowerCase();
      const stepPattern = /^\s*\d+[\.\)]/gm;
      const steps = text.match(stepPattern) || [];
      if (steps.length < 3) return { pass: false, reason: `Expected at least 3 numbered steps, found ${steps.length}` };
      const mentionsHtml = /html/.test(text);
      if (!mentionsHtml) return { pass: false, reason: 'Must mention HTML' };
      const mentionsJs = /javascript|\.js\b|js\b/.test(text);
      if (!mentionsJs) return { pass: false, reason: 'Must mention JavaScript or JS files' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 3. Applied: Multi-component
  // ===========================================================================
  {
    id: 'planner-applied-multi-component',
    input:
      'Build a REST API with Express.js that has CRUD endpoints for a \'tasks\' resource, stores data in SQLite, includes input validation, and has error handling middleware',
    validate(output) {
      const text = output.toLowerCase();
      const stepPattern = /^\s*\d+[\.\)]/gm;
      const steps = text.match(stepPattern) || [];
      if (steps.length < 5) return { pass: false, reason: `Expected at least 5 numbered steps, found ${steps.length}` };
      if (!/express/.test(text)) return { pass: false, reason: 'Must mention Express' };
      if (!/sqlite/.test(text)) return { pass: false, reason: 'Must mention SQLite' };
      // Check for specific endpoint mentions (GET, POST, PUT/PATCH, DELETE or CRUD language)
      const endpointPatterns = /get\s+\/|post\s+\/|put\s+\/|patch\s+\/|delete\s+\/|crud|endpoint/;
      if (!endpointPatterns.test(text)) return { pass: false, reason: 'Must mention specific endpoints or CRUD operations' };
      if (!/error.?handl|middleware/.test(text)) return { pass: false, reason: 'Must mention error handling or middleware' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 4. Applied: With dependencies
  // ===========================================================================
  {
    id: 'planner-applied-with-dependencies',
    input:
      'Create a CLI tool in Python that takes a URL, scrapes all images from the page, downloads them to a local folder, and generates a markdown report listing each image with its dimensions',
    validate(output) {
      const text = output.toLowerCase();
      const stepPattern = /^\s*\d+[\.\)]/gm;
      const steps = text.match(stepPattern) || [];
      if (steps.length < 5) return { pass: false, reason: `Expected at least 5 numbered steps, found ${steps.length}` };
      // Must mention key dependencies
      const mentionsRequests = /requests|httpx|urllib/.test(text);
      const mentionsBs = /beautifulsoup|bs4|lxml|html\.parser/.test(text);
      const mentionsPillow = /pillow|pil|image/.test(text);
      if (!mentionsRequests) return { pass: false, reason: 'Must mention requests, httpx, or urllib' };
      if (!mentionsBs) return { pass: false, reason: 'Must mention BeautifulSoup, bs4, lxml, or html parser' };
      if (!mentionsPillow) return { pass: false, reason: 'Must mention Pillow or PIL for image dimensions' };
      // pip install must come BEFORE the coding/implementation step
      const pipIndex = text.search(/pip install|install.*dependenc|requirements\.txt|set.?up.*environment|install.*package/);
      const codeIndex = text.search(/implement|writ(?:e|ing).*(?:script|code|logic)|build.*(?:scraper|tool|cli)|creat(?:e|ing).*(?:script|module)/);
      if (pipIndex === -1) return { pass: false, reason: 'Must mention pip install or installing dependencies' };
      if (codeIndex !== -1 && pipIndex > codeIndex) return { pass: false, reason: 'Dependency install step must come BEFORE the code/implementation step' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 5. Edge: Must include testing
  // ===========================================================================
  {
    id: 'planner-edge-must-include-testing',
    input:
      'Build a Python library with functions for validating email addresses, phone numbers, and postal codes',
    validate(output) {
      const text = output.toLowerCase();
      const stepPattern = /^\s*\d+[\.\)]/gm;
      const steps = text.match(stepPattern) || [];
      if (steps.length < 3) return { pass: false, reason: `Expected at least 3 numbered steps, found ${steps.length}` };
      const mentionsTesting = /test|pytest|unittest|verif|spec/.test(text);
      if (!mentionsTesting) return { pass: false, reason: 'Plan must mention testing/tests/pytest — a plan without verification steps is incomplete' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 6. WOW: Detect over-engineering and stay practical
  // ===========================================================================
  {
    id: 'planner-wow-no-overengineering',
    input:
      'Create a script that renames all .jpg files in a folder by prepending today\'s date (e.g., 2025-01-15_photo.jpg)',
    validate(output) {
      const text = output.toLowerCase();
      const stepPattern = /^\s*\d+[\.\)]/gm;
      const steps = text.match(stepPattern) || [];
      const stepCount = steps.length;
      if (stepCount < 2) return { pass: false, reason: `Too few steps (${stepCount}). Even a simple plan needs 2-5 steps` };
      if (stepCount > 5) return { pass: false, reason: `Over-engineered: ${stepCount} steps for a simple file rename script (expected 2-5)` };
      // Check for absurd over-engineering keywords
      const overEngineeringWords = /microservice|docker|kubernetes|ci\/cd|database|design.?pattern|logging.?infrastructure|configuration.?management|message.?queue|load.?balanc/;
      const match = text.match(overEngineeringWords);
      if (match) return { pass: false, reason: `Over-engineered: mentions "${match[0]}" for a simple file rename script` };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 7. WOW-2: Must identify a circular dependency in requirements
  // ===========================================================================
  {
    id: 'planner-wow-2',
    name: 'WOW-2: Must identify a circular dependency in requirements',
    difficulty: 'wow',
    input:
      'Build a system where: Service A needs data from Service B to start. Service B needs config from Service C to initialize. Service C reads its config from Service A\'s API endpoint.',
    validate(output) {
      const text = output.toLowerCase();
      const stepPattern = /^\s*\d+[\.\)]/gm;
      const steps = text.match(stepPattern) || [];
      if (steps.length < 2) return { pass: false, reason: `Expected at least 2 numbered steps, found ${steps.length}` };
      // Must recognise the circular dependency
      const recognisesCircular = /circular|cycle|deadlock|bootstrap|chicken.+egg/i.test(output);
      if (!recognisesCircular) return { pass: false, reason: 'Must identify the circular dependency (A\u2192B\u2192C\u2192A) \u2014 expected "circular", "cycle", "deadlock", "bootstrap", or "chicken...egg"' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 8. WOW-3: Must produce a correct dependency DAG for 8 interdependent tasks
  // ===========================================================================
  {
    id: 'planner-wow-3',
    name: 'WOW-3: Must produce a correct dependency DAG for 8 interdependent tasks',
    difficulty: 'wow',
    input:
      'Build a data pipeline: 1) Set up PostgreSQL schema 2) Build the ingestion microservice (needs schema) 3) Build the transformation service (needs schema) 4) Build the API gateway (needs both ingestion and transformation running) 5) Write integration tests (needs gateway + both services) 6) Set up monitoring (needs all services) 7) Create CI/CD pipeline (needs tests passing) 8) Write documentation (needs everything done)',
    validate(output) {
      const text = output.toLowerCase();
      const stepPattern = /^\s*(\d+)[\.\)]\s*(.*)/gm;
      const stepsArr = [];
      let m;
      while ((m = stepPattern.exec(text)) !== null) {
        stepsArr.push({ num: parseInt(m[1], 10), text: m[2] });
      }
      if (stepsArr.length < 6) return { pass: false, reason: `Expected at least 6 numbered steps, found ${stepsArr.length}` };

      // Helper: find the step index that mentions a keyword
      function stepIndexOf(keyword) {
        return stepsArr.findIndex(s => s.text.includes(keyword));
      }

      const schemaIdx   = stepIndexOf('schema') !== -1 ? stepIndexOf('schema') : stepIndexOf('postgres');
      const ingestIdx   = stepIndexOf('ingestion') !== -1 ? stepIndexOf('ingestion') : stepIndexOf('ingest');
      const transformIdx = stepIndexOf('transform');
      const gatewayIdx  = stepIndexOf('gateway') !== -1 ? stepIndexOf('gateway') : stepIndexOf('api gate');
      const testsIdx    = stepIndexOf('integration test') !== -1 ? stepIndexOf('integration test') : stepIndexOf('test');
      const cicdIdx     = stepIndexOf('ci/cd') !== -1 ? stepIndexOf('ci/cd') : stepIndexOf('ci cd') !== -1 ? stepIndexOf('ci cd') : stepIndexOf('pipeline');

      // Check at least 3 ordering constraints
      const errors = [];
      if (schemaIdx !== -1 && ingestIdx !== -1 && schemaIdx > ingestIdx)
        errors.push('Schema must come before ingestion service');
      if (schemaIdx !== -1 && transformIdx !== -1 && schemaIdx > transformIdx)
        errors.push('Schema must come before transformation service');
      if (ingestIdx !== -1 && gatewayIdx !== -1 && ingestIdx > gatewayIdx)
        errors.push('Ingestion must come before API gateway');
      if (transformIdx !== -1 && gatewayIdx !== -1 && transformIdx > gatewayIdx)
        errors.push('Transformation must come before API gateway');
      if (gatewayIdx !== -1 && testsIdx !== -1 && gatewayIdx > testsIdx)
        errors.push('API gateway must come before integration tests');
      if (testsIdx !== -1 && cicdIdx !== -1 && testsIdx > cicdIdx)
        errors.push('Integration tests must come before CI/CD pipeline');

      if (errors.length > 0) return { pass: false, reason: `Dependency ordering violations: ${errors.join('; ')}` };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 9. WOW-4: Plan must account for eventual consistency delay in a distributed step
  // ===========================================================================
  {
    id: 'planner-wow-4',
    name: 'WOW-4: Plan must account for eventual consistency delay in a distributed step',
    difficulty: 'wow',
    input:
      'Build a system that: 1) Writes user preferences to a distributed database (Cassandra), 2) Immediately reads those preferences back to render a personalized dashboard. The system serves users across 3 geographic regions.',
    validate(output) {
      const text = output.toLowerCase();
      const stepPattern = /^\s*\d+[\.\)]/gm;
      const steps = text.match(stepPattern) || [];
      if (steps.length < 2) return { pass: false, reason: `Expected at least 2 numbered steps, found ${steps.length}` };
      // Must acknowledge the consistency problem
      const consistencyAware = /consistency|eventual|stale|quorum|read-your-own|sticky|replication.*delay/i.test(output);
      if (!consistencyAware) return { pass: false, reason: 'Plan must address eventual consistency — expected "consistency", "eventual", "stale", "quorum", "read-your-own", "sticky", or "replication...delay". A plan that just says "write then read" without addressing the consistency gap fails.' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 10. WOW-5: Must recognize that the task requires NO plan — it's a one-liner
  // ===========================================================================
  {
    id: 'planner-wow-5',
    name: 'WOW-5: Must recognize that the task requires NO plan — it\'s a one-liner',
    difficulty: 'wow',
    input:
      'Generate a UUID.',
    validate(output) {
      const text = output.toLowerCase();
      const stepPattern = /^\s*\d+[\.\)]/gm;
      const steps = text.match(stepPattern) || [];
      const stepCount = steps.length;
      if (stepCount > 2) return { pass: false, reason: `Over-planned a one-liner: ${stepCount} steps to generate a UUID (expected <= 2)` };
      // Must mention a concrete UUID mechanism
      const mentionsUuid = /uuid|randomuuid|crypto|uuid4/.test(text);
      if (!mentionsUuid) return { pass: false, reason: 'Must mention uuid, randomUUID, crypto, or uuid4' };
      return { pass: true };
    }
  }
];
