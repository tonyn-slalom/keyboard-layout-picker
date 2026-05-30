import { describe, it, expect } from 'vitest';
import { median, minMaxNorm, normalizeAcrossLayouts } from '../../utils/normalizer';

describe('median', () => {
  it('returns 0 for empty array', () => {
    expect(median([])).toBe(0);
  });

  it('returns the single value', () => {
    expect(median([5])).toBe(5);
  });

  it('returns middle value for odd length', () => {
    expect(median([3, 1, 2])).toBe(2);
  });

  it('returns average of two middle values for even length', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it('handles duplicates', () => {
    expect(median([5, 5, 5])).toBe(5);
  });
});

describe('minMaxNorm', () => {
  it('returns 0 for the minimum value', () => {
    expect(minMaxNorm(0, 0, 10)).toBe(0);
  });

  it('returns 1 for the maximum value', () => {
    expect(minMaxNorm(10, 0, 10)).toBe(1);
  });

  it('returns 0.5 for midpoint', () => {
    expect(minMaxNorm(5, 0, 10)).toBe(0.5);
  });

  it('returns 0.5 when min === max', () => {
    expect(minMaxNorm(7, 7, 7)).toBe(0.5);
  });

  it('clamps values below min to 0', () => {
    expect(minMaxNorm(-5, 0, 10)).toBe(0);
  });

  it('clamps values above max to 1', () => {
    expect(minMaxNorm(15, 0, 10)).toBe(1);
  });
});

describe('normalizeAcrossLayouts', () => {
  const layouts = [
    { val: 0 },
    { val: 5 },
    { val: 10 },
  ];

  it('normalizes minimum to 0', () => {
    const norm = normalizeAcrossLayouts(layouts, l => l.val);
    expect(norm(layouts[0]!)).toBe(0);
  });

  it('normalizes maximum to 1', () => {
    const norm = normalizeAcrossLayouts(layouts, l => l.val);
    expect(norm(layouts[2]!)).toBe(1);
  });

  it('normalizes middle value to 0.5', () => {
    const norm = normalizeAcrossLayouts(layouts, l => l.val);
    expect(norm(layouts[1]!)).toBe(0.5);
  });

  it('returns 0.5 for all-equal values', () => {
    const same = [{ val: 3 }, { val: 3 }, { val: 3 }];
    const norm = normalizeAcrossLayouts(same, l => l.val);
    expect(norm(same[0]!)).toBe(0.5);
  });
});
