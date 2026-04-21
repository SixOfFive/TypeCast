function parseRouterJson(output) {
  const clean = output.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try { return JSON.parse(clean); } catch { return null; }
}

module.exports = [
  // 1. Core: Obvious greeting
  {
    id: 'router-1',
    name: 'Obvious greeting classified as chat',
    difficulty: 'standard',
    temperature: 0.1,
    maxTokens: 256,
    input: "Hey, what's up?",
    validate: (output) => {
      const parsed = parseRouterJson(output);
      if (!parsed) return { valid: false, reason: 'Output is not valid JSON' };
      if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
        return { valid: false, reason: `confidence must be a number between 0 and 1, got ${parsed.confidence}` };
      }
      if (parsed.category !== 'chat') {
        return { valid: false, reason: `Expected category "chat", got "${parsed.category}"` };
      }
      if (parsed.confidence <= 0.8) {
        return { valid: false, reason: `Expected confidence > 0.8, got ${parsed.confidence}` };
      }
      return { valid: true, reason: 'Correct: chat with high confidence' };
    },
  },

  // 2. Core: Obvious code request
  {
    id: 'router-2',
    name: 'Obvious code request classified as code',
    difficulty: 'standard',
    temperature: 0.1,
    maxTokens: 256,
    input: 'Write a Python function that reverses a string',
    validate: (output) => {
      const parsed = parseRouterJson(output);
      if (!parsed) return { valid: false, reason: 'Output is not valid JSON' };
      if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
        return { valid: false, reason: `confidence must be a number between 0 and 1, got ${parsed.confidence}` };
      }
      if (parsed.category !== 'code') {
        return { valid: false, reason: `Expected category "code", got "${parsed.category}"` };
      }
      if (parsed.confidence <= 0.8) {
        return { valid: false, reason: `Expected confidence > 0.8, got ${parsed.confidence}` };
      }
      return { valid: true, reason: 'Correct: code with high confidence' };
    },
  },

  // 3. Applied: Research task disguised as question
  {
    id: 'router-3',
    name: 'Research comparison disguised as question',
    difficulty: 'standard',
    temperature: 0.1,
    maxTokens: 256,
    input: 'What are the pros and cons of PostgreSQL vs MongoDB for a high-write analytics workload?',
    validate: (output) => {
      const parsed = parseRouterJson(output);
      if (!parsed) return { valid: false, reason: 'Output is not valid JSON' };
      if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
        return { valid: false, reason: `confidence must be a number between 0 and 1, got ${parsed.confidence}` };
      }
      if (parsed.category !== 'research') {
        return { valid: false, reason: `Expected category "research", got "${parsed.category}". This is an investigation/comparison, not a simple factual question` };
      }
      if (parsed.confidence <= 0.6) {
        return { valid: false, reason: `Expected confidence > 0.6, got ${parsed.confidence}` };
      }
      return { valid: true, reason: 'Correct: research with sufficient confidence' };
    },
  },

  // 4. Applied: Project request
  {
    id: 'router-4',
    name: 'Multi-component project request',
    difficulty: 'standard',
    temperature: 0.1,
    maxTokens: 256,
    input: 'Build me a REST API with Express that has user authentication, CRUD endpoints for blog posts, and a SQLite database',
    validate: (output) => {
      const parsed = parseRouterJson(output);
      if (!parsed) return { valid: false, reason: 'Output is not valid JSON' };
      if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
        return { valid: false, reason: `confidence must be a number between 0 and 1, got ${parsed.confidence}` };
      }
      if (parsed.category !== 'project') {
        return { valid: false, reason: `Expected category "project", got "${parsed.category}"` };
      }
      if (parsed.confidence <= 0.7) {
        return { valid: false, reason: `Expected confidence > 0.7, got ${parsed.confidence}` };
      }
      return { valid: true, reason: 'Correct: project with high confidence' };
    },
  },

  // 5. Edge case: Looks like code but is a question
  {
    id: 'router-5',
    name: 'Code-related explanation is question not code',
    difficulty: 'standard',
    temperature: 0.1,
    maxTokens: 256,
    input: 'What does `Array.prototype.reduce` do in JavaScript?',
    validate: (output) => {
      const parsed = parseRouterJson(output);
      if (!parsed) return { valid: false, reason: 'Output is not valid JSON' };
      if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
        return { valid: false, reason: `confidence must be a number between 0 and 1, got ${parsed.confidence}` };
      }
      if (parsed.category !== 'question') {
        return { valid: false, reason: `Expected category "question", got "${parsed.category}". Asking for explanation is a question, not a request to write code` };
      }
      if (parsed.confidence <= 0.5) {
        return { valid: false, reason: `Expected confidence > 0.5, got ${parsed.confidence}` };
      }
      return { valid: true, reason: 'Correct: question with sufficient confidence' };
    },
  },

  // 6. WOW: Multi-intent sarcastic message with misdirection
  {
    id: 'router-6',
    name: 'Sarcastic multi-intent misdirection is still project',
    difficulty: 'wow',
    temperature: 0.1,
    maxTokens: 256,
    input: "lol ok so my boss wants me to 'just quickly' build a full inventory management system with barcode scanning, real-time stock updates, multi-warehouse support, and oh yeah it needs to work offline too \u{1F602} can you help me not mass-quit today?",
    validate: (output) => {
      const parsed = parseRouterJson(output);
      if (!parsed) return { valid: false, reason: 'Output is not valid JSON' };
      if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
        return { valid: false, reason: `confidence must be a number between 0 and 1, got ${parsed.confidence}` };
      }
      if (parsed.category !== 'project') {
        return { valid: false, reason: `Expected category "project", got "${parsed.category}". Despite sarcasm and emotional content, the core intent is building a multi-component system` };
      }
      if (parsed.confidence <= 0.5) {
        return { valid: false, reason: `Expected confidence > 0.5, got ${parsed.confidence}` };
      }
      return { valid: true, reason: 'Correct: project despite sarcastic misdirection' };
    },
  },

  // 7. WOW-2: Implicit project buried in a question about learning
  {
    id: 'router-wow-2',
    name: 'WOW-2: Implicit project buried in a question about learning',
    difficulty: 'wow',
    temperature: 0.1,
    maxTokens: 256,
    input: "I've been learning React for 3 months and I think I'm ready to build something real. What would a production-grade e-commerce platform need? I'm talking auth, payment processing, inventory management, the works. Maybe a mobile app too.",
    validate: (output) => {
      const parsed = parseRouterJson(output);
      if (!parsed) return { valid: false, reason: 'Output is not valid JSON' };
      if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
        return { valid: false, reason: `confidence must be a number between 0 and 1, got ${parsed.confidence}` };
      }
      if (parsed.category !== 'project') {
        return { valid: false, reason: `Expected category "project", got "${parsed.category}". Despite being phrased as a question ("what would X need?"), the user is describing what they want to BUILD (auth, payments, inventory, mobile app). The specificity and scope makes this a project, not a question or research` };
      }
      if (parsed.confidence <= 0.5) {
        return { valid: false, reason: `Expected confidence > 0.5, got ${parsed.confidence}` };
      }
      return { valid: true, reason: 'Correct: project despite question framing' };
    },
  },

  // 8. WOW-3: Code-switching multilingual with embedded intent
  {
    id: 'router-wow-3',
    name: 'WOW-3: Code-switching multilingual with embedded intent',
    difficulty: 'wow',
    temperature: 0.1,
    maxTokens: 256,
    input: "Mon chef m'a dit de créer un système de gestion des stocks avec suivi en temps réel, pero necesito que también maneje múltiples warehouses y genere reportes automáticos — oh and it needs a REST API with WebSocket updates for the dashboard. Can you start with the database schema?",
    validate: (output) => {
      const parsed = parseRouterJson(output);
      if (!parsed) return { valid: false, reason: 'Output is not valid JSON' };
      if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
        return { valid: false, reason: `confidence must be a number between 0 and 1, got ${parsed.confidence}` };
      }
      if (parsed.category !== 'project') {
        return { valid: false, reason: `Expected category "project", got "${parsed.category}". This message switches between French, Spanish, and English. The actual intent is building a complete inventory management system (multi-warehouse, real-time tracking, REST API, WebSocket, automated reports, database schema)` };
      }
      if (parsed.confidence <= 0.3) {
        return { valid: false, reason: `Expected confidence > 0.3, got ${parsed.confidence}` };
      }
      return { valid: true, reason: 'Correct: project despite multilingual code-switching' };
    },
  },

  // 9. WOW-4: Classify intent from pure emotional subtext with zero explicit keywords
  {
    id: 'router-wow-4',
    name: 'WOW-4: Classify intent from pure emotional subtext with zero explicit keywords',
    difficulty: 'wow',
    temperature: 0.1,
    maxTokens: 256,
    input: "I just... I can't anymore. Every morning it's the same thing. Open the laptop, stare at it, close it. Maybe if everything was different. Maybe if I started over completely from scratch, you know? Like, EVERYTHING. The whole thing.",
    validate: (output) => {
      const parsed = parseRouterJson(output);
      if (!parsed) return { valid: false, reason: 'Output is not valid JSON' };
      if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
        return { valid: false, reason: `confidence must be a number between 0 and 1, got ${parsed.confidence}` };
      }
      if (parsed.category !== 'chat') {
        return { valid: false, reason: `Expected category "chat", got "${parsed.category}". This contains zero technical keywords. "Started over from scratch" and "the whole thing" could be misinterpreted as a project request, but this is clearly someone venting emotionally about burnout` };
      }
      if (parsed.confidence <= 0.5) {
        return { valid: false, reason: `Expected confidence > 0.5, got ${parsed.confidence}` };
      }
      return { valid: true, reason: 'Correct: chat — pure emotional venting with no technical intent' };
    },
  },

  // 10. WOW-5: Classify a message that is simultaneously valid for 4 categories
  {
    id: 'router-wow-5',
    name: 'WOW-5: Classify a message that is simultaneously valid for 4 categories',
    difficulty: 'wow',
    temperature: 0.1,
    maxTokens: 256,
    input: "Can you look into whether it's worth building a custom React framework that compiles to WebAssembly, write a proof-of-concept compiler in Rust, and also find out if anyone has benchmarked this approach versus vanilla React? Oh and what's the current market share of WebAssembly in production apps?",
    validate: (output) => {
      const parsed = parseRouterJson(output);
      if (!parsed) return { valid: false, reason: 'Output is not valid JSON' };
      if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
        return { valid: false, reason: `confidence must be a number between 0 and 1, got ${parsed.confidence}` };
      }
      if (parsed.category !== 'project') {
        return { valid: false, reason: `Expected category "project", got "${parsed.category}". This message spans 4 categories (research, code, research, question) but the overarching intent is building something (a custom framework + compiler). Rule 6: prefer the more specific one (project > code > research > question)` };
      }
      if (parsed.confidence <= 0.3) {
        return { valid: false, reason: `Expected confidence > 0.3, got ${parsed.confidence}` };
      }
      return { valid: true, reason: 'Correct: project — priority hierarchy applied across 4 simultaneous valid intents' };
    },
  },
];
