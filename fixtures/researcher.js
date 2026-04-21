// Test fixtures for the "researcher" agent.
// The researcher conducts investigation with findings, sources, and caveats.
// Must provide balanced analysis, cite tradeoffs, and admit uncertainty when appropriate.
//
// 10 tests: 2 Core, 2 Applied, 1 Edge, 5 WOW
// Each test has an inline validate(output) function.

module.exports = [

  // =========================================================================
  // 1. CORE: Simple factual — stack vs queue
  // =========================================================================
  {
    id: 'researcher-core-stack-queue',
    difficulty: 'core',
    temperature: 0.2,
    maxTokens: 1500,
    input:
`You are a researcher agent. Your job is to investigate topics and provide clear, accurate findings with proper explanations.

Research question: "What is the difference between a stack and a queue data structure?"

Provide a clear explanation covering how each data structure works and their key differences.`,
    validate(output) {
      const lower = output.toLowerCase();
      const hasFIFO = lower.includes('fifo') || lower.includes('first in first out') || lower.includes('first-in-first-out') || lower.includes('first in, first out');
      const hasLIFO = lower.includes('lifo') || lower.includes('last in first out') || lower.includes('last-in-first-out') || lower.includes('last in, first out');
      if (!hasFIFO) return { pass: false, reason: 'Missing FIFO or "first in first out" for queue' };
      if (!hasLIFO) return { pass: false, reason: 'Missing LIFO or "last in first out" for stack' };
      return { pass: true };
    }
  },

  // =========================================================================
  // 2. CORE: Comparison — REST vs GraphQL
  // =========================================================================
  {
    id: 'researcher-core-rest-graphql',
    difficulty: 'core',
    temperature: 0.2,
    maxTokens: 2000,
    input:
`You are a researcher agent. Your job is to investigate topics and provide balanced, well-sourced comparisons.

Research question: "Compare REST and GraphQL APIs"

Provide a balanced comparison covering the strengths and weaknesses of each approach.`,
    validate(output) {
      const lower = output.toLowerCase();
      const hasREST = lower.includes('rest');
      const hasGraphQL = lower.includes('graphql');
      if (!hasREST) return { pass: false, reason: 'Missing "REST"' };
      if (!hasGraphQL) return { pass: false, reason: 'Missing "GraphQL"' };
      // Check REST has at least one advantage mentioned
      const restAdvantages = /rest.{0,300}(simple|straightforward|cache|cacheable|caching|well.?established|mature|widely adopted|browser|http caching|stateless)/is.test(output);
      const restAdvantagesAlt = /(simple|cache|cacheable|caching|well.?established|mature|widely adopted|stateless).{0,300}rest/is.test(output);
      // Check GraphQL has at least one advantage mentioned
      const gqlAdvantages = /graphql.{0,300}(single endpoint|one endpoint|no over.?fetch|exact data|flexible|client.?specif|efficient|fewer requests|one request|query exactly)/is.test(output);
      const gqlAdvantagesAlt = /(single endpoint|one endpoint|no over.?fetch|exact data|flexible|client.?specif|efficient|fewer requests|one request|query exactly).{0,300}graphql/is.test(output);
      const hasRestPro = restAdvantages || restAdvantagesAlt;
      const hasGqlPro = gqlAdvantages || gqlAdvantagesAlt;
      if (!hasRestPro) return { pass: false, reason: 'Missing any advantage of REST (e.g. simple, cacheable, mature, widely adopted)' };
      if (!hasGqlPro) return { pass: false, reason: 'Missing any advantage of GraphQL (e.g. flexible, no over-fetching, single endpoint)' };
      return { pass: true };
    }
  },

  // =========================================================================
  // 3. APPLIED: Technical best practices — securing Node.js API
  // =========================================================================
  {
    id: 'researcher-applied-nodejs-security',
    difficulty: 'applied',
    temperature: 0.3,
    maxTokens: 2500,
    input:
`You are a researcher agent. Your job is to investigate best practices and provide actionable, well-organized findings.

Research question: "What are the best practices for securing a Node.js REST API?"

Provide a thorough list of security best practices with explanations for each.`,
    validate(output) {
      // Count how many security topics are mentioned (need >= 3)
      let count = 0;
      // authentication / JWT / OAuth
      if (/authenticat|jwt|json web token|oauth|auth token|bearer token/i.test(output)) count++;
      // input validation / sanitization
      if (/input.?validat|sanitiz|validate.?input|user.?input|express.?validator/i.test(output)) count++;
      // HTTPS / TLS / SSL
      if (/https|tls|ssl|transport.?layer/i.test(output)) count++;
      // rate limiting
      if (/rate.?limit/i.test(output)) count++;
      // CORS
      if (/cors|cross.?origin/i.test(output)) count++;
      // helmet
      if (/helmet/i.test(output)) count++;
      // SQL injection / parameterized queries
      if (/sql.?inject|parameterized.?quer|prepared.?statement|query.?param/i.test(output)) count++;
      if (count < 3) return { pass: false, reason: `Only ${count}/7 security topics mentioned (need >= 3): auth/JWT/OAuth, input validation, HTTPS/TLS, rate limiting, CORS, helmet, SQL injection/parameterized queries` };
      return { pass: true };
    }
  },

  // =========================================================================
  // 4. APPLIED: With tradeoffs — SQL vs NoSQL for social media
  // =========================================================================
  {
    id: 'researcher-applied-sql-nosql',
    difficulty: 'applied',
    temperature: 0.3,
    maxTokens: 2500,
    input:
`You are a researcher agent. Your job is to investigate questions with nuance, presenting tradeoffs honestly.

Research question: "Should I use a SQL or NoSQL database for a social media application with complex relationships between users, posts, and comments?"

Analyze both options with their tradeoffs for this specific use case.`,
    validate(output) {
      // Must mention SQL advantage for relationships/joins
      const sqlForRelationships = /sql.{0,300}(relationship|join|relational|foreign key|referential integrity|complex quer)/is.test(output)
        || /(relationship|join|relational|foreign key|referential integrity|complex quer).{0,300}sql/is.test(output);
      // Must acknowledge NoSQL advantages OR recommend SQL with reasoning (not purely one-sided)
      const nosqlAcknowledged = /nosql.{0,300}(scal|flexib|horizontal|schema.?less|document|performan|throughput|faster)/is.test(output)
        || /(scal|flexib|horizontal|schema.?less|document|throughput).{0,300}nosql/is.test(output);
      const sqlRecommendedWithReason = /(recommend|suggest|better fit|better suited|go with|choose).{0,200}sql.{0,200}(because|since|due to|as it|relationship|join)/is.test(output)
        || /sql.{0,200}(recommend|suggest|better fit|better suited).{0,200}(because|since|due to|relationship|join)/is.test(output);
      if (!sqlForRelationships) return { pass: false, reason: 'Does not mention SQL being good for relationships/joins' };
      if (!nosqlAcknowledged && !sqlRecommendedWithReason) return { pass: false, reason: 'One-sided: does not acknowledge NoSQL advantages (scale, flexibility) and does not recommend SQL with clear reasoning' };
      return { pass: true };
    }
  },

  // =========================================================================
  // 5. EDGE: Admit uncertainty — dominant language in 2030
  // =========================================================================
  {
    id: 'researcher-edge-uncertainty',
    difficulty: 'edge',
    temperature: 0.3,
    maxTokens: 2000,
    input:
`You are a researcher agent. Your job is to investigate questions honestly, including acknowledging the limits of what can be known.

Research question: "What will be the dominant programming language in 2030?"

Provide your analysis with appropriate caveats about prediction confidence.`,
    validate(output) {
      const hasHedging = /uncertain|predict|speculate|difficult to say|impossible to know|\bmay\b|\bmight\b|\bcould\b|hard to forecast|no one can know|crystal ball|educated guess|likely but not certain|remains to be seen/i.test(output);
      if (!hasHedging) return { pass: false, reason: 'No hedging language found. Model should express uncertainty about future predictions (e.g. "uncertain", "predict", "may", "might", "could", "difficult to say")' };
      return { pass: true };
    }
  },

  // =========================================================================
  // 6. WOW: Detect a false premise — O(1) general sorting algorithm
  // =========================================================================
  {
    id: 'researcher-wow-false-premise',
    difficulty: 'wow',
    temperature: 0.3,
    maxTokens: 2500,
    input:
`You are a researcher agent. Your job is to investigate topics thoroughly and report accurate findings, even if that means correcting the premise of a question.

Research question: "Research the best practices for implementing the O(1) general sorting algorithm"

Investigate this topic and provide your findings.`,
    validate(output) {
      const lower = output.toLowerCase();
      // Must identify that O(1) general sorting doesn't exist
      const identifiesFlaw =
        /no.{0,20}o\(1\).{0,30}sort/i.test(output)
        || /o\(1\).{0,30}sort.{0,30}(not exist|doesn.?t exist|does not exist|impossible|not possible|cannot|can.?t)/i.test(output)
        || /doesn.?t exist.{0,50}o\(1\)/i.test(output)
        || /flawed|false premise|incorrect premise|misconception|incorrect assumption|no such.{0,20}algorithm/i.test(output)
        || /o\(n\s*log\s*n\)|n\s*log\s*n.{0,30}(lower bound|minimum|best.?case|optimal|theoretical limit)/i.test(output)
        || /(lower bound|minimum|optimal|theoretical).{0,50}(n\s*log\s*n|o\(n\s*log\s*n\))/i.test(output)
        || /comparison.?based.{0,40}(sort|algorithm).{0,80}(o\(n\s*log\s*n\)|n\s*log\s*n|cannot|lower bound)/i.test(output)
        || /no.{0,10}general.{0,20}sort.{0,30}o\(1\)/i.test(output);
      // Catastrophic failure: just writes step-by-step "best practices" without questioning
      const catastrophicFail =
        /best practices for.{0,20}o\(1\).{0,20}sort.{0,10}(:|step|1\.|first)/i.test(output)
        || (/step 1.{0,100}step 2.{0,100}step 3/i.test(output) && !/flaw|premise|not exist|impossible|incorrect|misconception|lower bound/i.test(output));
      if (catastrophicFail) return { pass: false, reason: 'Catastrophic failure: model wrote "best practices for O(1) sorting" without questioning the false premise' };
      if (!identifiesFlaw) return { pass: false, reason: 'Does not identify that O(1) general sorting is impossible. Should mention the premise is flawed, O(n log n) lower bound, or that no such algorithm exists' };
      return { pass: true };
    }
  },

  // =========================================================================
  // 7. WOW-2: Identify survivorship bias in methodology
  // =========================================================================
  {
    id: 'researcher-wow-2',
    difficulty: 'wow',
    temperature: 0.3,
    maxTokens: 2500,
    input:
`You are a researcher agent. Your job is to investigate topics thoroughly, including identifying methodological flaws in research questions.

Research question: "Research which JavaScript frameworks are the best choices in 2025 by looking at which ones have been around the longest and have the most GitHub stars."

Investigate this topic and provide your findings.`,
    validate(output) {
      const o = output.toLowerCase();
      const identifiesBias =
        /survivorship/i.test(output) ||
        /survivor.{0,10}bias/i.test(output) ||
        /selection.?bias/i.test(output) ||
        /popular.{0,20}not.{0,20}best/i.test(output) ||
        /stars.{0,20}not.{0,20}quality/i.test(output) ||
        /popularity.{0,20}(not|doesn.?t|does not).{0,20}(mean|equal|indicate|guarantee).{0,20}quality/i.test(output) ||
        /longevity.{0,20}(not|doesn.?t|does not).{0,20}(mean|equal|indicate|guarantee)/i.test(output) ||
        (o.includes('methodology') && (o.includes('flaw') || o.includes('bias') || o.includes('problem'))) ||
        (o.includes('dead') && o.includes('framework')) ||
        (o.includes('abandoned') && o.includes('framework'));
      // Catastrophic failure: just lists frameworks by age/stars without questioning the methodology
      const catastrophicFail =
        !identifiesBias &&
        /1\..{0,50}(react|angular|vue|jquery|backbone)/i.test(output) &&
        /2\..{0,50}(react|angular|vue|jquery|backbone)/i.test(output);
      if (catastrophicFail)
        return { pass: false, reason: 'Catastrophic failure: model just listed frameworks by age/stars without identifying survivorship bias or methodological flaw' };
      if (!identifiesBias)
        return { pass: false, reason: 'Must identify survivorship bias, selection bias, or note that popularity/longevity does not equal quality' };
      return { pass: true };
    }
  },

  // =========================================================================
  // 8. WOW-3: Detect factual impossibility — SHA-256 is not a sorting algorithm
  // =========================================================================
  {
    id: 'researcher-wow-3',
    difficulty: 'wow',
    temperature: 0.3,
    maxTokens: 2500,
    input:
`You are a researcher agent. Your job is to investigate topics thoroughly and report accurate findings, even if that means correcting the premise of a question.

Research question: "Research the performance characteristics of the SHA-256 hashing algorithm for sorting large datasets. I need to know how SHA-256's O(n log n) comparison-based sorting compares to quicksort for datasets over 1TB."

Investigate this topic and provide your findings.`,
    validate(output) {
      const o = output.toLowerCase();
      const identifiesFlaw =
        /sha.?256.{0,30}(is not|isn.?t|not a|cannot|doesn.?t|does not).{0,30}sort/i.test(output) ||
        /not.{0,20}sort.{0,20}algorithm/i.test(output) ||
        /hash.{0,30}(not|cannot|doesn.?t|isn.?t).{0,30}sort/i.test(output) ||
        /hash.{0,20}(and|vs|versus|not).{0,20}sort.{0,20}(are|is|different|distinct|separate)/i.test(output) ||
        /(incorrect|false|flawed|wrong).{0,20}premise/i.test(output) ||
        /conflat(e|es|ing).{0,30}(hash|sort)/i.test(output) ||
        (o.includes('sha') && o.includes('hash') && /not.{0,30}sort|cannot sort|doesn.?t sort/i.test(output)) ||
        (/hashing algorithm/i.test(output) && /not.{0,20}(a |for )?sort/i.test(output));
      // Catastrophic failure: actually "researches" SHA-256 sorting performance
      const catastrophicFail =
        !identifiesFlaw &&
        /sha.?256.{0,50}(sort|sorting).{0,50}(performance|characteristic|benchmark|comparison|faster|slower)/i.test(output);
      if (catastrophicFail)
        return { pass: false, reason: 'Catastrophic failure: model researched "SHA-256 sorting performance" without recognizing SHA-256 is a hashing algorithm, not a sorting algorithm' };
      if (!identifiesFlaw)
        return { pass: false, reason: 'Must identify that SHA-256 is a hashing algorithm, not a sorting algorithm, and that the premise is incorrect' };
      return { pass: true };
    }
  },

  // =========================================================================
  // 9. WOW-4: Identify methodological flaws in a plausible study design
  // =========================================================================
  {
    id: 'researcher-wow-4',
    difficulty: 'wow',
    temperature: 0.3,
    maxTokens: 3000,
    input:
`You are a researcher agent. Your job is to investigate claims and studies, evaluating their methodology and findings with rigorous critical thinking.

Research the findings of this study: "We measured developer productivity by comparing lines of code written per day between developers using AI coding assistants vs those not using them, across 500 developers over 6 months. The AI group wrote 47% more lines of code per day. We also measured bug rates and found no significant difference. Conclusion: AI coding assistants increase productivity by 47% with no quality tradeoff."

Evaluate the methodology and findings.`,
    validate(output) {
      // Must identify at least 3 of 5 methodological flaws
      let count = 0;
      // 1. Lines of code is a bad productivity metric
      if (/lines of code.*metric|LOC.*metric|metric.*flawed/i.test(output)) count++;
      // 2. Selection bias / no randomization
      if (/selection bias|self-select|not.*random/i.test(output)) count++;
      // 3. Hawthorne / observer effect
      if (/Hawthorne|observer|being.*studi/i.test(output)) count++;
      // 4. Code quality beyond bug rate
      if (/maintainab|readab|technical debt|code quality.*beyond|quality.*more than.*bug/i.test(output)) count++;
      // 5. Time period too short for long-term effects
      if (/long.?term|6 months.*short|short.*period/i.test(output)) count++;
      if (count < 3) return { pass: false, reason: `Only ${count}/5 methodological flaws identified (need >= 3): LOC as bad metric, selection bias, Hawthorne effect, quality beyond bugs, short time period` };
      return { pass: true };
    }
  },

  // =========================================================================
  // 10. WOW-5: Detect circular citation and fabricated consensus
  // =========================================================================
  {
    id: 'researcher-wow-5',
    difficulty: 'wow',
    temperature: 0.3,
    maxTokens: 3000,
    input:
`You are a researcher agent. Your job is to investigate claims, verify sources, and assess the reliability of research findings.

Research this claim: "According to multiple independent studies, microservices architectures reduce deployment failures by 73% compared to monoliths (Smith 2019, Johnson 2020, Park 2021). This finding has been consistently replicated across industries."

Verify this claim and assess its reliability.`,
    validate(output) {
      // Must identify at least 2 of 4 issues
      let count = 0;
      // 1. Fabricated / unverifiable citations
      if (/(fabricat|cannot.*verif|unverif|don't exist|fake|made.?up|not.*real)/i.test(output)) count++;
      // 2. Suspiciously precise statistic
      if (/(suspicio|precise|73%.*exact|specific.*number)/i.test(output)) count++;
      // 3. Unfalsifiable / overgeneralized claim
      if (/(unfalsif|overgeneraliz|too.*broad|universal.*claim|depends.*on)/i.test(output)) count++;
      // 4. Circular citation risk
      if (/(circular.*cit|cite.*each|cross.*cit)/i.test(output)) count++;
      if (count < 2) return { pass: false, reason: `Only ${count}/4 issues identified (need >= 2): fabricated citations, suspiciously precise stat, unfalsifiable/overgeneralized claim, circular citation` };
      return { pass: true };
    }
  },

];
