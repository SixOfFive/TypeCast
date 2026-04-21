module.exports = [
  // 1. Core: Simple English to Spanish
  {
    id: 'translator-core-simple',
    difficulty: 'core',
    temperature: 0.3,
    maxTokens: 1000,
    input:
      'Translate the following text to Spanish. Output ONLY the translation, nothing else.\n\n"The cat sat on the mat."',
    validate(output) {
      const o = output.toLowerCase().trim();
      if (o.startsWith('here is') || o.startsWith('translation:') || o.startsWith('sure'))
        return { pass: false, reason: 'Output contains preamble instead of pure translation' };
      if (!o.includes('gato'))
        return { pass: false, reason: 'Missing "gato" (cat in Spanish)' };
      if (!o.includes('alfombra') && !o.includes('tapete') && !o.includes('estera'))
        return { pass: false, reason: 'Missing mat equivalent (alfombra/tapete/estera)' };
      return { pass: true };
    },
  },

  // 2. Core: Preserve formatting (markdown headers + bullets)
  {
    id: 'translator-core-formatting',
    difficulty: 'core',
    temperature: 0.3,
    maxTokens: 2000,
    input:
      'Translate the following markdown document to Spanish. Preserve ALL markdown formatting exactly. Output ONLY the translated document.\n\n## Shopping List\n\nItems to buy today:\n\n- Bread\n- Milk\n- Eggs\n\n## Cooking Instructions\n\nFollow these steps carefully.',
    validate(output) {
      if (!output.includes('##'))
        return { pass: false, reason: 'Markdown ## headers were not preserved' };
      if (!output.includes('- ') && !output.includes('* '))
        return { pass: false, reason: 'Bullet list markers (- or *) were not preserved' };
      const o = output.toLowerCase();
      if (o.startsWith('here is') || o.startsWith('translation:'))
        return { pass: false, reason: 'Output contains preamble instead of pure translation' };
      return { pass: true };
    },
  },

  // 3. Applied: Technical terms preserved
  {
    id: 'translator-applied-technical',
    difficulty: 'applied',
    temperature: 0.3,
    maxTokens: 1000,
    input:
      'Translate the following text to Spanish. Keep technical terms (API, POST, JSON) untranslated. Output ONLY the translation.\n\n"The API endpoint accepts POST requests with a JSON body containing the user\'s authentication token."',
    validate(output) {
      if (!output.includes('API'))
        return { pass: false, reason: 'Technical term "API" was not preserved verbatim' };
      if (!output.includes('POST'))
        return { pass: false, reason: 'Technical term "POST" was not preserved verbatim' };
      if (!output.includes('JSON'))
        return { pass: false, reason: 'Technical term "JSON" was not preserved verbatim' };
      const o = output.toLowerCase();
      if (o.startsWith('here is') || o.startsWith('translation:'))
        return { pass: false, reason: 'Output contains preamble' };
      return { pass: true };
    },
  },

  // 4. Applied: Preserve code blocks
  {
    id: 'translator-applied-code-blocks',
    difficulty: 'applied',
    temperature: 0.3,
    maxTokens: 1500,
    input:
      'Translate the following text to Spanish. Preserve code blocks exactly as-is \u2014 do NOT translate code. Output ONLY the translation.\n\nInstall the package:\n```\nnpm install express\n```\nThen import it in your file.',
    validate(output) {
      if (!output.includes('npm install express'))
        return { pass: false, reason: 'Code block content "npm install express" was modified or missing' };
      if (!output.includes('```'))
        return { pass: false, reason: 'Code block fences (```) were not preserved' };
      const o = output.toLowerCase();
      if (o.startsWith('here is') || o.startsWith('translation:'))
        return { pass: false, reason: 'Output contains preamble' };
      return { pass: true };
    },
  },

  // 5. Edge: Don't add preamble — short input
  {
    id: 'translator-edge-no-preamble',
    difficulty: 'edge',
    temperature: 0.3,
    maxTokens: 500,
    input:
      'Translate to Spanish. Output ONLY the translation, absolutely nothing else \u2014 no labels, no quotes, no explanation.\n\nHello world',
    validate(output) {
      const trimmed = output.trim();
      if (trimmed.length > 30)
        return { pass: false, reason: `Output too long (${trimmed.length} chars) \u2014 likely contains preamble` };
      const lower = trimmed.toLowerCase();
      if (lower.includes('here is') || lower.includes('translation') || lower.includes('sure'))
        return { pass: false, reason: 'Output contains English preamble words' };
      if (!lower.includes('hola') || !lower.includes('mundo'))
        return { pass: false, reason: 'Expected "Hola mundo" or close variant' };
      return { pass: true };
    },
  },

  // 6. WOW: Translate idioms by meaning, not literally
  {
    id: 'translator-wow-idiom',
    difficulty: 'wow',
    temperature: 0.3,
    maxTokens: 1500,
    input:
      'Translate the following to Spanish. Translate idioms by their MEANING, not word-for-word. Use natural Spanish equivalents. Output ONLY the translation.\n\n"It\'s raining cats and dogs outside, and I\'m feeling under the weather."',
    validate(output) {
      const o = output.toLowerCase();
      // Must NOT contain literal "cats and dogs" in Spanish
      const hasGatos = o.includes('gatos');
      const hasPerros = o.includes('perros');
      if (hasGatos && hasPerros)
        return { pass: false, reason: 'Contains literal "gatos y perros" \u2014 idiom was translated word-for-word instead of by meaning' };
      // Must convey illness/feeling unwell for "under the weather"
      const illnessWords = ['enfermo', 'enferma', 'mal', 'indispuesto', 'indispuesta', 'malestar', 'pachuch'];
      const hasIllness = illnessWords.some((w) => o.includes(w));
      if (!hasIllness)
        return { pass: false, reason: 'Missing illness-related word (enfermo/mal/indispuesto) for "under the weather" idiom' };
      if (o.startsWith('here is') || o.startsWith('translation:'))
        return { pass: false, reason: 'Output contains preamble' };
      return { pass: true };
    },
  },

  // 7. WOW: Translate a joke preserving humor not just words
  {
    id: "translator-wow-2",
    difficulty: "wow",
    temperature: 0.3,
    maxTokens: 1500,
    input:
      "Translate to Spanish. The translation must preserve the HUMOR of the joke, not just the literal words. If the pun does not work literally in Spanish, adapt it so the joke still lands. Output ONLY the translation.\n\n\"Why do programmers prefer dark mode? Because light attracts bugs.\"",
    validate(output) {
      const o = output.toLowerCase();
      if (o.startsWith("here is") || o.startsWith("translation:") || o.startsWith("sure"))
        return { pass: false, reason: "Output contains preamble instead of pure translation" };
      // Must be in Spanish — check for common Spanish words
      const hasSpanish = o.includes("programadores") || o.includes("modo oscuro") || o.includes("oscuro") || o.includes("por qu");
      if (!hasSpanish)
        return { pass: false, reason: "Output does not appear to be in Spanish" };
      // Must NOT just literally translate bugs as insects without programming connection
      const literalOnly = o.includes("insectos") && !o.includes("bug") && !o.includes("error") && !o.includes("fallo") && !o.includes("bicho");
      if (literalOnly)
        return { pass: false, reason: "Translated bugs literally as insectos without preserving the programming double-meaning" };
      // Must preserve the dual-meaning pun somehow
      const hasPunPreserved = o.includes("bug") || o.includes("error") || o.includes("fallo") || o.includes("bicho") || (o.includes("insecto") && o.includes("programa"));
      if (!hasPunPreserved)
        return { pass: false, reason: "The programming pun (bugs = software bugs + insects) was lost in translation" };
      return { pass: true };
    },
  },

  // 8. WOW: Translate legal text preserving precise legal meaning across jurisdictions
  {
    id: "translator-wow-3",
    difficulty: "wow",
    temperature: 0.3,
    maxTokens: 2000,
    input:
      "Translate to Spanish (for use in Mexico) with precise legal terminology. This is MIT-license-style legal text. Use proper Mexican legal Spanish terms. Output ONLY the translation.\n\n\"The Licensor hereby grants the Licensee a non-exclusive, royalty-free, perpetual, irrevocable license to use, copy, modify, and distribute the Software, provided that the above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.\"",
    validate(output) {
      const o = output.toLowerCase();
      if (o.startsWith("here is") || o.startsWith("translation:") || o.startsWith("sure"))
        return { pass: false, reason: "Output contains preamble instead of pure translation" };
      // Must use precise legal term: non-exclusive
      if (!o.includes("no exclusiva"))
        return { pass: false, reason: "Missing legal term \"no exclusiva\" for non-exclusive" };
      // Must use precise legal term: royalty-free
      if (!o.includes("libre de regal") && !o.includes("sin regal"))
        return { pass: false, reason: "Missing legal term for royalty-free (libre de regalias or sin regalias). Using casual \"gratis\" is not legal-precise." };
      // Must include perpetual
      if (!o.includes("perpetua") && !o.includes("perpetuo"))
        return { pass: false, reason: "Missing legal term \"perpetua/perpetuo\" for perpetual" };
      // Must include irrevocable
      if (!o.includes("irrevocable"))
        return { pass: false, reason: "Missing legal term \"irrevocable\"" };
      // Must preserve ALL-CAPS warranty disclaimer pattern
      const hasUpperDisclaimer = output.includes("TAL CUAL") || output.includes("COMO EST") || output.includes("EN EL ESTADO") || output.includes("\"AS IS\"");
      if (!hasUpperDisclaimer)
        return { pass: false, reason: "Warranty disclaimer must preserve ALL-CAPS pattern (TAL CUAL / COMO ESTA / EN EL ESTADO)" };
      return { pass: true };
    },
  },

  // 9. WOW: Translate a poem preserving meter, rhyme scheme, AND meaning
  {
    id: "translator-wow-4",
    difficulty: "wow",
    temperature: 0.3,
    maxTokens: 2000,
    input:
      "Translate to Spanish, preserving the ABAB rhyme scheme and iambic pentameter:\n\nShall I compare thee to a summer's day?\nThou art more lovely and more temperate.\nRough winds do shake the darling buds of May,\nAnd summer's lease hath all too short a date.",
    validate(output) {
      const o = output.trim();
      const lower = o.toLowerCase();
      if (lower.startsWith("here is") || lower.startsWith("translation:") || lower.startsWith("sure"))
        return { pass: false, reason: "Output contains preamble instead of pure translation" };
      // Must be in Spanish — check for theme-relevant Spanish words
      const hasSpanish = /(d\u00eda|verano|hermoso|templa|viento|mayo|breve|tiempo)/i.test(o);
      if (!hasSpanish)
        return { pass: false, reason: "Output does not contain expected Spanish words about the poem's themes (dia, verano, hermoso, viento, etc.)" };
      // Must NOT contain the English original
      if (lower.includes("shall i compare") || lower.includes("thou art more lovely"))
        return { pass: false, reason: "Output still contains the English original instead of a Spanish translation" };
      // Must have exactly 4 lines (the quatrain)
      const lines = o.split("\n").filter(function (l) { return l.trim().length > 0; });
      if (lines.length < 4)
        return { pass: false, reason: "Expected 4 lines of verse but got " + lines.length };
      // Check ABAB rhyme scheme: extract last word of each line
      var lastWords = lines.slice(0, 4).map(function (l) {
        var words = l.trim().replace(/[.,;:!?]+$/, "").split(/\s+/);
        return words[words.length - 1].toLowerCase();
      });
      // Lines 1 & 3 should share ending, lines 2 & 4 should share ending
      var ending13a = lastWords[0].slice(-3);
      var ending13b = lastWords[2].slice(-3);
      var ending24a = lastWords[1].slice(-3);
      var ending24b = lastWords[3].slice(-3);
      var rhymeAC = ending13a === ending13b || lastWords[0].slice(-2) === lastWords[2].slice(-2);
      var rhymeBD = ending24a === ending24b || lastWords[1].slice(-2) === lastWords[3].slice(-2);
      if (!rhymeAC && !rhymeBD)
        return { pass: false, reason: "ABAB rhyme scheme not detected. Line endings: [" + lastWords.join(", ") + "]. Neither A-C nor B-D pairs rhyme." };
      if (!rhymeAC)
        return { pass: false, reason: "Lines 1 and 3 do not rhyme (A-C pair). Endings: " + lastWords[0] + " / " + lastWords[2] };
      if (!rhymeBD)
        return { pass: false, reason: "Lines 2 and 4 do not rhyme (B-D pair). Endings: " + lastWords[1] + " / " + lastWords[3] };
      return { pass: true };
    },
  },

  // 10. WOW: Translate a cryptographic pun that only works in the source language
  {
    id: "translator-wow-5",
    difficulty: "wow",
    temperature: 0.3,
    maxTokens: 2000,
    input:
      "Translate to Japanese, preserving the humor:\n'Why do Java developers wear glasses? Because they can't C#.'\nNote: The humor relies on 'C#' being pronounced 'C-sharp' which sounds like 'see sharp' in English. The translation must recreate an equivalent programming language pun in Japanese that works with Japanese phonetics and wordplay conventions.",
    validate(output) {
      const o = output.trim();
      const lower = o.toLowerCase();
      if (lower.startsWith("here is") || lower.startsWith("translation:") || lower.startsWith("sure"))
        return { pass: false, reason: "Output contains preamble instead of pure translation" };
      // Must contain Japanese characters (hiragana, katakana, or kanji)
      var hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(o);
      if (!hasJapanese)
        return { pass: false, reason: "Output does not contain Japanese characters (hiragana/katakana/kanji)" };
      // Must NOT contain the literal English pun mechanism
      if (lower.includes("see sharp"))
        return { pass: false, reason: "Output contains literal 'see sharp' — the English pun was not adapted" };
      // Must contain at least one programming-related term
      var hasProgramming = /Java|Python|Ruby|\bC\b|C\+\+|JavaScript|PHP|\u30B3\u30FC\u30C9|\u30D7\u30ED\u30B0\u30E9\u30E0|\u30D7\u30ED\u30B0\u30E9\u30DE|\u30D0\u30B0|\u30A8\u30E9\u30FC|\u958B\u767A|\u8A00\u8A9E/i.test(o);
      if (!hasProgramming)
        return { pass: false, reason: "Output does not contain any programming-related term (Java, Python, Ruby, C, コード, プログラム, etc.)" };
      return { pass: true };
    },
  },
];
