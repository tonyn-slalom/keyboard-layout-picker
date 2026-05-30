import { describe, it, expect } from 'vitest';
import { sequences } from '../../utils/sequences';
import { fingerMap } from '../../utils/fingerMap';
import type { CategoryId } from '../../types';

const SCORED_CATEGORIES: CategoryId[] = [
  'alt', 'rollIn', 'rollOut', 'thumbAlt',
  'sfbStrong', 'sfbWeak', 'lsb', 'scissorsCenter',
  'scissorsPinky', 'redirect', 'pinky', 'skipBigram',
];

describe('sequences', () => {
  it('has exactly 101 sequences total', () => {
    expect(sequences).toHaveLength(101);
  });

  it('has exactly 5 warmup sequences', () => {
    const warmup = sequences.filter(s => s.isWarmup);
    expect(warmup).toHaveLength(5);
  });

  it('has exactly 96 scored sequences', () => {
    const scored = sequences.filter(s => !s.isWarmup);
    expect(scored).toHaveLength(96);
  });

  it('has exactly 8 scored sequences per category', () => {
    for (const cat of SCORED_CATEGORIES) {
      const count = sequences.filter(s => !s.isWarmup && s.category === cat).length;
      expect(count, `category '${cat}' should have 8 scored sequences`).toBe(8);
    }
  });

  it('every sequence is exactly 6 characters', () => {
    for (const s of sequences) {
      expect(s.text.length, `${s.id} text="${s.text}"`).toBe(6);
    }
  });

  it('all non-space characters exist in fingerMap', () => {
    for (const s of sequences) {
      for (const ch of s.text) {
        if (ch !== ' ') {
          expect(fingerMap[ch], `${s.id}: char '${ch}' not in fingerMap`).toBeDefined();
        }
      }
    }
  });

  it('no duplicate text values', () => {
    const texts = sequences.map(s => s.text);
    const unique = new Set(texts);
    expect(unique.size).toBe(sequences.length);
  });

  it('thumbAlt sequences have thumbMode=true', () => {
    const thumbAlt = sequences.filter(s => s.category === 'thumbAlt' && !s.isWarmup);
    for (const s of thumbAlt) {
      expect(s.thumbMode, `${s.id} should have thumbMode=true`).toBe(true);
    }
  });

  it('non-thumbAlt sequences have thumbMode=false', () => {
    const nonThumb = sequences.filter(s => s.category !== 'thumbAlt');
    for (const s of nonThumb) {
      expect(s.thumbMode, `${s.id} should have thumbMode=false`).toBe(false);
    }
  });

  it('all sequence IDs are unique', () => {
    const ids = sequences.map(s => s.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(sequences.length);
  });

  it('warmup sequences are drawn from valid categories', () => {
    const validCats = new Set<string>([...SCORED_CATEGORIES]);
    for (const s of sequences.filter(s => s.isWarmup)) {
      expect(validCats.has(s.category), `warmup ${s.id} has invalid category`).toBe(true);
    }
  });
});
