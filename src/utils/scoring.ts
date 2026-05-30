import type { CategoryId, ComfortProfile, Layout, RankedLayout, SequenceResult } from '../types';
import { median, stdDev, trimmedMedian, minMaxNorm, normalizeAcrossLayouts } from './normalizer';
import { qwertySimilarity } from './qwertySimilarity';

// ─── Step 1: Per-category composite score ────────────────────────────────────

/**
 * Computes a [0, 1] composite score for one category given all results across
 * all categories (needed for cross-category min-max normalization).
 */
export function computeComfortProfile(
  resultsByCategory: Partial<Record<CategoryId, SequenceResult[]>>,
): ComfortProfile {
  const categoryIds: CategoryId[] = [
    'alt', 'rollIn', 'rollOut', 'thumbAlt',
    'sfbStrong', 'sfbWeak', 'lsb', 'scissorsCenter',
    'scissorsPinky', 'redirect', 'pinky', 'skipBigram',
  ];

  const trimmedIkis: Record<string, number> = {};
  const ikiCvs: Record<string, number> = {};       // coefficient of variation (stddev/mean) → consistency
  const medianErrors: Record<string, number> = {};

  for (const cat of categoryIds) {
    const results = resultsByCategory[cat] ?? [];

    // Collect all intervals across all sequences in this category
    const allIntervals = results.flatMap(r =>
      r.keyIntervals.length > 0 ? r.keyIntervals : [r.durationMs / 5],
    ).filter(v => v > 0);

    // Trimmed median IKI: drop top 10% slowest intervals (hesitations, distractions)
    trimmedIkis[cat] = allIntervals.length > 0 ? trimmedMedian(allIntervals, 0.1) : 0;

    // Coefficient of variation: stddev / mean — lower = more rhythmic/consistent
    const mean = allIntervals.length > 0
      ? allIntervals.reduce((s, v) => s + v, 0) / allIntervals.length
      : 1;
    ikiCvs[cat] = mean > 0 ? stdDev(allIntervals) / mean : 1;

    medianErrors[cat] = results.length > 0 ? median(results.map(r => r.errorCount)) : 0;
  }

  const allIkis   = Object.values(trimmedIkis);
  const allCvs    = Object.values(ikiCvs);
  const allErrors = Object.values(medianErrors);
  const minIki = Math.min(...allIkis);  const maxIki = Math.max(...allIkis);
  const minCv  = Math.min(...allCvs);   const maxCv  = Math.max(...allCvs);
  const minErr = Math.min(...allErrors); const maxErr = Math.max(...allErrors);

  const profile = {} as ComfortProfile;
  for (const cat of categoryIds) {
    // Lower trimmed IKI = faster flow → invert
    const ikiScore         = 1 - minMaxNorm(trimmedIkis[cat]!, minIki, maxIki);
    // Lower CV = more consistent rhythm → invert
    const consistencyScore = 1 - minMaxNorm(ikiCvs[cat]!, minCv, maxCv);
    const accuracyScore    = 1 - minMaxNorm(medianErrors[cat]!, minErr, maxErr);
    profile[cat] = Math.max(0, Math.min(1,
      0.5 * ikiScore + 0.25 * consistencyScore + 0.25 * accuracyScore,
    ));
  }

  return profile;
}

// ─── Step 2: Layout stat accessors ───────────────────────────────────────────

type StatFn = (l: Layout) => number;

const POSITIVE_STAT: Record<string, StatFn> = {
  alt:      l => l.stats.altPct,
  rollIn:   l => l.stats.rollInPct,
  rollOut:  l => l.stats.rollOutPct,
  thumbAlt: l => l.stats.thumbAltPct ?? 0,
};

const NEGATIVE_STAT: Record<string, StatFn> = {
  sfbStrong:      l => l.stats.sfbPct,
  sfbWeak:        l => l.stats.skipBigramPct,   // best available proxy for ring/pinky SFB (sfb2u column)
  lsb:            l => l.stats.lsbPct,
  scissorsCenter: l => Math.max(0, l.stats.scissorsPct - l.stats.pinkyScissorsPct),
  scissorsPinky:  l => l.stats.pinkyScissorsPct,
  redirect:       l => {
    const weak = l.stats.weakRedirectPct >= 0 ? l.stats.weakRedirectPct : l.stats.redirectPct * 0.3;
    return 0.7 * l.stats.redirectPct + 0.3 * weak;
  },
  pinky:          l => l.stats.offHomePinkyPct,
  skipBigram:     l => l.stats.skipBigramPct,
};

