# Three Best Approaches to Limit Pattern Results

## Problem
The pattern analysis is returning too many main patterns, creating an overwhelming list that's hard to scan and act upon.

## Current State
- Patterns are sorted by percentage (descending)
- No limit on number of main patterns returned
- Sub-patterns are already limited to 6 per main pattern
- Examples are limited to 5 per pattern

---

## Approach 1: Top N by Combined Impact Score ⭐ (Recommended)

### Concept
Limit to top N patterns (e.g., 5-8) using a **combined score** that balances:
- **Frequency** (how often it appears)
- **Impact** (average stress/energy level)
- **Recency** (how recent the occurrences are)

### Formula
```
Score = (frequency × 0.4) + (avgImpact × 0.4) + (recencyBonus × 0.2)
```

### Implementation
```javascript
// After sorting by percentage, limit to top N
const topPatterns = sortedPatterns
  .map(pattern => ({
    ...pattern,
    combinedScore: (
      (pattern.frequency / totalMentions) * 0.4 +
      (pattern.avgImpact / 10) * 0.4 +
      (pattern.recentMentions / pattern.frequency) * 0.2
    )
  }))
  .sort((a, b) => b.combinedScore - a.combinedScore)
  .slice(0, 7); // Top 7 patterns
```

### Pros
- ✅ Shows most **actionable** patterns (high frequency + high impact)
- ✅ Prevents information overload (fixed, predictable limit)
- ✅ Easy to understand ("Top 7 patterns")
- ✅ Fast to compute
- ✅ Works well for both small and large datasets

### Cons
- ⚠️ Might hide important but less frequent patterns
- ⚠️ Fixed number might not adapt to data size

### Best For
- **Most users** - provides clear, actionable insights
- **Mobile UI** - fits well in limited screen space
- **Quick decision making** - focuses on what matters most

---

## Approach 2: Percentage Threshold + Minimum Frequency

### Concept
Only show patterns that meet **both** criteria:
1. **Minimum percentage threshold** (e.g., ≥5% of all mentions)
2. **Minimum frequency** (e.g., appears at least 3 times)

Then optionally cap at top N (e.g., 10) to prevent overflow.

### Implementation
```javascript
const MIN_PERCENTAGE = 5; // 5% of total mentions
const MIN_FREQUENCY = 3; // Must appear at least 3 times
const MAX_PATTERNS = 10; // Safety cap

const filteredPatterns = sortedPatterns
  .filter(pattern => 
    pattern.percentage >= MIN_PERCENTAGE && 
    pattern.frequency >= MIN_FREQUENCY
  )
  .slice(0, MAX_PATTERNS);
```

### Pros
- ✅ **Statistically meaningful** - filters out noise
- ✅ **Adaptive** - automatically adjusts to data quality
- ✅ **Prevents spam** - eliminates one-off mentions
- ✅ **Data-driven** - based on actual significance

### Cons
- ⚠️ Might show too few patterns if data is sparse
- ⚠️ Might show too many if data is dense
- ⚠️ Requires tuning thresholds
- ⚠️ Less predictable number of results

### Best For
- **Data quality focus** - ensures only meaningful patterns
- **Scientific accuracy** - statistical significance
- **Users with lots of data** - filters noise effectively

---

## Approach 3: Adaptive Limiting Based on Data Size

### Concept
Dynamically adjust the limit based on:
- **Total number of entries** (more data = more patterns allowed)
- **Pattern distribution** (if patterns are evenly distributed, show more)
- **Cumulative coverage** (stop when top patterns cover 80% of mentions)

### Implementation
```javascript
const calculateAdaptiveLimit = (patterns, totalMentions) => {
  // Base limit based on data size
  let limit = 5; // Minimum
  if (totalMentions > 20) limit = 7;
  if (totalMentions > 50) limit = 10;
  if (totalMentions > 100) limit = 12;

  // Adjust based on pattern distribution
  const top3Coverage = patterns.slice(0, 3)
    .reduce((sum, p) => sum + p.percentage, 0);
  
  // If top 3 cover >70%, show fewer patterns
  if (top3Coverage > 70) limit = Math.min(limit, 6);
  
  // If patterns are evenly distributed, show more
  const distributionVariance = calculateVariance(
    patterns.map(p => p.percentage)
  );
  if (distributionVariance < 50) limit += 2;

  // Stop when cumulative coverage reaches 80%
  let cumulative = 0;
  let effectiveLimit = limit;
  for (let i = 0; i < patterns.length && i < limit; i++) {
    cumulative += patterns[i].percentage;
    if (cumulative >= 80) {
      effectiveLimit = i + 1;
      break;
    }
  }

  return Math.min(effectiveLimit, limit);
};
```

### Pros
- ✅ **Smart adaptation** - adjusts to your data
- ✅ **Efficient coverage** - stops when most data is explained
- ✅ **Scalable** - works for any data size
- ✅ **Balanced** - considers multiple factors

### Cons
- ⚠️ More complex to implement
- ⚠️ Less predictable (variable number of results)
- ⚠️ Requires testing and tuning
- ⚠️ Might be harder to explain to users

### Best For
- **Power users** - want comprehensive but not overwhelming
- **Variable data sizes** - works across different usage patterns
- **Long-term use** - adapts as user's data grows

---

## Comparison Matrix

| Aspect | Approach 1: Top N | Approach 2: Threshold | Approach 3: Adaptive |
|--------|-------------------|------------------------|----------------------|
| **Simplicity** | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| **Predictability** | ★★★★★ | ★★★☆☆ | ★★☆☆☆ |
| **Actionability** | ★★★★★ | ★★★★☆ | ★★★★☆ |
| **Data Quality** | ★★★☆☆ | ★★★★★ | ★★★★☆ |
| **Mobile UX** | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| **Implementation** | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| **Scalability** | ★★★☆☆ | ★★★★☆ | ★★★★★ |

---

## Recommendation

**Start with Approach 1 (Top N by Combined Score)** because:
1. ✅ Simplest to implement and understand
2. ✅ Provides consistent, predictable results
3. ✅ Best for mobile UI (fixed, manageable list)
4. ✅ Focuses on most actionable patterns
5. ✅ Easy to adjust N (start with 7, can change to 5 or 10)

**Consider Approach 2** if:
- Users report too many low-quality patterns
- You want statistical significance
- Data quality is a priority

**Consider Approach 3** if:
- You have time for more complex implementation
- Users have very variable data sizes
- You want the most sophisticated solution

---

## Implementation Notes

### Where to Apply
Apply the limiting in `hierarchicalPatternService.js` after sorting but before returning:
```javascript
// In analyzeHierarchicalPatterns, after line 87:
const sortedPatterns = patternsArray.sort((a, b) => {
  const aPct = a?.percentage || 0;
  const bPct = b?.percentage || 0;
  return bPct - aPct;
});

// ADD LIMITING HERE
const limitedPatterns = limitPatterns(sortedPatterns, allSources.length);

const result = { 
  type, 
  totalMentions: allSources.length, 
  mainPatterns: limitedPatterns, // Use limited instead of sorted
  mode,
  discoveryMethod
};
```

### Configuration
Make the limit configurable:
```javascript
const PATTERN_LIMITS = {
  fast: 7,    // Fast mode: top 7
  deep: 10,   // Deep mode: top 10 (more comprehensive)
  minPercentage: 3, // Minimum 3% to be included
  minFrequency: 2    // Must appear at least 2 times
};
```

