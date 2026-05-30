import { describe, it, expect } from 'vitest';
import { computeComfortProfile, rankLayouts } from '../../utils/scoring';
import type { Layout, SequenceResult } from '../../types';

function makeResult(cat: string, wpm: number, errors = 0): SequenceResult {
  const durationMs = (6 / (wpm / 60)) * 1000;
  const intervalMs = durationMs / 5;
  return {
    sequenceId: `${cat}-01`,
    category: cat as SequenceResult['category'],
    wpm,
    errorCount: errors,
    durationMs,
    keyIntervals:  [intervalMs, intervalMs, intervalMs, intervalMs, intervalMs],
    keyTimestamps: [0, intervalMs, intervalMs * 2, intervalMs * 3, intervalMs * 4, intervalMs * 5],
  };
}

function makeLayout(id: string, overrides: Partial<Layout['stats']> = {}): Layout {
  return {
    id,
    name: id,
    source: '',
    cyanophageRef: id,
    keys: 'qwertyuiopasdfghjkl;zxcvbnm,./',
    formFactors: ['ansi'],
    requiresThumbCluster: false,
    stats: {
      sfbPct: 2.0,
      skipBigramPct: 1.0,
      skipBigram2Pct: 2.0,
      lsbPct: 1.0,
      scissorsPct: 0.5,
      pinkyScissorsPct: 0.2,
      wideScissorsPct: 0.1,
      altPct: 35.0,
      rollInPct: 25.0,
      rollOutPct: 20.0,
      redirectPct: 5.0,
      weakRedirectPct: 1.5,
      offHomePinkyPct: 3.0,
      effort: 500,
      distance: 180,
      pinkyDist: 20,
      col56Pct: 7.0,
      _dataSource: 'cyanophage',
      ...overrides,
    },
  };
}

describe('computeComfortProfile', () => {
  it('returns profile with all 12 categories', () => {
    const results = {
      alt:            [makeResult('alt', 80)],
      rollIn:         [makeResult('rollIn', 75)],
      rollOut:        [makeResult('rollOut', 70)],
      thumbAlt:       [makeResult('thumbAlt', 65)],
      sfbStrong:      [makeResult('sfbStrong', 50)],
      sfbWeak:        [makeResult('sfbWeak', 45)],
      lsb:            [makeResult('lsb', 60)],
      scissorsCenter: [makeResult('scissorsCenter', 55)],
      scissorsPinky:  [makeResult('scissorsPinky', 48)],
      redirect:       [makeResult('redirect', 52)],
      pinky:          [makeResult('pinky', 58)],
      skipBigram:     [makeResult('skipBigram', 62)],
    };
    const profile = computeComfortProfile(results);
    const keys = Object.keys(profile);
    expect(keys).toHaveLength(12);
    for (const v of Object.values(profile)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('all scores are 0.5 when all categories have equal WPM and errors', () => {
    const results = Object.fromEntries(
      ['alt','rollIn','rollOut','thumbAlt','sfbStrong','sfbWeak','lsb',
       'scissorsCenter','scissorsPinky','redirect','pinky','skipBigram']
        .map(cat => [cat, [makeResult(cat, 60)]])
    );
    const profile = computeComfortProfile(results as Parameters<typeof computeComfortProfile>[0]);
    for (const v of Object.values(profile)) {
      expect(v).toBeCloseTo(0.5);
    }
  });
});

describe('rankLayouts', () => {
  const profile = computeComfortProfile({
    alt:            [makeResult('alt', 80)],
    rollIn:         [makeResult('rollIn', 75)],
    rollOut:        [makeResult('rollOut', 70)],
    thumbAlt:       [makeResult('thumbAlt', 65)],
    sfbStrong:      [makeResult('sfbStrong', 50)],
    sfbWeak:        [makeResult('sfbWeak', 45)],
    lsb:            [makeResult('lsb', 60)],
    scissorsCenter: [makeResult('scissorsCenter', 55)],
    scissorsPinky:  [makeResult('scissorsPinky', 48)],
    redirect:       [makeResult('redirect', 52)],
    pinky:          [makeResult('pinky', 58)],
    skipBigram:     [makeResult('skipBigram', 62)],
  });

  const layouts = [
    makeLayout('a', { sfbPct: 0.5, altPct: 40 }),
    makeLayout('b', { sfbPct: 3.0, altPct: 30 }),
    makeLayout('c', { sfbPct: 1.0, altPct: 35 }),
  ];

  it('returns all layouts ranked', () => {
    const ranked = rankLayouts(layouts, profile, false);
    expect(ranked).toHaveLength(3);
  });

  it('scores are in [0, 1]', () => {
    const ranked = rankLayouts(layouts, profile, false);
    for (const r of ranked) {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
    }
  });

  it('matchPct = score * 100 rounded to 1 decimal', () => {
    const ranked = rankLayouts(layouts, profile, false);
    for (const r of ranked) {
      expect(r.matchPct).toBeCloseTo(r.score * 100, 0);
    }
  });

  it('top-ranked layout has highest score', () => {
    const ranked = rankLayouts(layouts, profile, false);
    expect(ranked[0]!.score).toBeGreaterThanOrEqual(ranked[1]!.score);
    expect(ranked[1]!.score).toBeGreaterThanOrEqual(ranked[2]!.score);
  });

  it('topReasons has 3 entries', () => {
    const ranked = rankLayouts(layouts, profile, false);
    for (const r of ranked) {
      expect(r.topReasons).toHaveLength(3);
    }
  });
});
