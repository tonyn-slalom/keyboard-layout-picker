---
description: "Use when building the scoring engine, results page, or recommendation algorithm for the keyboard layout picker. Covers per-category composite scoring, layout compatibility scoring, normalization, QWERTY similarity, RadarChart, RecommendationCard, and top-5 results. Use for 'scoring', 'recommendation', 'results page', 'radar chart', 'match percentage', 'composite score', 'normalizer', 'QWERTY similarity'."
tools: [read, edit, search, execute]
name: "KLP Scoring"
---
You are the scoring engine and results page engineer for the Keyboard Layout Picker. Build the utils and results UI components that turn raw test metrics into layout recommendations.

## Session Start: Read Before Write
1. Read `src/types.ts` first — import `Layout`, `LayoutStats`, `ComfortProfile`, `RankedLayout`, `CategoryId` from there; never redefine
2. Read `src/utils/scoring.ts` if it exists — only add what is missing
3. Read `src/data/layouts.json` to understand actual stat ranges before writing normalization logic

## Files to Create
- `src/utils/scoring.ts` — per-category score + layout compatibility score
- `src/utils/normalizer.ts` — min-max normalization helpers
- `src/utils/qwertySimilarity.ts` — QWERTY key-overlap score
- `src/components/Results/RadarChart.tsx` — 10-axis spider chart
- `src/components/Results/RecommendationCard.tsx` — top-5 layout cards
- `src/pages/ResultsPage.tsx` — full results page

## Scoring Algorithm

### Step 1 — Per-Category Composite Score
```ts
// Input: SequenceResult[] for one category (warm-ups excluded)
// Output: compositeScore in [0, 1]

medianWpm = median(results.map(r => r.wpm))
medianErrors = median(results.map(r => r.errorCount))

// Normalize across all 12 categories (pass in all categories' medians for min-max)
wpmScore = (medianWpm - minMedianWpm) / (maxMedianWpm - minMedianWpm)  // 0–1
accuracyScore = 1 - (medianErrors - minErrors) / (maxErrors - minErrors)  // 0–1

// Edge case: if all categories equal, default to 0.5
compositeScore = 0.6 * wpmScore + 0.4 * accuracyScore
```
WPM weighted more because errors already slow WPM (word restarts).

### Step 2 — Layout Compatibility Score
```ts
// Category → layout stat mapping
// sfbStrong/sfbWeak both map to sfbPct but contribute weighted halves
// scissorsCenter/scissorsPinky both map to scissorsPct but contribute weighted halves
const POSITIVE_CATS = {
  alt:             (l: Layout) => l.stats.altPct,
  rollIn:          (l: Layout) => l.stats.rollInPct,
  rollOut:         (l: Layout) => l.stats.rollOutPct,
  thumbAlt:        (l: Layout) => l.stats.thumbAltPct ?? 0,
};
const NEGATIVE_CATS = {
  sfbStrong:       (l: Layout) => l.stats.sfbPct,       // index/middle share the same stat
  sfbWeak:         (l: Layout) => l.stats.sfbPct,       // ring/pinky — same stat, separate user score
  lsb:             (l: Layout) => l.stats.lsbPct,
  scissorsCenter:  (l: Layout) => l.stats.scissorsPct,  // center fingers share stat
  scissorsPinky:   (l: Layout) => l.stats.scissorsPct,  // pinky scissors — separate user score
  redirect:        (l: Layout) => 0.7 * l.stats.redirectPct + 0.3 * l.stats.weakRedirectPct,
  pinky:           (l: Layout) => l.stats.offHomePinkyPct,
  skipBigram:      (l: Layout) => l.stats.skipBigramPct,
};
// Note: sfbStrong and sfbWeak intentionally share the sfbPct stat but carry independent user comfort scores.
// A layout with low sfbPct benefits from BOTH a high sfbStrong score AND a high sfbWeak score.
// This correctly double-weights sfb avoidance for users who are bothered by both strong and weak SFBs.

// Normalize each stat across all 41 layouts
function norm(values: number[], v: number): number {
  const min = Math.min(...values), max = Math.max(...values);
  if (max === min) return 0.5;
  return (v - min) / (max - min);
}

function layoutScore(layout: Layout, profile: ComfortProfile, allLayouts: Layout[]): number {
  let score = 0;
  for (const [cat, statFn] of Object.entries(POSITIVE_CATS)) {
    const allVals = allLayouts.map(l => statFn(l));
    score += profile[cat as CategoryId] * norm(allVals, statFn(layout));
  }
  for (const [cat, statFn] of Object.entries(NEGATIVE_CATS)) {
    const allVals = allLayouts.map(l => statFn(l));
    score += (1 - profile[cat as CategoryId]) * (1 - norm(allVals, statFn(layout)));
  }
  return score / 12; // 12 categories total
}
```

### Step 3 — QWERTY Similarity (`qwertySimilarity.ts`)
```ts
// Count keys in same position as QWERTY / 30
const QWERTY_KEYS = 'qwertyuiopasdfghjkl;zxcvbnm,./';
export function qwertySimilarity(layoutKeys: string): number {
  return [...layoutKeys].filter((k, i) => k === QWERTY_KEYS[i]).length / 30;
}
```

### Step 4 — Final Score with Optional QWERTY Similarity Toggle
```ts
finalScore = qwertyBoost
  ? 0.8 * layoutScore + 0.2 * qwertySimilarity
  : layoutScore;
```

### Step 5 — Ranking
1. Sort all 41 layouts by `finalScore` descending
2. Tie-break (within 0.01 of each other): rank by lowest `sfbPct`
3. Return top 5

## Results Page Layout

### Comfort Profile Radar Chart
- **12 axes**: alt, rollIn, rollOut, thumbAlt, sfbStrong, sfbWeak, lsb, scissorsCenter, scissorsPinky, redirect, pinky, skipBigram
- Axes grouped visually: positives (top half), negatives (bottom half)
- Single filled polygon per user's compositeScore per category
- Axis labels include score value (e.g. "SFB-Weak 0.82")
- Use Recharts `RadarChart` + `Radar` + `PolarGrid` + `PolarAngleAxis`
- Dark theme: dark background, light polygon fill with opacity

### Recommendation Cards (top 5)
Each card shows:
- Layout name + 🦾 badge if thumb cluster
- Match % (large badge, color-coded: >75% green, 50–75% yellow, <50% red)
- Top 3 differentiating reasons (pick the 3 stats where this layout differs most from the field in user's favor)
  e.g. "Low SFBs: 0.68%", "High alternation: 37.7%", "No scissors: 0.4%"
- Mini keyboard viz (`<KeyboardViz size="sm" />`)
- "View full stats" button → navigate to `/browse/{id}`
- "Open in Cyanophage" button → `https://cyanophage.github.io/?layout={cyanophageRef}`

### QWERTY Similarity Toggle
- Checkbox: "Prioritize easy transition from QWERTY"
- When toggled, re-rank layouts using `finalScore` formula above
- Cards re-animate to new positions

## Guarded Route
`/results` must redirect to `/test/run` if no results exist in app state (use React Router loader or a context check).

## Normalizer Helpers (`normalizer.ts`)
```ts
export function median(values: number[]): number
export function minMaxNorm(value: number, min: number, max: number): number
export function normalizeAcrossLayouts<T>(
  layouts: T[],
  statFn: (l: T) => number
): (l: T) => number   // returns a closure that normalizes a single layout's stat
```

## Constraints
- DO NOT use `any` types
- All score values must be clamped to [0, 1]
- Edge cases: single layout in data, all layouts with same stat → default to 0.5