// ─── Step 3: Layout compatibility score ──────────────────────────────────────

export interface ScoringBreakdown {
  category: CategoryId;
  direction: 'positive' | 'negative';
  userScore: number;       // from ComfortProfile, 0–1
  rawStat: number;         // actual layout stat value
  normalizedStat: number;  // 0–1 across all layouts
  contribution: number;    // contribution to total (before /12)
}

function layoutCompatibilityScore(
  layout: Layout,
  profile: ComfortProfile,
  allLayouts: Layout[],
): number {
  let score = 0;
  let count = 0;

  for (const [cat, statFn] of Object.entries(POSITIVE_STAT)) {
    const normFn = normalizeAcrossLayouts(allLayouts, statFn);
    score += profile[cat as CategoryId] * normFn(layout);
    count++;
  }

  for (const [cat, statFn] of Object.entries(NEGATIVE_STAT)) {
    const normFn = normalizeAcrossLayouts(allLayouts, statFn);
    score += (1 - profile[cat as CategoryId]) * (1 - normFn(layout));
    count++;
  }

  return count > 0 ? score / count : 0;
}

function buildBreakdown(
  layout: Layout,
  profile: ComfortProfile,
  allLayouts: Layout[],
): ScoringBreakdown[] {
  const result: ScoringBreakdown[] = [];

  for (const [cat, statFn] of Object.entries(POSITIVE_STAT)) {
    const normFn = normalizeAcrossLayouts(allLayouts, statFn);
    const normalizedStat = normFn(layout);
    const userScore = profile[cat as CategoryId];
    result.push({
      category: cat as CategoryId,
      direction: 'positive',
      userScore,
      rawStat: statFn(layout),
      normalizedStat,
      contribution: userScore * normalizedStat,
    });
  }

  for (const [cat, statFn] of Object.entries(NEGATIVE_STAT)) {
    const normFn = normalizeAcrossLayouts(allLayouts, statFn);
    const normalizedStat = normFn(layout);
    const userScore = profile[cat as CategoryId];
    result.push({
      category: cat as CategoryId,
      direction: 'negative',
      userScore,
      rawStat: statFn(layout),
      normalizedStat,
      contribution: (1 - userScore) * (1 - normalizedStat),
    });
  }

  return result.sort((a, b) => b.contribution - a.contribution);
}

// ─── Step 4: Top-reason generation ───────────────────────────────────────────

const CATEGORY_REASON_LABEL: Record<string, (layout: Layout) => string> = {
  alt:            l => `Alt ${l.stats.altPct.toFixed(1)}%`,
  rollIn:         l => `Roll-in ${l.stats.rollInPct.toFixed(1)}%`,
  rollOut:        l => `Roll-out ${l.stats.rollOutPct.toFixed(1)}%`,
  thumbAlt:       l => `Thumb-alt ${(l.stats.thumbAltPct ?? 0).toFixed(1)}%`,
  sfbStrong:      l => `SFB ${l.stats.sfbPct.toFixed(2)}%`,
  sfbWeak:        l => `SFB (weak) ${l.stats.skipBigramPct.toFixed(2)}%`,
  lsb:            l => `LSB ${l.stats.lsbPct.toFixed(2)}%`,
  scissorsCenter: l => `Scissors ${l.stats.scissorsPct.toFixed(2)}%`,
  scissorsPinky:  l => `Pinky scissors ${l.stats.pinkyScissorsPct.toFixed(2)}%`,
  redirect:       l => `Redirect ${l.stats.redirectPct.toFixed(1)}%`,
  pinky:          l => `Pinky off-home ${l.stats.offHomePinkyPct.toFixed(1)}%`,
  skipBigram:     l => `Skip bigram ${l.stats.skipBigramPct.toFixed(2)}%`,
};

function buildTopReasons(
  layout: Layout,
  profile: ComfortProfile,
  allLayouts: Layout[],
): string[] {
  // Use the same breakdown that drives ranking — top 3 by profile-weighted contribution
  // Exclude thumbAlt for layouts that have alpha thumb keys (it's a given for those layouts,
  // not a meaningful differentiator)
  const breakdown = buildBreakdown(layout, profile, allLayouts)
    .filter(b => !(b.category === 'thumbAlt' && !layout.requiresThumbCluster));
  return breakdown
    .slice(0, 3)
    .map(b => CATEGORY_REASON_LABEL[b.category]?.(layout) ?? b.category);
}

