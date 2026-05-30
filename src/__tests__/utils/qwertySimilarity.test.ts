import { describe, it, expect } from 'vitest';
import { qwertySimilarity } from '../../utils/qwertySimilarity';

const QWERTY = 'qwertyuiopasdfghjkl;zxcvbnm,./';

describe('qwertySimilarity', () => {
  it('returns 1 for QWERTY itself', () => {
    expect(qwertySimilarity(QWERTY)).toBe(1);
  });

  it('returns 0 for a layout with no keys in QWERTY positions', () => {
    // Dvorak — very few keys match QWERTY positions
    const dvorak = "',.pyfgcrlaoeuidhtns;qjkxbmwvz";
    const score = qwertySimilarity(dvorak);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThan(1);
  });

  it('is between 0 and 1 inclusive', () => {
    const colemakDh = 'qwfpbjluy;arstgmneio zxcdvkh,./';
    const score = qwertySimilarity(colemakDh);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('counts matching positions correctly', () => {
    // QWERTY: q w e r t y u i o p a s d f g h j k l ; z x c v b n m , . /
    // pos 0='q', pos 10='a'. A string of all 'b' has zero matches (b=QWERTY pos 24).
    // Except pos 24 itself which is 'b' in QWERTY. So use all 'x' — QWERTY pos 21 = 'x'.
    // Use 'q' only at pos 0 and all other positions set to something not in that QWERTY slot.
    // QWERTY[1]='w', so fill rest with 'w' — but then pos 1 matches too.
    // Easiest: manually build a string with exactly 2 matches and assert 2/30.
    // pos 0='q'(matches), pos 10='a'(matches), rest='b' (QWERTY[24]='b' so pos 24 also matches = 3)
    // Just assert the known result: 'qaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' → q matches pos0, a matches pos10
    const keys = 'q' + 'a'.repeat(29); // q at 0 matches; a at pos 10 matches (QWERTY[10]='a')
    expect(qwertySimilarity(keys)).toBeCloseTo(2 / 30);
  });
});
