module.exports = [
  // ===========================================================================
  // 1. Core: Basic statistics
  // ===========================================================================
  {
    id: 'data_analyst-core-basic-statistics',
    input:
      'Here are 5 numbers: 10, 20, 30, 40, 50.\n' +
      'Calculate the mean, median, and sum.',
    validate(output) {
      const text = output;
      const hasMean = /30/.test(text);
      const hasMedian = /30/.test(text);
      const hasSum = /150/.test(text);
      // Need all three values present — 30 appears for both mean and median,
      // so we also verify the words are used
      const mentionsMean = /mean|average/i.test(text);
      const mentionsMedian = /median|middle/i.test(text);
      const mentionsSum = /sum|total/i.test(text);
      if (!hasMean || !mentionsMean)
        return { pass: false, reason: 'Must state the mean is 30' };
      if (!hasMedian || !mentionsMedian)
        return { pass: false, reason: 'Must state the median is 30' };
      if (!hasSum || !mentionsSum)
        return { pass: false, reason: 'Must state the sum is 150' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 2. Core: Read a table
  // ===========================================================================
  {
    id: 'data_analyst-core-read-table',
    input:
      'Here is a revenue table:\n\n' +
      '| Product | Revenue |\n' +
      '|---------|---------|\n' +
      '| A       | $100    |\n' +
      '| B       | $200    |\n' +
      '| C       | $150    |\n' +
      '| D       | $50     |\n\n' +
      'Which product has the highest revenue?',
    validate(output) {
      const text = output;
      const mentionsB = /\bB\b|Product B/i.test(text);
      const mentions200 = /\$?200/.test(text);
      if (!mentionsB)
        return { pass: false, reason: 'Must identify Product B as the highest revenue product' };
      if (!mentions200)
        return { pass: false, reason: 'Must mention $200 or 200 as the highest revenue value' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 3. Applied: Trend analysis
  // ===========================================================================
  {
    id: 'data_analyst-applied-trend-analysis',
    input:
      'Here is monthly sales data:\n\n' +
      '| Month | Sales |\n' +
      '|-------|-------|\n' +
      '| Jan   | 100   |\n' +
      '| Feb   | 120   |\n' +
      '| Mar   | 150   |\n' +
      '| Apr   | 180   |\n' +
      '| May   | 210   |\n\n' +
      'Identify the trend in this data.',
    validate(output) {
      const text = output.toLowerCase();
      const mentionsTrend = /increas|growth|upward|rising|uptrend|grow/.test(text);
      const mentionsRange = /100.*210|210.*100|110|~?\d+%|per month|month.over.month|rate|range/.test(text);
      if (!mentionsTrend)
        return { pass: false, reason: 'Must identify an increasing/upward/growth trend' };
      if (!mentionsRange)
        return { pass: false, reason: 'Must mention the approximate growth rate or the range of the data' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 4. Applied: Comparison
  // ===========================================================================
  {
    id: 'data_analyst-applied-comparison',
    input:
      'Compare the performance of two sales regions:\n\n' +
      'North region monthly sales: 100, 110, 120\n' +
      'South region monthly sales: 200, 190, 180\n\n' +
      'Compare the two regions.',
    validate(output) {
      const text = output.toLowerCase();
      const northGrowing = /north.{0,80}(grow|increas|rising|upward|improving|trend.{0,10}up)/.test(text) ||
                           /(grow|increas|rising|upward|improving).{0,80}north/.test(text);
      const southDeclining = /south.{0,80}(declin|decreas|falling|downward|dropping|shrink|trend.{0,10}down)/.test(text) ||
                             /(declin|decreas|falling|downward|dropping|shrink).{0,80}south/.test(text);
      if (!northGrowing)
        return { pass: false, reason: 'Must identify that the North region is growing/increasing' };
      if (!southDeclining)
        return { pass: false, reason: 'Must identify that the South region is declining/decreasing' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 5. Edge: Handle missing data
  // ===========================================================================
  {
    id: 'data_analyst-edge-missing-data',
    input:
      'Calculate the average revenue from this data:\n\n' +
      '| Quarter | Revenue |\n' +
      '|---------|---------|\n' +
      '| Q1      | 1000    |\n' +
      '| Q2      | N/A     |\n' +
      '| Q3      | 1500    |\n' +
      '| Q4      | 2000    |\n' +
      '| Q5      | 1200    |\n' +
      '| Q6      | N/A     |\n' +
      '| Q7      | 1800    |\n' +
      '| Q8      | 1500    |\n\n' +
      'Calculate the average revenue.',
    validate(output) {
      const text = output.toLowerCase();
      const acknowledgesMissing = /missing|n\/a|incomplete|null|exclud|invalid|unavailable|absent|unknown|empty|omit|skipp|ignor.*n\/a|discard/.test(text);
      // Valid values: 1000, 1500, 2000, 1200, 1800, 1500 = 9000 / 6 = 1500
      const correctAverage = /1[,.]?500/.test(text);
      if (!acknowledgesMissing)
        return { pass: false, reason: 'Must acknowledge the missing/N/A values in the data' };
      if (!correctAverage)
        return { pass: false, reason: 'Must calculate the average using only valid values (9000 / 6 = 1500)' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 6. WOW: Simpson's Paradox
  // ===========================================================================
  {
    id: 'data_analyst-wow-simpsons-paradox',
    input:
      'Analyze these treatment success rates and advise which treatment is better:\n\n' +
      'Small stones:\n' +
      '  Treatment A: 81 successes out of 87 cases (93%)\n' +
      '  Treatment B: 234 successes out of 270 cases (87%)\n\n' +
      'Large stones:\n' +
      '  Treatment A: 192 successes out of 263 cases (73%)\n' +
      '  Treatment B: 55 successes out of 80 cases (69%)\n\n' +
      'Overall:\n' +
      '  Treatment A: 273 successes out of 350 cases (78%)\n' +
      '  Treatment B: 289 successes out of 350 cases (83%)\n\n' +
      'Treatment A has a higher success rate in both subgroups but a lower overall rate. ' +
      'Explain what is happening and which treatment is actually better.',
    validate(output) {
      const text = output.toLowerCase();
      const identifiesParadox = /simpson|paradox|confound|mislead|aggregat.*bias|lurking.*variable|ecological fallacy|reversal/.test(text) ||
                                (/overall.{0,60}mislead/.test(text)) ||
                                (/group.size|sample.size|proportion|distribution/.test(text) && /revers|contradict|opposite/.test(text));
      const mentionsSubgroupReversal = /better.{0,40}(both|each|every).{0,40}(sub|group|categor)/i.test(text) ||
                                       /(both|each|every).{0,40}(sub|group|categor).{0,40}better/i.test(text) ||
                                       /higher.{0,20}rate.{0,40}(both|each)/i.test(text) ||
                                       /treatment a.{0,60}(better|superior|higher|preferred)/i.test(text);
      if (!identifiesParadox)
        return { pass: false, reason: 'Must identify the paradox — mention Simpson\'s Paradox, confounding variable, misleading aggregation, or sample size imbalance causing the reversal' };
      if (!mentionsSubgroupReversal)
        return { pass: false, reason: 'Must note that Treatment A is better in both subgroups despite worse overall rate — cannot just say "Treatment B is better at 83%"' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 7. WOW-2: Detect ecological fallacy in aggregated data
  // ===========================================================================
  {
    id: 'data_analyst-wow-2',
    input:
      'Analyze this data and answer: Do people in CityA earn more than people in CityB?\n\n' +
      '| City  | Average Income | Gini Coefficient |\n' +
      '|-------|---------------|------------------|\n' +
      '| CityA | $80,000       | 0.65             |\n' +
      '| CityB | $60,000       | 0.25             |\n\n' +
      'The Gini coefficient measures income inequality (0 = perfect equality, 1 = maximum inequality).\n' +
      'CityA has a much higher Gini (0.65) indicating extreme inequality, while CityB has a low Gini (0.25) indicating relatively equal distribution.',
    validate(output) {
      const text = output.toLowerCase();
      const caveats = /inequalit|gini|distribution|ecological fallacy|average.*mislead|mislead.*average|doesn.t tell|median|skew|few.*millionaire|extreme.*wealth|pull.*up|drag.*up/.test(text);
      if (!caveats)
        return { pass: false, reason: 'Must caveat the comparison by mentioning inequality, Gini, distribution, ecological fallacy, or that averages can be misleading. Cannot just say "CityA earns more" without qualification.' };
      // Fail if it flatly says CityA earns more without any caveat
      const flatClaim = /cityA.{0,20}earn.{0,10}more|people in cityA.{0,20}(earn|make|have).{0,10}more/i.test(output);
      const hasCaveat = /however|but|caveat|caution|mislead|not necessarily|doesn.t mean|does not mean|cannot conclude|important to note|nuance/i.test(output);
      if (flatClaim && !hasCaveat)
        return { pass: false, reason: 'Made a flat claim that CityA earns more without any caveat about the ecological fallacy or inequality' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 8. WOW-3: Identify that correlation is caused by a hidden confounding variable
  // ===========================================================================
  {
    id: 'data_analyst-wow-3',
    input:
      'I have monthly data showing ice cream sales and drowning deaths. There is a strong positive correlation (r=0.95). Does ice cream cause drowning?\n\n' +
      '| Month | Ice Cream Sales ($K) | Drowning Deaths |\n' +
      '|-------|---------------------|----------------|\n' +
      '| Jan   | 12                  | 3              |\n' +
      '| Feb   | 14                  | 4              |\n' +
      '| Mar   | 22                  | 7              |\n' +
      '| Apr   | 35                  | 12             |\n' +
      '| May   | 52                  | 19             |\n' +
      '| Jun   | 68                  | 28             |\n' +
      '| Jul   | 75                  | 32             |\n' +
      '| Aug   | 70                  | 30             |\n' +
      '| Sep   | 48                  | 18             |\n' +
      '| Oct   | 28                  | 9              |\n' +
      '| Nov   | 16                  | 5              |\n' +
      '| Dec   | 13                  | 3              |\n\n' +
      'The correlation coefficient is r=0.95. Does this mean ice cream causes drowning?',
    validate(output) {
      const text = output.toLowerCase();
      const identifiesConfounder = /confound|temperature|summer|season|third variable|lurking variable|warm|hot weather|heat/.test(text);
      const rejectsCausal = /correlation.*not.*causation|does not.*cause|doesn.t.*cause|no.*causal|not.*causal|spurious|cannot conclude.*cause|ice cream.*not.*cause|no evidence.*caus/.test(text);
      if (!identifiesConfounder)
        return { pass: false, reason: 'Must identify the seasonal/temperature confounder. Both ice cream sales and drowning increase in summer due to warm weather, not because of each other.' };
      if (!rejectsCausal)
        return { pass: false, reason: 'Must explicitly reject the causal claim (correlation does not equal causation). Cannot say ice cream causes drowning.' };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 9. WOW-4: Detect that a statistically significant result is practically meaningless
  // ===========================================================================
  {
    id: "data_analyst-wow-4",
    input:
      "A/B test results:\n" +
      "Group A (control, 50,000 users): 2.01% conversion.\n" +
      "Group B (variant, 50,000 users): 2.05% conversion.\n" +
      "p-value = 0.03 (statistically significant at alpha=0.05).\n\n" +
      "The new design significantly increases conversions. Should we ship it?",
    validate(output) {
      const text = output.toLowerCase();
      const recognizesSignificance = /p.?value|statistic.*signif|signif.*at|0\.03/.test(text);
      const questionsPractical = /effect.?size|practical|meaningful|trivial|magnitude|0\.04|negligible|tiny|minuscule|immaterial/.test(text);
      if (!recognizesSignificance)
        return { pass: false, reason: "Must acknowledge the p-value is statistically significant" };
      if (!questionsPractical)
        return { pass: false, reason: "Must question practical significance — mention effect size, practical meaning, trivial magnitude, or negligible difference. Cannot just say 'significant, ship it!'" };
      return { pass: true };
    }
  },

  // ===========================================================================
  // 10. WOW-5: Identify that the data has been p-hacked through multiple comparisons
  // ===========================================================================
  {
    id: "data_analyst-wow-5",
    input:
      "We tested 20 different button colors and found that Color #17 (teal) increased clicks by 12% with p=0.04. Should we change all buttons to teal?",
    validate(output) {
      const text = output.toLowerCase();
      const detectsMultipleTesting = /multiple.*compar|bonferroni|family.?wise|correction|20.*test|type i|false positive.*expect|p.?hack/.test(text);
      const indicatesUnreliable = /not.*reliab|unreliab|cannot.*conclude|wouldn.?t.*pass|does not.*hold|not.*signif.*after|wouldn.?t.*survive|inflat|spurious|expect.*false|likely.*chance|random/.test(text);
      if (!detectsMultipleTesting)
        return { pass: false, reason: "Must mention multiple comparisons, Bonferroni correction, family-wise error rate, Type I error, or p-hacking. Cannot just accept p=0.04 at face value." };
      if (!indicatesUnreliable)
        return { pass: false, reason: "Must indicate the result is NOT reliable after correcting for multiple comparisons. Cannot just say 'p<0.05, teal wins!'" };
      return { pass: true };
    }
  }
];