// ─── Step 5: Rank all layouts ─────────────────────────────────────────────────

export function rankLayouts(
  allLayouts: Layout[],
  profile: ComfortProfile,
  qwertyBoost: boolean,
): RankedLayout[] {
  const scored = allLayouts.map(layout => {
    const compatScore = layoutCompatibilityScore(layout, profile, allLayouts);
    const simScore = qwertySimilarity(layout.keys);
    const finalScore = qwertyBoost
      ? 0.8 * compatScore + 0.2 * simScore
      : compatScore;

    return {
      layout,
      score: Math.max(0, Math.min(1, finalScore)),
      matchPct: Math.round(Math.max(0, Math.min(1, finalScore)) * 1000) / 10,
      topReasons: buildTopReasons(layout, profile, allLayouts),
    };
  });

  return scored.sort((a, b) => {
    const diff = b.score - a.score;
    // Tie-break only on exact equality
    if (diff !== 0) return diff;
    return a.layout.stats.sfbPct - b.layout.stats.sfbPct;
  });
}

// ─── Detailed ranking (includes per-category breakdown) ──────────────────────

export interface RankedLayoutDetailed extends RankedLayout {
  breakdown: ScoringBreakdown[];
  compatScore: number;    // raw compatibility score before qwerty boost
  qwertySim: number;      // qwerty similarity [0-1]
}

export function rankLayoutsDetailed(
  allLayouts: Layout[],
  profile: ComfortProfile,
  qwertyBoost: boolean,
): RankedLayoutDetailed[] {
  const scored = allLayouts.map(layout => {
    const compatScore = layoutCompatibilityScore(layout, profile, allLayouts);
    const qwertySim = qwertySimilarity(layout.keys);
    const finalScore = qwertyBoost
      ? 0.8 * compatScore + 0.2 * qwertySim
      : compatScore;
    const clamped = Math.max(0, Math.min(1, finalScore));

    return {
      layout,
      score: clamped,
      matchPct: Math.round(clamped * 1000) / 10,
      topReasons: buildTopReasons(layout, profile, allLayouts),
      breakdown: buildBreakdown(layout, profile, allLayouts),
      compatScore,
      qwertySim,
    };
  });

  return scored.sort((a, b) => {
    const diff = b.score - a.score;
    // Tie-break only on exact equality
    if (diff !== 0) return diff;
    return a.layout.stats.sfbPct - b.layout.stats.sfbPct;
  });
}

// ─── Default comfort profile (all 0.5) ───────────────────────────────────────

export const CATEGORY_IDS: CategoryId[] = [
  'alt', 'rollIn', 'rollOut', 'thumbAlt',
  'sfbStrong', 'sfbWeak', 'lsb', 'scissorsCenter',
  'scissorsPinky', 'redirect', 'pinky', 'skipBigram',
];

export const POSITIVE_CATEGORIES = new Set<CategoryId>(['alt', 'rollIn', 'rollOut', 'thumbAlt']);

export function defaultComfortProfile(): ComfortProfile {
  return Object.fromEntries(CATEGORY_IDS.map(c => [c, 0.5])) as ComfortProfile;
}

// ─── IKI stats per category ───────────────────────────────────────────────────

export interface CategoryIkiStats {
  category:    CategoryId;
  trimmedIki:  number;   // trimmed median inter-keystroke interval (ms)
  cv:          number;   // coefficient of variation (stddev/mean), lower = more consistent
  errors:      number;   // total error count across all sequences in this category
  sampleCount: number;   // number of sequences in this category
}

export function computeIkiStats(
  resultsByCategory: Partial<Record<CategoryId, SequenceResult[]>>,
): CategoryIkiStats[] {
  return CATEGORY_IDS.map(cat => {
    const results = resultsByCategory[cat] ?? [];
    const allIntervals = results.flatMap(r =>
      r.keyIntervals.length > 0 ? r.keyIntervals : [r.durationMs / 5],
    ).filter(v => v > 0);

    const trimmedIki = allIntervals.length > 0 ? trimmedMedian(allIntervals, 0.1) : 0;
    const mean = allIntervals.length > 0
      ? allIntervals.reduce((s, v) => s + v, 0) / allIntervals.length : 1;
    const cv = mean > 0 ? stdDev(allIntervals) / mean : 0;
    const errors = results.reduce((s, r) => s + r.errorCount, 0);

    return { category: cat, trimmedIki, cv, errors, sampleCount: results.length };
  });
}
